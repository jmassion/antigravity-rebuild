// Motion Lab — v2 of "3D Mouse Mastery".
// Preserved idea: one place to *feel* different camera/cursor control schemes.
// Four camera souls over a single obstacle field: Orbit, Fly, Rail, Chase.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { purge, dotTexture } from '../core.js';

export async function motionScene({ ui }) {
  const three = new THREE.Scene();
  three.background = new THREE.Color(0x07070d);
  three.fog = new THREE.FogExp2(0x07070d, 0.02);

  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(0, 8, 22);

  three.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xcfd6ff, 2.4);
  sun.position.set(8, 16, 6);
  three.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: 0x0b0b16, roughness: 0.5, metalness: 0.6 })
  );
  ground.rotation.x = -Math.PI / 2;
  three.add(ground);
  const grid = new THREE.GridHelper(120, 60, 0x232346, 0x101020);
  grid.position.y = 0.01;
  three.add(grid);

  /* ── obstacle field ── */
  const field = new THREE.Group();
  const rng = mulberry(42);
  const palette = [0x7c6cff, 0x06b6d4, 0x34d399, 0xf59e0b, 0xf472b6];
  const hoverables = [];
  for (let i = 0; i < 46; i++) {
    const kind = Math.floor(rng() * 3);
    const h = 1.5 + rng() * 7;
    const geo = kind === 0 ? new THREE.BoxGeometry(1.4, h, 1.4)
      : kind === 1 ? new THREE.CylinderGeometry(0.7, 0.9, h, 18)
      : new THREE.ConeGeometry(0.9, h, 5);
    const color = palette[Math.floor(rng() * palette.length)];
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x14141f, roughness: 0.4, metalness: 0.5, emissive: color, emissiveIntensity: 0.06,
    }));
    const a = rng() * Math.PI * 2, r = 6 + rng() * 42;
    m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
    m.userData.baseEmissive = 0.06;
    field.add(m);
    hoverables.push(m);
  }
  three.add(field);

  // floating target rings
  const rings = [];
  for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.09, 10, 40),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.7 })
    );
    const a = (i / 8) * Math.PI * 2;
    ring.position.set(Math.cos(a) * 24, 4 + Math.sin(i * 2.4) * 2.5, Math.sin(a) * 24);
    ring.lookAt(0, ring.position.y, 0);
    rings.push(ring);
    three.add(ring);
  }

  // chase ball
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 28, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1, emissive: 0x7c6cff, emissiveIntensity: 0.35 })
  );
  three.add(ball);
  const trailGeo = new THREE.BufferGeometry();
  const trailN = 120;
  const trailPos = new Float32Array(trailN * 3);
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  three.add(new THREE.Points(trailGeo, new THREE.PointsMaterial({
    size: 0.32, map: dotTexture('#a5b4fc'), transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));

  // rail curve
  const rail = new THREE.CatmullRomCurve3(
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * (18 + (i % 2) * 10), 3.5 + (i % 3) * 3, Math.sin(a) * (18 + ((i + 1) % 2) * 10));
    }),
    true, 'catmullrom', 0.6
  );
  const railLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(rail.getPoints(220)),
    new THREE.LineBasicMaterial({ color: 0x2e2e5e, transparent: true, opacity: 0.7 })
  );
  three.add(railLine);

  /* ── control modes ── */
  const canvasEl = document.querySelector('#stage');
  const controls = new OrbitControls(camera, canvasEl);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  let mode = 'orbit';
  let railT = 0;
  const fly = { vel: new THREE.Vector3(), yaw: 0, pitch: -0.15, keys: new Set() };

  const HINTS = {
    orbit: '<kbd>drag</kbd> rotate · <kbd>scroll</kbd> zoom · <kbd>right-drag</kbd> pan — the workhorse',
    fly: '<kbd>click</kbd> to lock pointer · <kbd>WASD</kbd> move <kbd>QE</kbd> down/up · <kbd>mouse</kbd> look · <kbd>esc</kbd> release',
    rail: '<kbd>scroll</kbd> scrub along the rail — cinematic dolly, camera on tracks',
    chase: 'hands off — the camera hunts the comet with damped pursuit',
  };

  function setMode(m) {
    if (document.pointerLockElement) document.exitPointerLock();
    mode = m;
    controls.enabled = m === 'orbit';
    ui.crosshair(m === 'fly');
    ui.setHint(HINTS[m]);
    if (m === 'fly') {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      fly.yaw = Math.atan2(-dir.x, -dir.z);
      fly.pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
    }
    btns.forEach((b, i) => b.classList.toggle('on', ['orbit', 'fly', 'rail', 'chase'][i] === m));
  }

  const btns = ui.setButtons([
    { label: 'orbit', on: true, onClick: () => setMode('orbit') },
    { label: 'fly', onClick: () => setMode('fly') },
    { label: 'rail', onClick: () => setMode('rail') },
    { label: 'chase', onClick: () => setMode('chase') },
  ]);
  ui.setHint(HINTS.orbit);

  const onClick = () => {
    if (mode === 'fly' && !document.pointerLockElement) canvasEl.requestPointerLock();
  };
  const onMouseMove = (e) => {
    if (mode === 'fly' && document.pointerLockElement === canvasEl) {
      fly.yaw -= e.movementX * 0.0022;
      fly.pitch = THREE.MathUtils.clamp(fly.pitch - e.movementY * 0.0022, -1.45, 1.45);
    }
    mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  };
  const onKeyDown = (e) => fly.keys.add(e.code);
  const onKeyUp = (e) => fly.keys.delete(e.code);
  const onWheel = (e) => { if (mode === 'rail') railT = (railT + e.deltaY * 0.00022 + 1) % 1; };

  addEventListener('click', onClick);
  addEventListener('mousemove', onMouseMove);
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);
  addEventListener('wheel', onWheel, { passive: true });

  // hover pulse (raycast feedback — the "cursor mastery" part)
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;

  function update(dt, t) {
    // comet path
    const bt = t * 0.25;
    ball.position.set(Math.cos(bt) * 20 + Math.sin(bt * 2.3) * 5, 3.2 + Math.sin(bt * 1.7) * 2, Math.sin(bt) * 20 + Math.cos(bt * 1.9) * 5);
    trailPos.copyWithin(3, 0, (trailN - 1) * 3);
    trailPos[0] = ball.position.x; trailPos[1] = ball.position.y; trailPos[2] = ball.position.z;
    trailGeo.attributes.position.needsUpdate = true;

    for (const r of rings) r.rotation.z += dt * 0.6;

    if (mode === 'orbit') controls.update();
    if (mode === 'fly') {
      const speed = fly.keys.has('ShiftLeft') ? 22 : 10;
      const f = new THREE.Vector3(-Math.sin(fly.yaw), 0, -Math.cos(fly.yaw));
      const r = new THREE.Vector3(-f.z, 0, f.x);
      const wish = new THREE.Vector3();
      if (fly.keys.has('KeyW')) wish.add(f);
      if (fly.keys.has('KeyS')) wish.sub(f);
      if (fly.keys.has('KeyD')) wish.add(r);
      if (fly.keys.has('KeyA')) wish.sub(r);
      if (fly.keys.has('KeyE')) wish.y += 1;
      if (fly.keys.has('KeyQ')) wish.y -= 1;
      wish.normalize().multiplyScalar(speed);
      fly.vel.x = THREE.MathUtils.damp(fly.vel.x, wish.x, 6, dt);
      fly.vel.y = THREE.MathUtils.damp(fly.vel.y, wish.y, 6, dt);
      fly.vel.z = THREE.MathUtils.damp(fly.vel.z, wish.z, 6, dt);
      camera.position.addScaledVector(fly.vel, dt);
      camera.position.y = Math.max(0.6, camera.position.y);
      camera.quaternion.setFromEuler(new THREE.Euler(fly.pitch, fly.yaw, 0, 'YXZ'));
    }
    if (mode === 'rail') {
      const p = rail.getPointAt(railT);
      const ahead = rail.getPointAt((railT + 0.02) % 1);
      camera.position.lerp(p, 1 - Math.exp(-6 * dt));
      camera.lookAt(ahead.x * 0.3, 2.5, ahead.z * 0.3);
    }
    if (mode === 'chase') {
      const behind = ball.position.clone().add(new THREE.Vector3(Math.cos(t * 0.25 + 2.6) * 7, 2.6, Math.sin(t * 0.25 + 2.6) * 7));
      camera.position.x = THREE.MathUtils.damp(camera.position.x, behind.x, 2.2, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, behind.y, 2.2, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, behind.z, 2.2, dt);
      camera.lookAt(ball.position);
    }

    // raycast emissive feedback
    ray.setFromCamera(mode === 'fly' ? new THREE.Vector2(0, 0) : mouse, camera);
    const hit = ray.intersectObjects(hoverables)[0]?.object ?? null;
    if (hit !== hovered) hovered = hit;
    for (const m of hoverables) {
      m.material.emissiveIntensity = THREE.MathUtils.damp(
        m.material.emissiveIntensity, m === hovered ? 0.7 : m.userData.baseEmissive, 8, dt
      );
    }
  }

  function dispose() {
    removeEventListener('click', onClick);
    removeEventListener('mousemove', onMouseMove);
    removeEventListener('keydown', onKeyDown);
    removeEventListener('keyup', onKeyUp);
    removeEventListener('wheel', onWheel);
    if (document.pointerLockElement) document.exitPointerLock();
    controls.dispose();
    ui.crosshair(false);
    purge(three);
  }

  return { three, camera, update, dispose };
}

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
