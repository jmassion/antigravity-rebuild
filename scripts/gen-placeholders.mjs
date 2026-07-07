// Generate branded placeholder thumbnails for code-only projects (no live
// page to screenshot) + a favicon.ico for the site root. Uses headless Chrome
// so no image libraries are needed.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire('/Users/wyoming/Dropbox/4. Dropbox/AntiGravity/ag-assets/node_modules/');
const puppeteer = require('puppeteer');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const catalog = JSON.parse(await readFile(path.join(root, 'catalog/projects.json'), 'utf8'));
const targets = catalog.projects.filter((p) => p.embed.type === 'none');

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

function hueFor(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

for (const p of targets) {
  const h = hueFor(p.slug);
  const initials = p.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  await page.setContent(`
    <style>
      body { margin:0; width:1280px; height:800px; display:grid; place-items:center;
        font-family: system-ui, sans-serif;
        background:
          radial-gradient(ellipse 70% 50% at 70% 20%, hsla(${(h + 70) % 360},70%,45%,0.35), transparent 70%),
          radial-gradient(ellipse 60% 60% at 20% 85%, hsla(${h},60%,40%,0.3), transparent 70%),
          linear-gradient(135deg, hsl(${h} 45% 10%), hsl(${(h + 70) % 360} 50% 18%));
        color:#fff; }
      .wrap { text-align:center; }
      .init { font-size:220px; font-weight:800; letter-spacing:-8px;
        background: linear-gradient(120deg,#fff,hsla(${(h + 40) % 360},90%,80%,0.85));
        -webkit-background-clip:text; background-clip:text; color:transparent; }
      .name { font-size:44px; font-weight:600; opacity:0.9; margin-top:8px; }
      .tag { font-size:24px; opacity:0.5; margin-top:14px; text-transform:uppercase; letter-spacing:6px; }
      .grid { position:fixed; inset:0;
        background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
          linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
        background-size:48px 48px; }
    </style>
    <div class="grid"></div>
    <div class="wrap"><div class="init">${initials}</div>
      <div class="name">${p.name}</div><div class="tag">source project</div></div>`);
  await page.screenshot({ path: path.join(root, `assets/thumbnails/${p.slug}.jpg`), type: 'jpeg', quality: 80 });
  console.log(`✓ ${p.slug}`);
}

// favicon: 64px glyph on brand gradient, saved as PNG bytes named favicon.ico
await page.setViewport({ width: 64, height: 64 });
await page.setContent(`
  <style>body{margin:0;width:64px;height:64px;display:grid;place-items:center;
    background:linear-gradient(135deg,#1b1740,#0b3a4a);border-radius:12px;font-size:40px}</style>🛸`);
await page.screenshot({ path: path.join(root, 'apps/home/favicon.ico'), type: 'png', omitBackground: false });
console.log('✓ favicon');

await browser.close();
