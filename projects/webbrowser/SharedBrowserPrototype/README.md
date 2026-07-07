# TabSpace World (v0.2) — 2026-02-28

A shared **multiplayer browser world** with game-level permissions, live host metrics, and dynamic browser management.

## Features
1. **3D browser surfaces** (Chrome/CDP or Chromium contexts → planes in 3D)
2. **Multiplayer + permissions** (authoritative server, surfaces, locks, capability tokens)
3. **Epoch-based revocation** — bump roomEpoch to invalidate all outstanding caps
4. **Host heartbeats** — live CPU, memory, RSS metrics via `systeminformation`
5. **Dynamic browsers** — add/remove browser surfaces from the client UI
6. **Performance / memory / LOD** concepts (client GPU/VRAM, host RAM/CPU, bandwidth)
7. **Remote host scaling** (capacity-aware scheduling, session containers)
8. **Geo/VPN egress** (per container/surface policies)

## Contents
- `docs/` — PRDs, architecture, protocol, security, performance, scaling, VPN/geo, agent prompts
- `server/` — Node.js WS server (rooms, presence, policies, locks, caps, epoch revoke, host metrics, dynamic surfaces)
- `host/` — host (publish surfaces, heartbeat metrics, spawn/destroy surfaces, accept input w/ caps)
- `client/` — web client (auto-connect, iframes, URL navigation, add/remove browsers, host metrics panel)
- `appendix/` — checklists

## Quick start
1) Terminal A:
   ```
   cd server && npm install && npm run dev
   ```
2) Terminal B:
   ```
   cd host && npm install && npm run dev
   ```
3) Open `http://localhost:8787` in your browser

## What works
- 6 live website surfaces (Wikipedia, YouTube, OpenStreetMap, Internet Archive, CodePen, Google Maps)
- ＋ Add Browser button — dynamically spawn new browser surfaces
- ✕ Remove browsers (hover close button)
- Host metrics panel (live CPU, memory, RSS)
- Epoch badge + Revoke All button
- Egress policy & container tags on surface cards
- URL bar navigation
- Capability-gated control + lock assignment

## Next steps
- CDP streaming (real browser pixels via Playwright/Chromium)
- Browser persistence models (shared / per-user / separate-account)
- Three.js 3D spatial view
- Agent access (keyboard/mouse/code-based)
