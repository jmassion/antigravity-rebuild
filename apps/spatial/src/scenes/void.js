// Void Room — v2 of the collaborative 3D sandbox.
// Preserved ideas: place/move/rotate/delete primitives in an infinite dark
// space, number keys pick shapes, state persists, other tabs sync live via
// BroadcastChannel, #room name in the portfolio URL hash → storage key.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { purge, dotTexture } from '../core.js';

const SHAPES = [
  ['box', () => new THREE.BoxGeometry(1, 1, 1)],
  ['sphere', () => new THREE.SphereGeometry(0.6, 24, 18)],
  ['cylinder', () => new THREE.CylinderGeometry(0.5, 0.5, 1.1, 24)],
  ['cone', () => new THREE.ConeGeometry(0.6, 1.2, 24)],
  ['torus', () => new THREE.TorusGeometry(0.55, 0.2, 14, 28)],
  ['knot', () => new THREE.TorusKnotGeometry(0.42, 0.13, 90, 12)],
  ['tetra', () => new THREE.TetrahedronGeometry(0.75)],
  ['octa', () => new THREE.OctahedronGeometry(0.7)],
  ['ico', () => new THREE.IcosahedronGeometry(0.7)],
];
const PALETTE = [0x7c6cff, 0x06b6d4, 0x34d399, 0xf59e0b, 0xf472b6, 0xef4444, 0xe2e8f0];

export async function voidScene({ ui }) {
  const three = new THREE.Scene();
  three.background = new THREE.Color(0x05050a);
  three.fog = new THREE.FogExp2(0x05050a, 0.035);

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(8, 7, 12);

  const controls = new OrbitControls(camera, document.querySelector('#stage'));
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };

  three.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xbfc8ff, 2.2);
  sun.position.set(6, 12, 4);
  three.add(sun);

  const grid = new THREE.GridHelper(120, 120, 0x2a2a4a, 0x14142a);
  three.add(grid);
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // ambient dust
  const dGeo = new THREE.BufferGeometry();
  const dPos = new Float32Array(400 * 3);
  for (let i = 0; i < 400; i++) {
    dPos[i * 3] = (Math.random() - 0.5) * 70;
    dPos[i * 3 + 1] = Math.random() * 14;
    dPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  three.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
    size: 0.12, map: dotTexture('#8fa0ff'), transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));

  /* ── shared state ── */
  const room = 'main';
  const storeKey = `void-room-v2:${room}`;
  const chan = 'BroadcastChannel' in window ? new BroadcastChannel(storeKey) : null;
  const objects = new Map(); // id → mesh
  let shapeIdx = 0, colorIdx = 0, selected = null;

  const objRoot = new THREE.Group();
  three.add(objRoot);

  function makeMesh(rec) {
    const geo = SHAPES.find(([n]) => n === rec.shape)?.[1]() ?? SHAPES[0][1]();
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: rec.color, roughness: 0.35, metalness: 0.4,
      emissive: rec.color, emissiveIntensity: 0.08,
    }));
    mesh.position.fromArray(rec.pos);
    mesh.rotation.y = rec.rotY ?? 0;
    mesh.scale.setScalar(rec.scale ?? 1);
    mesh.userData.rec = rec;
    return mesh;
  }

  function upsert(rec, broadcast = true) {
    const old = objects.get(rec.id);
    if (old) { objRoot.remove(old); old.geometry.dispose(); old.material.dispose(); }
    const mesh = makeMesh(rec);
    objects.set(rec.id, mesh);
    objRoot.add(mesh);
    if (broadcast) sync(rec, 'upsert');
  }
  function drop(id, broadcast = true) {
    const m = objects.get(id);
    if (!m) return;
    if (selected === m) select(null);
    objRoot.remove(m); m.geometry.dispose(); m.material.dispose();
    objects.delete(id);
    if (broadcast) sync({ id }, 'delete');
  }
  function persist() {
    localStorage.setItem(storeKey, JSON.stringify([...objects.values()].map((m) => m.userData.rec)));
  }
  function sync(rec, op) {
    persist();
    chan?.postMessage({ op, rec });
  }
  chan?.addEventListener('message', (e) => {
    const { op, rec } = e.data;
    if (op === 'upsert') upsert(rec, false);
    if (op === 'delete') drop(rec.id, false);
  });

  // restore
  try {
    for (const rec of JSON.parse(localStorage.getItem(storeKey) ?? '[]')) upsert(rec, false);
  } catch { /* fresh room */ }

  /* ── selection ring ── */
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1, 32),
    new THREE.MeshBasicMaterial({ color: 0x7c6cff, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  three.add(ring);

  function select(mesh) {
    selected = mesh;
    ring.visible = !!mesh;
    refreshButtons();
  }

  /* ── interaction ── */
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const hitP = new THREE.Vector3();
  let dragging = false, moved = false;

  const setMouse = (x, y) => mouse.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);

  function pick(x, y) {
    setMouse(x, y);
    ray.setFromCamera(mouse, camera);
    return ray.intersectObjects([...objects.values()])[0]?.object ?? null;
  }

  const onDown = (e) => {
    if (e.button !== 0 || e.target.closest('#hud,#info,#hint')) return;
    const hit = pick(e.clientX, e.clientY);
    moved = false;
    if (hit) { select(hit); dragging = true; controls.enabled = false; }
  };
  const onMove = (e) => {
    setMouse(e.clientX, e.clientY);
    if (dragging && selected) {
      moved = true;
      ray.setFromCamera(mouse, camera);
      if (ray.ray.intersectPlane(groundPlane, hitP)) {
        selected.position.x = hitP.x;
        selected.position.z = hitP.z;
      }
    }
  };
  const onUp = (e) => {
    if (dragging && selected) {
      dragging = false; controls.enabled = true;
      if (moved) {
        selected.userData.rec.pos = selected.position.toArray();
        sync(selected.userData.rec, 'upsert');
        return;
      }
    }
    dragging = false; controls.enabled = true;
    if (e.button !== 0 || e.target.closest('#hud,#info,#hint')) return;
    const hit = pick(e.clientX, e.clientY);
    if (hit) { select(hit); return; }
    // empty ground → place new shape
    setMouse(e.clientX, e.clientY);
    ray.setFromCamera(mouse, camera);
    if (ray.ray.intersectPlane(groundPlane, hitP) && hitP.length() < 55) {
      const rec = {
        id: crypto.randomUUID(),
        shape: SHAPES[shapeIdx][0],
        color: PALETTE[colorIdx],
        pos: [hitP.x, 0.6, hitP.z],
        rotY: 0,
        scale: 1,
      };
      upsert(rec);
      select(objects.get(rec.id));
    }
  };

  const onKey = (e) => {
    const k = e.key;
    if (k >= '1' && k <= '9') { shapeIdx = +k - 1; refreshButtons(); }
    if (!selected) return;
    const rec = selected.userData.rec;
    if (k === 'r' || k === 'R') { rec.rotY = (rec.rotY ?? 0) + Math.PI / 4; selected.rotation.y = rec.rotY; sync(rec, 'upsert'); }
    if (k === 'x' || k === 'X' || k === 'Backspace') drop(rec.id);
    if (k === 'c' || k === 'C') {
      colorIdx = (PALETTE.indexOf(rec.color) + 1) % PALETTE.length;
      rec.color = PALETTE[colorIdx];
      selected.material.color.set(rec.color); selected.material.emissive.set(rec.color);
      sync(rec, 'upsert');
    }
    if (k === '=' || k === '+' || k === '-') {
      rec.scale = k === '-' ? Math.max((rec.scale ?? 1) / 1.2, 0.3) : Math.min((rec.scale ?? 1) * 1.2, 4);
      selected.scale.setScalar(rec.scale);
      // keep the base on the floor — otherwise big shapes sink and small ones float
      selected.position.y = 0.6 * rec.scale;
      rec.pos = selected.position.toArray();
      sync(rec, 'upsert');
    }
  };

  addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove);
  addEventListener('pointerup', onUp);
  addEventListener('keydown', onKey);

  let btns = [];
  function refreshButtons() {
    btns = ui.setButtons([
      ...SHAPES.slice(0, 5).map(([name], i) => ({
        label: name, on: i === shapeIdx, onClick: () => { shapeIdx = i; refreshButtons(); },
      })),
      { label: shapeIdx > 4 ? `more ⟳ (${SHAPES[shapeIdx][0]})` : 'more ⟳', on: shapeIdx > 4,
        onClick: () => { shapeIdx = shapeIdx < 4 ? 5 : (shapeIdx + 1) % SHAPES.length; refreshButtons(); } },
      { label: '🗑 clear room', onClick: () => { [...objects.keys()].forEach((id) => drop(id)); } },
    ]);
  }
  refreshButtons();

  ui.setHint('<kbd>click ground</kbd> place · <kbd>drag</kbd> move · <kbd>right-drag</kbd> orbit · <kbd>1–9</kbd> shape · <kbd>R</kbd> rotate <kbd>C</kbd> color <kbd>±</kbd> size <kbd>X</kbd> delete · open a 2nd tab and watch it sync');

  function update(dt, t) {
    controls.update();
    if (selected) {
      ring.position.set(selected.position.x, 0.02, selected.position.z);
      ring.scale.setScalar((selected.userData.rec.scale ?? 1) * (1 + Math.sin(t * 4) * 0.05));
    }
    grid.material.opacity = 0.6 + Math.sin(t * 0.8) * 0.1;
    grid.material.transparent = true;
  }

  function dispose() {
    removeEventListener('pointerdown', onDown);
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('keydown', onKey);
    chan?.close();
    controls.dispose();
    document.body.style.cursor = '';
    purge(three);
  }

  return { three, camera, update, dispose };
}
