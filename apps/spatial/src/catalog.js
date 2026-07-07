// Loads the portfolio catalog + thumbnail textures so scenes can hang
// real projects on their walls. Falls back to generated art when the lab
// runs standalone (vite dev) outside the assembled portfolio site.
import * as THREE from 'three';

const CATALOG_URL = '../../catalog.json';
const THUMB_BASE = '../../thumbnails/';

let cache = null;

export async function loadCatalog() {
  if (cache) return cache;
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    cache = data.projects.filter((p) => p.slug !== 'corridors'); // don't hang ourselves on the wall
  } catch {
    cache = FALLBACK.map((name, i) => ({
      slug: `demo-${i}`,
      name,
      category: 'Demo Data',
      tagline: 'Standalone mode — run inside the portfolio for real projects.',
      status: 'concept',
    }));
  }
  return cache;
}

const loader = new THREE.TextureLoader();

export function thumbTexture(project) {
  return new Promise((resolve) => {
    if (!project.thumbnail && !project.slug.startsWith('demo-')) return resolve(makeArt(project.name));
    loader.load(
      THUMB_BASE + `${project.slug}.jpg`,
      (t) => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); },
      undefined,
      () => resolve(makeArt(project.name))
    );
  });
}

// Deterministic generative "cover art" for projects without screenshots.
function makeArt(seedText) {
  let h = 0;
  for (const ch of seedText) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, `hsl(${hue} 45% 16%)`);
  grad.addColorStop(1, `hsl(${(hue + 70) % 360} 60% 30%)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 320);
  g.globalAlpha = 0.18;
  for (let i = 0; i < 24; i++) {
    g.strokeStyle = `hsl(${(hue + i * 12) % 360} 80% 65%)`;
    g.beginPath();
    g.arc(((h >> (i % 8)) % 512), ((h >> (i % 6)) % 320), 20 + (i * 13) % 120, 0, Math.PI * 2);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.font = '700 44px Outfit';
  g.fillStyle = 'rgba(255,255,255,0.9)';
  const initials = seedText.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  g.fillText(initials, 34, 280);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const FALLBACK = [
  'Aurora', 'Basalt', 'Cinder', 'Drift', 'Ember', 'Flux', 'Gossamer', 'Halide',
  'Ion', 'Jetsam', 'Kelvin', 'Lumen', 'Mesa', 'Nadir', 'Onyx', 'Pulse',
  'Quasar', 'Rune', 'Sable', 'Tessera', 'Umbra', 'Vertex', 'Wisp', 'Xenon',
];

// Category → accent color (matches portfolio mood).
export const CAT_COLORS = {
  'Platforms & OS': 0x7c6cff,
  'Sites & Case Studies': 0xf472b6,
  'Wikis & Knowledge': 0x34d399,
  'Data Browsers & Scrapers': 0xf59e0b,
  '3D & Interaction Demos': 0x06b6d4,
  'Developer Tools': 0x94a3b8,
  'Native & Hardware': 0xef4444,
  'Demo Data': 0x7c6cff,
};
