// Assemble the deployable static site into dist/:
//   dist/            ← apps/home (portfolio UI) + catalog.json + thumbnails/
//   dist/p/<slug>/   ← each packaged prototype
import { cp, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(path.join(root, 'apps/home'), dist, { recursive: true });
await cp(path.join(root, 'catalog/projects.json'), path.join(dist, 'catalog.json'));
await cp(path.join(root, 'assets/thumbnails'), path.join(dist, 'thumbnails'), { recursive: true });
await cp(path.join(root, 'projects'), path.join(dist, 'p'), { recursive: true });

console.log('dist/ assembled');
