# AntiGravity Rebuild — agent notes

Portfolio monorepo for ~41 prototypes migrated from `../AntiGravity` (read-only source
of truth — never modify it from here).

- `catalog/projects.json` drives everything: the home UI, the build, and screenshot
  capture all read it. Edit it first when adding/changing a project.
- `apps/home/` is deliberately buildless vanilla JS. Keep it that way — zero
  dependencies is the point.
- `projects/<slug>/` contents are **artifacts** (copies/builds), not source. Fix bugs in
  the original project or rebuild via `scripts/migrate.sh` / the Vite build recipe in
  README; don't hand-edit copies except for path fixes.
- Deployment must stay fully static: no servers, no env vars. Anything needing a
  backend is either `embed: remote` (existing Vercel deploy) or `embed: none`.
- `npm run build` assembles `dist/`; `npm run dev` serves it on :4321.
- Screenshot capture uses system Chrome via puppeteer borrowed from
  `../AntiGravity/ag-assets/node_modules` (see scripts/capture.mjs header).
- **LovArt media/data broken (lovart-explorer, air-ui-study)? → read
  `docs/RUNBOOK-lovart.md` before debugging.** Known failure modes and fixes are
  all there (Referer 403s, agentThreadId gotcha, snapshot refresh).
