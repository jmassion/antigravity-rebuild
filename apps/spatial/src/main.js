// Spatial Lab — hash-routed scene shell.
// #corridor | #orbit | #void | #motion ; no hash = launcher.
import { createCore } from './core.js';
import { corridorScene } from './scenes/corridor.js';
import { orbitScene } from './scenes/orbit.js';
import { voidScene } from './scenes/void.js';
import { motionScene } from './scenes/motion.js';

const SCENES = {
  corridor: { make: corridorScene, title: 'Corridor Gallery', sub: 'the portfolio as architecture' },
  orbit: { make: orbitScene, title: 'Orbit Formations', sub: 'constellation of projects' },
  void: { make: voidScene, title: 'Void Room', sub: 'shared shape sandbox' },
  motion: { make: motionScene, title: 'Motion Lab', sub: 'four camera souls' },
};

const $ = (s) => document.querySelector(s);
const canvas = $('#stage');
const core = createCore(canvas);
let current = null;

// UI facade handed to scenes.
export const ui = {
  setButtons(buttons) {
    // buttons: [{label, key?, on?, onClick}]
    const wrap = $('#hud-right');
    wrap.innerHTML = '';
    for (const b of buttons) {
      const el = document.createElement('button');
      el.className = 'hbtn' + (b.on ? ' on' : '');
      el.textContent = b.label;
      el.addEventListener('click', () => b.onClick(el));
      wrap.appendChild(el);
    }
    return [...wrap.children];
  },
  setHint(html) {
    const h = $('#hint');
    h.innerHTML = html;
    h.hidden = !html;
  },
  crosshair(show) { $('#crosshair').style.display = show ? 'block' : 'none'; },
  showInfo(project) {
    const el = $('#info');
    const portfolio = `../../#p/${project.slug}`;
    const openable = project.embed && project.embed.type !== 'none';
    const appURL = project.embed?.type === 'local' ? `../../${encodeURI(project.embed.path)}`
      : project.embed?.type === 'remote' ? project.embed.url : null;
    el.innerHTML = `
      <div class="cat">${project.category}</div>
      <h3>${project.name}</h3>
      <p>${project.tagline ?? ''}</p>
      <div class="row">
        ${openable && appURL ? `<a href="${appURL}" target="_blank" rel="noopener">Launch app ↗</a>` : ''}
        <a href="${portfolio}" target="_blank" rel="noopener" style="background:rgba(255,255,255,0.1)">Portfolio card</a>
        <button class="ghost" id="info-x">✕</button>
      </div>`;
    el.classList.add('show');
    $('#info-x').addEventListener('click', () => ui.hideInfo());
  },
  hideInfo() { $('#info').classList.remove('show'); },
};

async function route() {
  const key = location.hash.replace('#', '');
  const def = SCENES[key];
  ui.hideInfo();
  ui.setHint('');
  ui.crosshair(false);

  if (!def) {
    // back to launcher
    $('#launcher').classList.remove('gone');
    $('#hud').hidden = true;
    core.stop();
    if (current) { core.setScene(null); current = null; }
    document.title = 'Spatial Lab — AntiGravity';
    return;
  }

  const fade = $('#fade');
  fade.classList.add('on');
  await new Promise((r) => setTimeout(r, 360));

  $('#launcher').classList.add('gone');
  $('#hud').hidden = false;
  $('#hud-title').textContent = def.title;
  $('#hud-sub').textContent = def.sub;
  document.title = `${def.title} — Spatial Lab`;

  const scene = await def.make({ core, ui, canvas });
  core.setScene(scene);
  core.start();
  fade.classList.remove('on');
}

document.querySelectorAll('.scene-card').forEach((c) =>
  c.addEventListener('click', () => { location.hash = c.dataset.scene; })
);
window.addEventListener('hashchange', route);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && location.hash) {
    if (document.pointerLockElement) return; // let pointer lock exit first
    location.hash = '';
  }
});

// Persistent "exit" button in HUD-left: click title to go home.
$('#hud-left').style.cursor = 'pointer';
$('#hud-left').addEventListener('click', () => { location.hash = ''; });

route();
