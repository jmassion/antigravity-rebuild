// QA audit: load every project page headlessly and report errors.
// Output: scratchpad JSON report + per-project screenshots.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire('/Users/wyoming/Dropbox/4. Dropbox/AntiGravity/ag-assets/node_modules/');
const puppeteer = require('puppeteer');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const OUT = process.argv[2] ?? '/tmp/audit';
await mkdir(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.md': 'text/plain', '.txt': 'text/plain',
  '.ico': 'image/x-icon', '.riv': 'application/octet-stream',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, p);
    const s = await stat(file).catch(() => null);
    if (s?.isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('nope');
  }
});
await new Promise((r) => server.listen(4601, r));

const catalog = JSON.parse(await readFile(path.join(root, 'catalog/projects.json'), 'utf8'));
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox'],
});

const report = [];
for (const p of catalog.projects) {
  if (p.embed.type === 'none') continue;
  const entry = { slug: p.slug, embed: p.embed.type, errors: [], failed: [], notes: [] };
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on('console', (m) => { if (m.type() === 'error') entry.errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => entry.errors.push('PAGEERROR: ' + String(e).slice(0, 300)));
  page.on('requestfailed', (r) => entry.failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 160)}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith('http://localhost:4601')) {
      entry.failed.push(`${r.status()} ${r.url().slice(21, 180)}`);
    }
  });

  const url = p.embed.type === 'local' ? `http://localhost:4601/${encodeURI(p.embed.path)}` : p.embed.url;
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });
    entry.status = resp?.status();
    await new Promise((r) => setTimeout(r, 2200));
    // blank-page heuristic: visible text + canvas/img presence
    entry.surface = await page.evaluate(() => ({
      text: document.body?.innerText.trim().length ?? 0,
      canvases: document.querySelectorAll('canvas').length,
      imgs: [...document.images].filter((i) => i.naturalWidth > 0).length,
      brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith(location.origin)).length,
      title: document.title,
    }));
    await page.screenshot({ path: path.join(OUT, `${p.slug}.jpg`), type: 'jpeg', quality: 60 });
  } catch (err) {
    entry.errors.push('NAV: ' + String(err).slice(0, 200));
  }
  await page.close();
  report.push(entry);
  const bad = entry.errors.length || entry.failed.length || (entry.surface && entry.surface.text < 5 && !entry.surface.canvases && !entry.surface.imgs);
  console.log(`${bad ? '✗' : '✓'} ${p.slug}${entry.errors.length ? ` errs:${entry.errors.length}` : ''}${entry.failed.length ? ` fails:${entry.failed.length}` : ''}`);
}

await writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
server.close();
console.log('report → ' + path.join(OUT, 'report.json'));
