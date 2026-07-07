// Shared renderer / loop / resize for all Spatial Lab scenes.
import * as THREE from 'three';

export function createCore(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const core = {
    renderer,
    scene: null,       // active scene module { three, camera, update, dispose }
    clock: new THREE.Clock(),
    running: false,
  };

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const cam = core.scene?.camera;
    if (cam) {
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
    }
    core.scene?.onResize?.();
  });

  function frame() {
    if (!core.running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(core.clock.getDelta(), 0.05);
    const s = core.scene;
    if (s) {
      s.update(dt, core.clock.elapsedTime);
      renderer.render(s.three, s.camera);
    }
  }

  core.start = () => { if (!core.running) { core.running = true; core.clock.getDelta(); frame(); } };
  core.stop = () => { core.running = false; };

  core.setScene = (s) => {
    if (core.scene) core.scene.dispose?.();
    core.scene = s;
    if (s?.camera) {
      s.camera.aspect = window.innerWidth / window.innerHeight;
      s.camera.updateProjectionMatrix();
    }
  };

  return core;
}

// Dispose an entire THREE.Scene: geometries, materials, textures.
export function purge(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose?.();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      for (const v of Object.values(m)) v?.isTexture && v.dispose();
      m.dispose();
    }
  });
  scene.clear();
}

// Soft round sprite texture (particles).
export function dotTexture(color = '#ffffff') {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color + 'aa');
  grad.addColorStop(1, 'transparent');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Canvas-texture label (crisp text in 3D).
export function labelTexture(text, { font = '600 42px Outfit', color = '#eef0f6', pad = 24 } = {}) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + pad * 2;
  c.width = w; c.height = 80;
  const g2 = c.getContext('2d');
  g2.font = font;
  g2.fillStyle = color;
  g2.textBaseline = 'middle';
  g2.fillText(text, pad, 42);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.userData = { aspect: c.width / c.height };
  return t;
}
