// Corridor Gallery — v2 of "Spatial Corridors / Living Gallery v5".
// Preserved ideas: scroll-with-momentum travel, alcoved floating art with
// glow auras, light shafts, drifting fireflies, section color morphing.
// New: the artwork is the actual portfolio (thumbnails + deep links).
import * as THREE from 'three';
import { purge, dotTexture, labelTexture } from '../core.js';
import { loadCatalog, thumbTexture, CAT_COLORS } from '../catalog.js';

const STEP = 7;          // z-distance between alcove pairs
const W = 11;            // corridor width
const H = 7.5;           // corridor height

export async function corridorScene({ ui }) {
  const three = new THREE.Scene();
  three.background = new THREE.Color(0x07070d);
  three.fog = new THREE.Fog(0x07070d, 14, 70);

  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 200);

  const projects = await loadCatalog();
  // stable ordering: group by category so the corridor has "wings"
  const cats = [...new Set(projects.map((p) => p.category))];
  const ordered = cats.flatMap((c) => projects.filter((p) => p.category === c));
  const depth = Math.ceil(ordered.length / 2) * STEP + 30;

  /* ── architecture ── */
  const archMat = new THREE.MeshStandardMaterial({ color: 0x0d0d18, roughness: 0.85, metalness: 0.2 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.35, metalness: 0.75 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -depth / 2 + 10);
  three.add(floor);

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(depth, H), archMat);
    wall.position.set(side * W / 2, H / 2, -depth / 2 + 10);
    wall.rotation.y = -side * Math.PI / 2;
    three.add(wall);
  }
  // ribbed vault: arch rings every STEP (v5's cathedral ceiling, distilled)
  const ribGeo = new THREE.TorusGeometry(W / 2, 0.09, 8, 40, Math.PI);
  const ribMat = new THREE.MeshStandardMaterial({ color: 0x151527, roughness: 0.6, metalness: 0.5, emissive: 0x7c6cff, emissiveIntensity: 0.06 });
  for (let z = 4; z > -depth + 6; z -= STEP) {
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.set(0, H - 2.2, z);
    three.add(rib);
  }
  // glowing floor spine
  const spine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, depth),
    new THREE.MeshBasicMaterial({ color: 0x7c6cff, transparent: true, opacity: 0.55 })
  );
  spine.rotation.x = -Math.PI / 2;
  spine.position.set(0, 0.01, -depth / 2 + 10);
  three.add(spine);

  /* ── light ── */
  three.add(new THREE.AmbientLight(0x8890c0, 0.5));
  const key = new THREE.PointLight(0xbfc4ff, 60, 40, 1.8);
  key.position.set(0, H - 1.5, 0);
  three.add(key); // follows camera

  // god-ray cones (additive, cheap)
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0x8f9fff, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide,
  });
  for (let z = -6; z > -depth + 8; z -= STEP * 2.2) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4, H + 1, 20, 1, true), shaftMat);
    cone.position.set((Math.sin(z) * W) / 5, H / 2, z);
    three.add(cone);
  }

  /* ── panels (the portfolio) ── */
  const panels = [];
  const auraGeo = new THREE.PlaneGeometry(4.4, 3.05);
  const frameGeo = new THREE.PlaneGeometry(3.9, 2.6);
  const labelCache = new Map();

  ordered.forEach((p, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -8 - Math.floor(i / 2) * STEP;
    const color = new THREE.Color(CAT_COLORS[p.category] ?? 0x7c6cff);

    const group = new THREE.Group();
    group.position.set(side * (W / 2 - 0.35), 3.1, z);
    group.rotation.y = -side * Math.PI / 2;

    const aura = new THREE.Mesh(auraGeo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    aura.position.z = -0.06;
    group.add(aura);

    const panel = new THREE.Mesh(frameGeo, new THREE.MeshBasicMaterial({ color: 0x222233 }));
    panel.position.z = 0.12;
    group.add(panel);
    thumbTexture(p).then((t) => { panel.material.map = t; panel.material.color.set(0xffffff); panel.material.needsUpdate = true; });

    // pool of light on the floor beneath (v5's glow pools)
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(side * (W / 2 - 1.6), 0.02, z);
    three.add(pool);

    // name label under the art
    if (!labelCache.has(p.name)) labelCache.set(p.name, labelTexture(p.name, { font: '600 34px Outfit' }));
    const lt = labelCache.get(p.name);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6 * lt.userData.aspect * 0.28, 0.45),
      new THREE.MeshBasicMaterial({ map: lt, transparent: true, opacity: 0.85 })
    );
    label.position.set(0, -1.75, 0.12);
    group.add(label);

    group.userData = { project: p, basePos: group.position.clone(), phase: Math.random() * Math.PI * 2, panel, aura };
    panels.push(group);
    three.add(group);
  });

  // category markers floating at each wing entrance
  let ci = 0;
  for (const c of cats) {
    const idx = ordered.findIndex((p) => p.category === c);
    const z = -8 - Math.floor(idx / 2) * STEP + STEP / 2;
    const lt = labelTexture(c.toUpperCase(), { font: '700 44px Outfit', color: '#9aa1b5' });
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2 * lt.userData.aspect * 0.28, 0.6),
      new THREE.MeshBasicMaterial({ map: lt, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    m.position.set(0, H - 1.4, z);
    three.add(m);
    ci++;
  }

  /* ── fireflies ── */
  const N = 260;
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * W;
    pos[i * 3 + 1] = Math.random() * H;
    pos[i * 3 + 2] = -Math.random() * depth + 8;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const flies = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.09, map: dotTexture('#c9b8ff'), transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  three.add(flies);

  /* ── travel: scroll with momentum ── */
  let target = 0, z = 0, vel = 0;
  const zMin = -(depth - 26);
  const onWheel = (e) => { target = THREE.MathUtils.clamp(target - e.deltaY * 0.02, zMin, 0); };
  let touchY = null;
  const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    if (touchY == null) return;
    target = THREE.MathUtils.clamp(target + (e.touches[0].clientY - touchY) * 0.06, zMin, 0);
    touchY = e.touches[0].clientY;
  };
  addEventListener('wheel', onWheel, { passive: true });
  addEventListener('touchstart', onTouchStart, { passive: true });
  addEventListener('touchmove', onTouchMove, { passive: true });

  // mouse parallax look + raycast
  const mouse = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let hovered = null;
  const onMove = (e) => {
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  };
  const onClick = (e) => {
    if (e.target.closest('#hud,#info,#hint')) return; // don't raycast through the UI
    if (hovered) ui.showInfo(hovered.userData.project);
  };
  addEventListener('mousemove', onMove);
  addEventListener('click', onClick);

  ui.setHint('<kbd>scroll</kbd> travel · <kbd>hover</kbd> wake a piece · <kbd>click</kbd> open project · <kbd>esc</kbd> exit');
  ui.setButtons([
    { label: '⏮ entrance', onClick: () => { target = 0; } },
    { label: '⏭ end of hall', onClick: () => { target = zMin; } },
  ]);

  camera.position.set(0, 3.2, 6);

  function update(dt, t) {
    // momentum travel
    vel = THREE.MathUtils.damp(vel, (target - z) * 3.4, 6, dt);
    z += vel * dt;
    camera.position.z = z + 6;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x * 0.8, 4, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 3.2 + mouse.y * 0.5, 4, dt);
    camera.lookAt(camera.position.x * 0.4, 3.05, z - 8);
    key.position.set(0, H - 1.5, z + 2);

    // float + hover
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(panels.map((g) => g.userData.panel));
    const hitGroup = hits.length ? hits[0].object.parent : null;
    if (hitGroup !== hovered) {
      hovered = hitGroup;
      document.body.style.cursor = hovered ? 'pointer' : '';
    }
    for (const g of panels) {
      const { phase, aura } = g.userData;
      const isHover = g === hovered;
      g.position.y = g.userData.basePos.y + Math.sin(t * 0.9 + phase) * 0.08;
      const s = THREE.MathUtils.damp(g.scale.x, isHover ? 1.13 : 1, 8, dt);
      g.scale.setScalar(s);
      aura.material.opacity = THREE.MathUtils.damp(aura.material.opacity, isHover ? 0.4 : 0.16, 8, dt);
    }

    // fireflies drift
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3] += Math.sin(t * 0.6 + i) * 0.0015;
      arr[i * 3 + 1] += Math.cos(t * 0.5 + i * 1.7) * 0.0012;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  function dispose() {
    removeEventListener('wheel', onWheel);
    removeEventListener('touchstart', onTouchStart);
    removeEventListener('touchmove', onTouchMove);
    removeEventListener('mousemove', onMove);
    removeEventListener('click', onClick);
    document.body.style.cursor = '';
    purge(three);
  }

  return { three, camera, update, dispose };
}
