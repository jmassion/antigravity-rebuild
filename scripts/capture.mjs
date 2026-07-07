// Capture missing project thumbnails into assets/thumbnails/.
// Serves dist/ locally, loads each project page headlessly, screenshots it.
// Reuses puppeteer from the original AntiGravity/ag-assets install; if that
// moves, `npm i puppeteer` here and drop the createRequire path.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(
  '/Users/wyoming/Dropbox/4. Dropbox/AntiGravity/ag-assets/node_modules/'
);
const puppeteer = require('puppeteer');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const thumbs = path.join(root, 'assets/thumbnails');
const FORCE = process.argv.includes('--force');
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.slice(7);

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.md': 'text/plain',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, p);
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('nope');
  }
});
await new Promise((r) => server.listen(4599, r));

const catalog = JSON.parse(await readFile(path.join(root, 'catalog/projects.json'), 'utf8'));
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

for (const p of catalog.projects) {
  if (ONLY && p.slug !== ONLY) continue;
  const out = path.join(thumbs, `${p.slug}.jpg`);
  if (!FORCE && existsSync(out)) continue;
  let url;
  if (p.embed.type === 'local') url = `http://localhost:4599/${encodeURI(p.embed.path)}`;
  else if (p.embed.type === 'remote') url = p.embed.url;
  else continue; // code-only: gradient fallback in the UI

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500)); // let animations settle
    await page.screenshot({ path: out, type: 'jpeg', quality: 72 });
    console.log(`✓ ${p.slug}`);
  } catch (err) {
    console.warn(`✗ ${p.slug}: ${err.message.split('\n')[0]}`);
  }
}

await browser.close();
server.close();
console.log(`thumbnails now: ${(await readdir(thumbs)).filter((f) => f.endsWith('.jpg')).length}`);
