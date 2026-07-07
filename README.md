# AntiGravity Rebuild

A clean monorepo housing the entire AntiGravity prototype collection, with a portfolio
home page to navigate, preview, and launch every project — deployable as **one static
site** with zero server dependencies.

The original `AntiGravity/` folder is untouched; this is the reorganized, hosted version.

## Layout

```
AntiGravity Rebuild/
├── apps/home/          The portfolio UI (vanilla HTML/CSS/JS — no build step)
├── catalog/
│   └── projects.json   ★ Single source of truth: every project's name, description,
│                         tech, status, category, embed strategy, source location
├── projects/<slug>/    Packaged static copies/builds of each embeddable prototype
├── assets/thumbnails/  Screenshot per project (<slug>.jpg)
├── scripts/
│   ├── migrate.sh      Re-copy prototypes from the original AntiGravity folder
│   ├── build.mjs       Assemble everything into dist/
│   └── capture.mjs     Headless-screenshot any project missing a thumbnail
├── vercel.json         Deploy config (Vercel)
└── .github/workflows/deploy.yml   Deploy config (GitHub Pages)
```

## Commands

```bash
npm run build     # assemble dist/ (home at /, projects at /p/<slug>/)
npm run dev       # build + serve at http://localhost:4321
npm run capture   # screenshot projects that lack a thumbnail (needs Chrome)
npm run migrate   # refresh projects/ from the original AntiGravity folder
```

## How a project gets on the site

Each entry in `catalog/projects.json` declares an **embed strategy**:

| Strategy | Meaning | Examples |
|---|---|---|
| `local`  | Static copy/build lives in `projects/<slug>/`, served at `/p/<slug>/` | NoahOS, AgentWorld, Higgsfield |
| `remote` | Embedded from an existing live deployment (kept out of this repo because of heavy media) | Aluzina (~360MB), LovArt Explorer (~74MB), Media Engine, Visual Terminal |
| `none`   | Source-only — extensions, native apps, servers. Card shows info + links | AutoAccept, Antigravity SDK, BrowserPlatformer, SwiftUI Liquid Glass |

Two projects are compiled Vite builds rather than raw copies (built with `--base=./` so
they work under `/p/<slug>/`): **AgentWorld** (React + Three.js) and **Mission Control
Center**. To rebuild them: copy source from the original folder, `npm install`,
`npx vite build --base=./`, and place `dist/` contents into `projects/<slug>/`.

## Adding a new project

1. Put a static build in `projects/<my-slug>/` (or note a remote URL).
2. Add an entry to `catalog/projects.json` (slug, name, category, description, tech,
   status, embed, source, thumbnail).
3. `npm run build && npm run capture` — done. The home page renders it automatically.

## Deploying

- **Vercel**: `vercel` from this folder — `vercel.json` runs the build and serves `dist/`.
- **GitHub Pages**: push to a repo with Pages enabled (Settings → Pages → GitHub Actions);
  the included workflow builds and deploys on every push to `main`.

## Portfolio inventory (41 projects)

| Category | Projects |
|---|---|
| Platforms & OS | AgentWorld OS, OS Solar System, oneOS, Mission Control Center, AntiGravity Engine, TabSpace WebBrowser, Browser Platformer |
| Sites & Case Studies | NoahOS Wiki, Garfield, Aluzina Explorer, AlphaUnicorn.io, Air.inc Rebuild, Media Engine, FranchiseOS (+6 franchise sites) |
| Wikis & Knowledge | AG Lessons, Sanity Wiki, The Living Canvas, HolodeckOS Gallery v1 (the previous portfolio, preserved) |
| Data Browsers & Scrapers | Higgsfield Media Browser, LovArt Explorer, Air UI Asset Library, Air Organizer, 3 Lovable experiments |
| 3D & Interaction Demos | SwipeRate, Void Room, Immersive Gallery, Spatial Corridors (3 variants), 3D Mouse Mastery, Visual Terminal, Rive Showcase, Nexus Dashboard |
| Developer Tools | AutoAccept (40k+ installs), Better Antigravity, Antigravity SDK, Agent Manager, Annotation Studio, Vercel MCP Hub, Cloud Control |
| Native & Hardware | AI Autopilot Stream Deck, Liquid Glass (SwiftUI) |

## What was deliberately left behind

- `node_modules/`, `.next/`, build caches, `.zip` archives (Ui8 kits, agent-orchestration)
- Heavy media for remote-embedded projects (Aluzina imagery, contentengine brain-images,
  LovArt media, `air-ui-study/data-export.json` — 38MB, unreferenced)
- Sanity `studio/` + `frontend/` (source-only; the static wiki SPA is what's packaged)
- `Scraper/Google/Contacts`, `Case-Studies/Los Creators` (documents/media, not web apps)
- Root `verify_*.py` scripts and the old repo's git history
