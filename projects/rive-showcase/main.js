/**
 * AI-Built Interactive Showcase
 * Every demo below was written entirely by AI.
 * 
 * 4 demos:
 *  1. Gravity Particle Galaxy — cursor-driven particle physics
 *  2. Procedural Waveform — layered sine waves with noise
 *  3. Spring Physics Mesh — draggable cloth simulation
 *  4. Generative Mandala — polar-coordinate procedural art
 */

// ============================================================
// Utility
// ============================================================
function resizeCanvas(canvas) {
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { w, h, ctx, dpr };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// ============================================================
// DEMO 1: Gravity Particle Galaxy
// ============================================================
function initGalaxy() {
  const canvas = document.getElementById('demo-galaxy');
  if (!canvas) return;
  let { w, h, ctx } = resizeCanvas(canvas);

  const countEl = document.getElementById('galaxy-count');
  const fpsEl = document.getElementById('galaxy-fps');
  const amountSlider = document.getElementById('galaxy-amount');
  const amountVal = document.getElementById('galaxy-amount-val');
  const gravitySlider = document.getElementById('galaxy-gravity');
  const gravityVal = document.getElementById('galaxy-gravity-val');

  let mouse = { x: w / 2, y: h / 2, down: false };
  let gravityReversed = false;
  let particles = [];
  let targetCount = 1500;
  let gravityStrength = 30;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * Math.min(w, h) * 0.4 + 50;
      this.x = w / 2 + Math.cos(angle) * dist;
      this.y = h / 2 + Math.sin(angle) * dist;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.radius = Math.random() * 2 + 0.5;
      this.hue = 220 + Math.random() * 80;
      this.alpha = Math.random() * 0.6 + 0.4;
      this.life = 1;
    }
    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distSq = dx * dx + dy * dy + 1;
      const dist = Math.sqrt(distSq);
      const force = (gravityStrength * 100) / distSq;
      const dir = gravityReversed ? -1 : 1;

      this.vx += (dx / dist) * force * dir;
      this.vy += (dy / dist) * force * dir;

      // Damping
      this.vx *= 0.995;
      this.vy *= 0.995;

      this.x += this.vx;
      this.y += this.vy;

      // Wrap
      if (this.x < -10) this.x = w + 10;
      if (this.x > w + 10) this.x = -10;
      if (this.y < -10) this.y = h + 10;
      if (this.y > h + 10) this.y = -10;
    }
    draw(ctx) {
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      const hue = this.hue + speed * 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + speed * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${this.alpha * 0.8})`;
      ctx.fill();

      // Motion trail
      if (speed > 1) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${Math.min(speed * 0.05, 0.3)})`;
        ctx.lineWidth = this.radius * 0.5;
        ctx.stroke();
      }
    }
  }

  function spawnParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function burst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const p = new Particle();
      p.x = x;
      p.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.hue = 300 + Math.random() * 60;
      p.radius = Math.random() * 3 + 1;
      particles.push(p);
    }
  }

  spawnParticles(targetCount);

  // FPS counter
  let lastTime = performance.now();
  let frameCount = 0;
  let fps = 60;

  function loop() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime = now;
    }

    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, w, h);

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    // Cursor glow
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
    grad.addColorStop(0, gravityReversed ? 'rgba(244, 114, 182, 0.12)' : 'rgba(129, 140, 248, 0.12)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(mouse.x - 80, mouse.y - 80, 160, 160);

    if (countEl) countEl.textContent = particles.length;
    if (fpsEl) fpsEl.textContent = fps;

    requestAnimationFrame(loop);
  }
  loop();

  // Events
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    burst(e.clientX - rect.left, e.clientY - rect.top, 80);
  });

  canvas.addEventListener('dblclick', () => {
    gravityReversed = !gravityReversed;
  });

  document.getElementById('galaxy-burst')?.addEventListener('click', () => {
    burst(mouse.x, mouse.y, 150);
  });

  document.getElementById('galaxy-clear')?.addEventListener('click', () => {
    spawnParticles(targetCount);
  });

  amountSlider?.addEventListener('input', (e) => {
    targetCount = parseInt(e.target.value);
    amountVal.textContent = targetCount;
    spawnParticles(targetCount);
  });

  gravitySlider?.addEventListener('input', (e) => {
    gravityStrength = parseInt(e.target.value);
    gravityVal.textContent = gravityStrength;
  });

  window.addEventListener('resize', () => {
    ({ w, h, ctx } = resizeCanvas(canvas));
  });
}

// ============================================================
// DEMO 2: Procedural Waveform
// ============================================================
function initWaveform() {
  const canvas = document.getElementById('demo-wave');
  if (!canvas) return;
  let { w, h, ctx } = resizeCanvas(canvas);

  let freq = 6, amp = 50, layers = 4;
  let colors = ['#818cf8', '#c084fc', '#f472b6'];

  document.getElementById('wave-freq')?.addEventListener('input', (e) => {
    freq = parseInt(e.target.value);
    document.getElementById('wave-freq-val').textContent = freq;
  });
  document.getElementById('wave-amp')?.addEventListener('input', (e) => {
    amp = parseInt(e.target.value);
    document.getElementById('wave-amp-val').textContent = amp;
  });
  document.getElementById('wave-layers')?.addEventListener('input', (e) => {
    layers = parseInt(e.target.value);
    document.getElementById('wave-layers-val').textContent = layers;
  });
  document.getElementById('wave-color1')?.addEventListener('input', (e) => colors[0] = e.target.value);
  document.getElementById('wave-color2')?.addEventListener('input', (e) => colors[1] = e.target.value);
  document.getElementById('wave-color3')?.addEventListener('input', (e) => colors[2] = e.target.value);

  // Noise function (simple Perlin-style)
  function noise(x) {
    const i = Math.floor(x);
    const f = x - i;
    const t = f * f * (3 - 2 * f);
    return Math.sin(i * 127.1 + 311.7) * 0.5 + Math.sin((i + 1) * 127.1 + 311.7) * 0.5 * t;
  }

  function loop() {
    const t = performance.now() / 1000;

    // Background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const centerY = h / 2;

    for (let layer = 0; layer < layers; layer++) {
      const layerOffset = layer * 0.7;
      const layerAmp = amp * (1 - layer * 0.12);
      const col = hexToRgb(colors[layer % colors.length]);
      const alpha = 0.5 - layer * 0.06;

      // Filled waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let x = 0; x <= w; x += 2) {
        const xNorm = x / w;
        let y = 0;
        for (let f = 1; f <= 3; f++) {
          y += Math.sin(xNorm * freq * f * Math.PI + t * (2 + layer * 0.5) + layerOffset) 
               * layerAmp / f;
        }
        // Add noise modulation
        y += noise(xNorm * 10 + t + layer) * layerAmp * 0.3;
        
        // Envelope
        const envelope = Math.sin(xNorm * Math.PI);
        y *= envelope;

        ctx.lineTo(x, centerY + y);
      }

      ctx.lineTo(w, centerY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, centerY - layerAmp, 0, centerY + layerAmp);
      grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.1})`);
      grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`);
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const xNorm = x / w;
        let y = 0;
        for (let f = 1; f <= 3; f++) {
          y += Math.sin(xNorm * freq * f * Math.PI + t * (2 + layer * 0.5) + layerOffset)
               * layerAmp / f;
        }
        y += noise(xNorm * 10 + t + layer) * layerAmp * 0.3;
        y *= Math.sin(xNorm * Math.PI);

        if (x === 0) ctx.moveTo(x, centerY + y);
        else ctx.lineTo(x, centerY + y);
      }
      ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha + 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Glow dots at peaks
    for (let i = 0; i < 5; i++) {
      const xPos = (t * 40 + i * w / 5) % w;
      const xNorm = xPos / w;
      let y = 0;
      for (let f = 1; f <= 3; f++) {
        y += Math.sin(xNorm * freq * f * Math.PI + t * 2) * amp / f;
      }
      y *= Math.sin(xNorm * Math.PI);

      ctx.beginPath();
      ctx.arc(xPos, centerY + y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, 0.8)`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(xPos, centerY + y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129, 140, 248, 0.1)`;
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', () => {
    ({ w, h, ctx } = resizeCanvas(canvas));
  });
}

// ============================================================
// DEMO 3: Spring Physics Mesh
// ============================================================
function initMesh() {
  const canvas = document.getElementById('demo-mesh');
  if (!canvas) return;
  let { w, h, ctx } = resizeCanvas(canvas);

  let gridSize = 12;
  let stiffness = 0.4;
  let damping = 0.85;
  let nodes = [];
  let springs = [];
  let dragNode = null;
  let mouseX = 0, mouseY = 0;

  function createMesh() {
    nodes = [];
    springs = [];
    const spacingX = w / (gridSize + 1);
    const spacingY = h / (gridSize + 1);

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = spacingX * (col + 1);
        const y = spacingY * (row + 1);
        nodes.push({
          x, y, restX: x, restY: y,
          vx: 0, vy: 0,
          pinned: false,
          row, col
        });
      }
    }

    // Create springs between adjacent nodes
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const idx = row * gridSize + col;
        if (col < gridSize - 1) {
          springs.push({ a: idx, b: idx + 1, restLen: spacingX });
        }
        if (row < gridSize - 1) {
          springs.push({ a: idx, b: idx + gridSize, restLen: spacingY });
        }
        // Diagonal springs for stability
        if (col < gridSize - 1 && row < gridSize - 1) {
          springs.push({ a: idx, b: idx + gridSize + 1, restLen: Math.sqrt(spacingX * spacingX + spacingY * spacingY) });
        }
        if (col > 0 && row < gridSize - 1) {
          springs.push({ a: idx, b: idx + gridSize - 1, restLen: Math.sqrt(spacingX * spacingX + spacingY * spacingY) });
        }
      }
    }
  }

  createMesh();

  function loop() {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);

    // Update physics
    for (const spring of springs) {
      const a = nodes[spring.a];
      const b = nodes[spring.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const force = (dist - spring.restLen) * stiffness;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    }

    // Return-to-rest force + velocity update
    for (const node of nodes) {
      if (node === dragNode) continue;
      const rx = (node.restX - node.x) * 0.02;
      const ry = (node.restY - node.y) * 0.02;
      node.vx = (node.vx + rx) * damping;
      node.vy = (node.vy + ry) * damping;
      node.x += node.vx;
      node.y += node.vy;
    }

    // Draw springs
    for (const spring of springs) {
      const a = nodes[spring.a];
      const b = nodes[spring.b];
      const stretch = Math.abs(
        Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2) - spring.restLen
      );
      const intensity = Math.min(stretch / 30, 1);
      const hue = 220 + intensity * 80;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${0.15 + intensity * 0.3})`;
      ctx.lineWidth = 0.8 + intensity;
      ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      const size = 3 + speed * 0.5;
      const hue = 220 + speed * 15;

      // Glow
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.05 + speed * 0.02})`;
      ctx.fill();

      // Node
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${0.5 + speed * 0.1})`;
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  loop();

  // Drag handling
  function findClosestNode(x, y) {
    let closest = null;
    let minDist = 40;
    for (const node of nodes) {
      const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    return closest;
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    dragNode = findClosestNode(mouseX, mouseY);
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (dragNode) {
      dragNode.x = mouseX;
      dragNode.y = mouseY;
      dragNode.vx = 0;
      dragNode.vy = 0;
    }
  });

  canvas.addEventListener('mouseup', () => { dragNode = null; });
  canvas.addEventListener('mouseleave', () => { dragNode = null; });

  // Controls
  document.getElementById('mesh-stiffness')?.addEventListener('input', (e) => {
    stiffness = parseInt(e.target.value) / 100;
    document.getElementById('mesh-stiffness-val').textContent = e.target.value;
  });
  document.getElementById('mesh-damping')?.addEventListener('input', (e) => {
    damping = parseInt(e.target.value) / 100;
    document.getElementById('mesh-damping-val').textContent = e.target.value;
  });
  document.getElementById('mesh-size')?.addEventListener('input', (e) => {
    gridSize = parseInt(e.target.value);
    document.getElementById('mesh-size-val').textContent = gridSize;
    createMesh();
  });
  document.getElementById('mesh-reset')?.addEventListener('click', createMesh);

  window.addEventListener('resize', () => {
    ({ w, h, ctx } = resizeCanvas(canvas));
    createMesh();
  });
}

// ============================================================
// DEMO 4: Generative Mandala
// ============================================================
function initMandala() {
  const canvas = document.getElementById('demo-mandala');
  if (!canvas) return;
  let { w, h, ctx } = resizeCanvas(canvas);

  let symmetry = 8;
  let speed = 15;
  let complexity = 5;
  let seedOffset = Math.random() * 1000;
  let layerHistory = [];
  const MAX_LAYERS = 200;

  function clearMandala() {
    layerHistory = [];
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, w, h);
  }

  clearMandala();

  function drawMandalaFrame() {
    const t = performance.now() / 1000 * (speed / 15) + seedOffset;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.42;

    // Fade background slightly
    ctx.fillStyle = 'rgba(10, 10, 20, 0.02)';
    ctx.fillRect(0, 0, w, h);

    // Draw new ring
    const ringR = (t * 15) % maxR;
    const hue = (t * 30 + ringR) % 360;

    ctx.save();
    ctx.translate(cx, cy);

    for (let s = 0; s < symmetry; s++) {
      const angle = (Math.PI * 2 / symmetry) * s;
      ctx.save();
      ctx.rotate(angle);

      for (let c = 0; c < complexity; c++) {
        const cOffset = c * 0.5;
        const r = ringR + Math.sin(t * 2 + c) * 20;
        const pAngle = t * (1 + c * 0.3) + cOffset;
        const px = Math.cos(pAngle) * r;
        const py = Math.sin(pAngle) * r * 0.5;

        const dotR = 1.5 + Math.sin(t * 3 + c * 2) * 1;
        const dotHue = (hue + c * 40) % 360;
        const alpha = 0.3 + Math.sin(t + c) * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dotHue}, 70%, 65%, ${alpha})`;
        ctx.fill();

        // Connecting line to center
        if (c === 0) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `hsla(${dotHue}, 60%, 50%, 0.05)`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Petal shapes
        if (r > 30) {
          ctx.beginPath();
          const petalAngle = pAngle + Math.PI / symmetry;
          const petalR = r * 0.3;
          ctx.ellipse(
            Math.cos(petalAngle) * r * 0.7,
            Math.sin(petalAngle) * r * 0.35,
            petalR, petalR * 0.3,
            petalAngle, 0, Math.PI * 2
          );
          ctx.fillStyle = `hsla(${(dotHue + 60) % 360}, 60%, 55%, 0.03)`;
          ctx.fill();
        }
      }

      ctx.restore();
    }

    // Center glow
    const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 + Math.sin(t) * 10);
    centerGlow.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.15)`);
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(-50, -50, 100, 100);

    ctx.restore();

    requestAnimationFrame(drawMandalaFrame);
  }

  drawMandalaFrame();

  // Controls
  document.getElementById('mandala-sym')?.addEventListener('input', (e) => {
    symmetry = parseInt(e.target.value);
    document.getElementById('mandala-sym-val').textContent = symmetry;
  });
  document.getElementById('mandala-speed')?.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    document.getElementById('mandala-speed-val').textContent = speed;
  });
  document.getElementById('mandala-complex')?.addEventListener('input', (e) => {
    complexity = parseInt(e.target.value);
    document.getElementById('mandala-complex-val').textContent = complexity;
  });
  document.getElementById('mandala-new')?.addEventListener('click', () => {
    seedOffset = Math.random() * 1000;
    clearMandala();
  });
  document.getElementById('mandala-clear')?.addEventListener('click', clearMandala);

  window.addEventListener('resize', () => {
    ({ w, h, ctx } = resizeCanvas(canvas));
    clearMandala();
  });
}

// ============================================================
// DEMO 5: Interactive Button Component
// ============================================================
function initButtons() {
  // Ripple effect on all ui-btns
  document.querySelectorAll('.ui-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.disabled || btn.classList.contains('is-loading')) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Lifecycle button: always succeeds
  function runLifecycle(btnId, stateId, forceError = false) {
    const btn = document.getElementById(btnId);
    const stateEl = document.getElementById(stateId);
    if (!btn || btn.classList.contains('is-loading')) return;

    const originalLabel = btn.dataset.original;
    const labelEl = btn.querySelector('.ui-btn-label');
    const iconEl = btn.querySelector('.ui-btn-icon');

    // Loading state
    btn.classList.add('is-loading');
    if (stateEl) stateEl.textContent = 'loading...';

    const willFail = forceError ? Math.random() < 0.5 : false;
    const duration = 1500 + Math.random() * 1000;

    setTimeout(() => {
      btn.classList.remove('is-loading');

      if (willFail) {
        btn.classList.add('is-error');
        if (iconEl) iconEl.textContent = '✗';
        if (labelEl) labelEl.textContent = 'Deploy Failed';
        if (stateEl) stateEl.textContent = 'error';

        setTimeout(() => {
          btn.classList.remove('is-error');
          if (iconEl) iconEl.textContent = forceError ? '🎲' : '⚡';
          if (labelEl) labelEl.textContent = originalLabel;
          if (stateEl) stateEl.textContent = forceError ? '50/50 success or fail' : 'click me';
        }, 2000);
      } else {
        btn.classList.add('is-success');
        if (iconEl) iconEl.textContent = '✓';
        if (labelEl) labelEl.textContent = 'Mission Complete!';
        if (stateEl) stateEl.textContent = 'success';

        setTimeout(() => {
          btn.classList.remove('is-success');
          if (iconEl) iconEl.textContent = forceError ? '🎲' : '⚡';
          if (labelEl) labelEl.textContent = originalLabel;
          if (stateEl) stateEl.textContent = forceError ? '50/50 success or fail' : 'click me';
        }, 2000);
      }
    }, duration);
  }

  document.getElementById('btn-lifecycle')?.addEventListener('click', () => {
    runLifecycle('btn-lifecycle', 'btn-lifecycle-state', false);
  });

  document.getElementById('btn-lifecycle-err')?.addEventListener('click', () => {
    runLifecycle('btn-lifecycle-err', 'btn-lifecycle-err-state', true);
  });

  // Primary button lifecycle
  document.getElementById('btn-primary')?.addEventListener('click', () => {
    runLifecycle('btn-primary', 'btn-primary-state', false);
  });
}

// ============================================================
// DEMO 6: Agent Mission Control
// ============================================================
function initMissionControl() {
  const agents = [
    { id: 0, name: '🔍 Scout', totalTasks: 3, failRate: 0.1 },
    { id: 1, name: '🧠 Analyst', totalTasks: 5, failRate: 0.15 },
    { id: 2, name: '🛠️ Builder', totalTasks: 4, failRate: 0.2 },
    { id: 3, name: '🛡️ Guardian', totalTasks: 6, failRate: 0.05 },
  ];

  let missionStartTime = null;
  let uptimeInterval = null;
  let isRunning = false;
  let agentStates = agents.map(a => ({
    status: 'idle',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: a.totalTasks,
    cpu: 0,
    mem: 0,
  }));

  const logOutput = document.getElementById('mc-log-output');

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function logTimestamp() {
    if (!missionStartTime) return '00:00:00';
    const elapsed = Math.floor((Date.now() - missionStartTime) / 1000);
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function addLog(msg, type = 'info') {
    const line = document.createElement('div');
    line.className = `mc-log-line mc-log-${type}`;
    line.innerHTML = `<span class="mc-log-time">${logTimestamp()}</span><span class="mc-log-msg">${msg}</span>`;
    logOutput.appendChild(line);
    logOutput.scrollTop = logOutput.scrollHeight;

    // Cap at 50 lines
    while (logOutput.children.length > 50) {
      logOutput.removeChild(logOutput.firstChild);
    }
  }

  function updateCard(idx) {
    const card = document.getElementById(`agent-${idx}`);
    const state = agentStates[idx];
    if (!card) return;

    card.dataset.status = state.status;
    card.querySelector('.mc-status-badge').textContent =
      state.status.charAt(0).toUpperCase() + state.status.slice(1);
    card.querySelector('.mc-progress-fill').style.width = state.progress + '%';

    const metrics = card.querySelectorAll('.mc-agent-metric strong');
    if (metrics.length >= 3) {
      metrics[0].textContent = `${state.tasksCompleted}/${state.totalTasks}`;
      metrics[1].textContent = `${state.cpu}%`;
      metrics[2].textContent = `${state.mem}MB`;
    }
  }

  function updateGlobalMetrics() {
    const running = agentStates.filter(s => s.status === 'running').length;
    const completed = agentStates.filter(s => s.status === 'completed').length;
    const failed = agentStates.filter(s => s.status === 'failed').length;

    document.getElementById('mc-running').textContent = running;
    document.getElementById('mc-completed').textContent = completed;
    document.getElementById('mc-failed').textContent = failed;
  }

  function simulateAgent(idx) {
    const agent = agents[idx];
    const state = agentStates[idx];

    // Queued phase
    state.status = 'queued';
    updateCard(idx);
    addLog(`${agent.name} queued for execution`, 'warn');

    const queueDelay = 500 + Math.random() * 1500;

    setTimeout(() => {
      // Running phase
      state.status = 'running';
      state.cpu = Math.floor(20 + Math.random() * 40);
      state.mem = Math.floor(64 + Math.random() * 192);
      updateCard(idx);
      updateGlobalMetrics();
      addLog(`${agent.name} started — allocated ${state.mem}MB RAM`, 'info');

      // Progress simulation
      const taskDuration = 800 + Math.random() * 600;
      let currentTask = 0;

      function runTask() {
        currentTask++;
        state.tasksCompleted = currentTask;
        state.progress = Math.floor((currentTask / state.totalTasks) * 100);
        state.cpu = Math.floor(30 + Math.random() * 60);
        state.mem = Math.floor(64 + Math.random() * 256);
        updateCard(idx);

        const taskLabels = [
          'scraping endpoints', 'processing data', 'analyzing patterns',
          'building artifacts', 'running tests', 'deploying modules',
          'scanning vulnerabilities', 'validating output', 'compiling report'
        ];
        const label = taskLabels[Math.floor(Math.random() * taskLabels.length)];
        addLog(`${agent.name} task ${currentTask}/${state.totalTasks}: ${label}...`);

        if (currentTask < state.totalTasks) {
          setTimeout(runTask, taskDuration);
        } else {
          // Final: success or failure?
          setTimeout(() => {
            const failed = Math.random() < agent.failRate;
            if (failed) {
              state.status = 'failed';
              state.cpu = 0;
              state.progress = Math.floor((currentTask / state.totalTasks) * 100);
              updateCard(idx);
              updateGlobalMetrics();
              addLog(`${agent.name} FAILED — exit code 1`, 'error');
            } else {
              state.status = 'completed';
              state.progress = 100;
              state.cpu = 0;
              updateCard(idx);
              updateGlobalMetrics();
              addLog(`${agent.name} completed successfully ✓`, 'success');
            }

            // Check if all done
            const allDone = agentStates.every(
              s => s.status === 'completed' || s.status === 'failed'
            );
            if (allDone) {
              const completedCount = agentStates.filter(s => s.status === 'completed').length;
              const failedCount = agentStates.filter(s => s.status === 'failed').length;
              addLog(`Mission complete: ${completedCount} succeeded, ${failedCount} failed`, 
                failedCount > 0 ? 'warn' : 'success');
              isRunning = false;
              if (uptimeInterval) clearInterval(uptimeInterval);
            }
          }, 300);
        }
      }

      setTimeout(runTask, taskDuration);
    }, queueDelay);
  }

  function startMission() {
    if (isRunning) return;
    isRunning = true;
    missionStartTime = Date.now();

    // Reset states
    agentStates = agents.map(a => ({
      status: 'idle',
      progress: 0,
      tasksCompleted: 0,
      totalTasks: a.totalTasks,
      cpu: 0,
      mem: 0,
    }));
    agents.forEach((_, i) => updateCard(i));
    updateGlobalMetrics();

    logOutput.innerHTML = '';
    addLog('Mission started — initializing agents...', 'info');

    // Uptime counter
    if (uptimeInterval) clearInterval(uptimeInterval);
    uptimeInterval = setInterval(() => {
      if (!missionStartTime) return;
      const elapsed = Math.floor((Date.now() - missionStartTime) / 1000);
      document.getElementById('mc-uptime').textContent = formatTime(elapsed);
    }, 1000);

    // Stagger agent starts
    agents.forEach((agent, i) => {
      setTimeout(() => simulateAgent(i), i * 800);
    });
  }

  function resetMission() {
    isRunning = false;
    missionStartTime = null;
    if (uptimeInterval) clearInterval(uptimeInterval);
    document.getElementById('mc-uptime').textContent = '00:00';

    agentStates = agents.map(a => ({
      status: 'idle',
      progress: 0,
      tasksCompleted: 0,
      totalTasks: a.totalTasks,
      cpu: 0,
      mem: 0,
    }));
    agents.forEach((_, i) => updateCard(i));
    updateGlobalMetrics();

    logOutput.innerHTML = '';
    addLog('Mission Control reset. Press "Run All Agents" to begin.', 'info');
  }

  document.getElementById('mc-start')?.addEventListener('click', startMission);
  document.getElementById('mc-reset')?.addEventListener('click', resetMission);
}

// ============================================================
// Scroll Reveal
// ============================================================
function initScrollReveal() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  sections.forEach(s => observer.observe(s));
}

// ============================================================
// Init
// ============================================================
// RIVE BUTTON — Embed the AI-Agent-built .riv file
// ============================================================
function initRiveButton() {
  const canvas = document.getElementById('rive-button-canvas');
  if (!canvas) return;

  // Check if Rive runtime is loaded
  if (typeof rive === 'undefined') {
    console.warn('Rive runtime not loaded — skipping Rive button embed');
    const stage = canvas.closest('.rive-button-stage');
    if (stage) {
      stage.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;font-size:0.9rem;">Rive runtime loading…</div>';
    }
    return;
  }

  try {
    const r = new rive.Rive({
      src: '/rive-button.riv',
      canvas: canvas,
      autoplay: true,
      stateMachines: 'Active',
      fit: rive.Fit.Contain,
      alignment: rive.Alignment.Center,
      onLoad: () => {
        console.log('✅ Rive button loaded — AI-Agent-built component');
        r.resizeDrawingSurfaceToCanvas();
      },
      onLoadError: (err) => {
        console.warn('Rive button load error:', err);
        const stage = canvas.closest('.rive-button-stage');
        if (stage) {
          stage.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.4);padding:40px;font-size:0.9rem;">🤖 Rive file built by AI Agent — <a href="https://editor.rive.app" style="color:#818cf8">View in Rive Editor</a></div>';
        }
      }
    });

    // Resize handler
    const observer = new ResizeObserver(() => {
      r.resizeDrawingSurfaceToCanvas();
    });
    observer.observe(canvas.parentElement);
  } catch (e) {
    console.warn('Rive init error:', e);
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initGalaxy();
  initWaveform();
  initMesh();
  initMandala();
  initRiveButton();
  initButtons();
  initMissionControl();

  // Hide hints on interaction
  document.querySelectorAll('.demo-canvas').forEach(canvas => {
    canvas.addEventListener('mouseenter', () => {
      const hint = canvas.closest('.demo-canvas-wrapper')?.querySelector('.canvas-hint');
      if (hint) hint.style.opacity = '0';
    });
  });

  console.log(
    '%c✨ AI-Built Showcase — Every line written by AI',
    'background: linear-gradient(135deg, #818cf8, #c084fc); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold;'
  );
});
