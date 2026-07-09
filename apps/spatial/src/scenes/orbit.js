// Orbit Formations — v2 of "Immersive Gallery".
// Preserved ideas: multiple spatial modes for the same content, click-to-focus.
// New: WebGL panels of real portfolio projects morphing between formations.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { purge, dotTexture } from '../core.js';
import { loadCatalog, thumbTexture, CAT_COLORS } from '../catalog.js';

export async function orbitScene({ ui }) {
  const three = new THREE.Scene();
  three.background = new THREE.Color(0x07070d);
  three.fog = new THREE.FogExp2(0x07070d, 0.016);

  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(0, 4, 30);

  const controls = new OrbitControls(camera, document.querySelector('#stage'));
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 6;
  controls.maxDistance = 90;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  three.add(new THREE.AmbientLight(0xffffff, 1.6));

  // starfield
  const starGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const r = 90 + Math.random() * 80;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    sPos[i * 3 + 1] = r * Math.cos(ph);
    sPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  three.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.5, map: dotTexture('#9aa8ff'), transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));

  const projects = await loadCatalog();
  const n = projects.length;
  const geo = new THREE.PlaneGeometry(3.4, 2.25);
  const items = [];

  projects.forEach((p, i) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x1c1c2e, side: THREE.DoubleSide }));
    thumbTexture(p).then((t) => { mesh.material.map = t; mesh.material.color.set(0xffffff); mesh.material.needsUpdate = true; });

    const edge = new THREE.Mesh(
      new THREE.PlaneGeometry(3.7, 2.55),
      new THREE.MeshBasicMaterial({
        color: CAT_COLORS[p.category] ?? 0x7c6cff, transparent: true, opacity: 0.12,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      })
    );
    edge.position.z = -0.02;
    const g = new THREE.Group();
    g.add(edge); g.add(mesh);
    g.userData = { project: p, target: new THREE.Object3D(), panel: mesh, edge, i };
    items.push(g);
    three.add(g);
  });

  /* ── formations (each fills userData.target transforms) ──
     Radii scale with project count: panels are ~3.7 wide incl. glow edge,
     so each needs ≥4.3 units of arc/surface or neighbors overlap. */
  const RING_R = Math.max(14, (n * 4.3) / (2 * Math.PI));
  const HELIX_R = Math.max(11, (n * 4.3) / (2 * Math.PI) * 0.62); // ~1.6 turns share the height
  const SPHERE_R = Math.max(13, Math.sqrt((n * 4.4 * 4.4) / (4 * Math.PI)) * 1.9);
  camera.position.set(0, 6, RING_R + 16); // start comfortably outside the largest formation
  const V = new THREE.Vector3();
  const formations = {
    ring(i) {
      const a = (i / n) * Math.PI * 2;
      return { pos: V.set(Math.cos(a) * RING_R, 0, Math.sin(a) * RING_R).clone(), lookCenter: true };
    },
    helix(i) {
      const a = i * 0.42;
      return { pos: V.set(Math.cos(a) * HELIX_R, (i / n) * 26 - 13, Math.sin(a) * HELIX_R).clone(), lookCenter: true };
    },
    wall(i) {
      const cols = Math.ceil(Math.sqrt(n * 1.6));
      const x = (i % cols) - (cols - 1) / 2;
      const y = Math.floor(i / cols);
      return { pos: V.set(x * 4.1, y * 2.9 - 6, 0).clone(), lookCenter: false };
    },
    sphere(i) {
      const ph = Math.acos(1 - (2 * (i + 0.5)) / n);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      return { pos: V.set(SPHERE_R * Math.sin(ph) * Math.cos(th), SPHERE_R * Math.cos(ph), SPHERE_R * Math.sin(ph) * Math.sin(th)).clone(), lookCenter: true };
    },
  };

  let mode = 'ring';
  function apply(name) {
    mode = name;
    items.forEach((g, i) => {
      const f = formations[name](i);
      g.userData.target.position.copy(f.pos);
      if (f.lookCenter) {
        g.userData.target.lookAt(f.pos.clone().multiplyScalar(2));
      } else {
        g.userData.target.rotation.set(0, 0, 0);
      }
    });
    btns.forEach((b) => b.classList.toggle('on', b.textContent.toLowerCase() === name));
  }

  const btns = ui.setButtons(
    ['ring', 'helix', 'wall', 'sphere'].map((m) => ({
      label: m, on: m === 'ring', onClick: () => apply(m),
    })).concat([{ label: '⟳ spin', on: true, onClick: (el) => { controls.autoRotate = !controls.autoRotate; el.classList.toggle('on'); } }])
  );
  apply('ring');

  ui.setHint('<kbd>drag</kbd> orbit · <kbd>scroll</kbd> zoom · <kbd>click</kbd> project info · formations morph live · <kbd>esc</kbd> exit');

  // raycast focus
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;
  const onMove = (e) => mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  const onClick = (e) => {
    if (e.target.closest('#hud,#info,#hint')) return; // don't raycast through the UI
    if (hovered) ui.showInfo(hovered.userData.project);
  };
  addEventListener('mousemove', onMove);
  addEventListener('click', onClick);

  function update(dt, t) {
    controls.update();
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(items.map((g) => g.userData.panel))[0];
    const hg = hit ? hit.object.parent : null;
    if (hg !== hovered) { hovered = hg; document.body.style.cursor = hg ? 'pointer' : ''; }

    for (const g of items) {
      const tgt = g.userData.target;
      g.position.lerp(tgt.position, 1 - Math.exp(-4 * dt));
      g.quaternion.slerp(tgt.quaternion, 1 - Math.exp(-4 * dt));
      const s = THREE.MathUtils.damp(g.scale.x, g === hovered ? 1.25 : 1, 8, dt);
      g.scale.setScalar(s);
      g.userData.edge.material.opacity = THREE.MathUtils.damp(g.userData.edge.material.opacity, g === hovered ? 0.45 : 0.12, 8, dt);
      if (mode === 'wall') g.position.z = Math.sin(t + g.userData.i) * 0.25; // breathing wall
    }
  }

  function dispose() {
    removeEventListener('mousemove', onMove);
    removeEventListener('click', onClick);
    controls.dispose();
    document.body.style.cursor = '';
    purge(three);
  }

  return { three, camera, update, dispose };
}
