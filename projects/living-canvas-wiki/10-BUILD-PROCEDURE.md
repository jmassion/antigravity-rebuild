# ╔══════════════════════════════════════════════════════════════╗
# ║  🚀 PHASE 10: THE AUTONOMOUS BUILD PROCEDURE               ║
# ║  Complete pseudo-code. Execute top to bottom. No stopping.  ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS               │
# └─────────────────────────────────────┘
- [Step 0: Project Scaffold](#step-0-project-scaffold)
- [Step 1: Core Types & Registry](#step-1-core-types--registry)
- [Step 2: Device Adapter](#step-2-device-adapter)
- [Step 3: Canvas Renderer (Evolutionary)](#step-3-canvas-renderer)
- [Step 4: Sync Engine (Evolutionary)](#step-4-sync-engine)
- [Step 5: Timeline Engine](#step-5-timeline-engine)
- [Step 6: Agent Runtime + LLM Backends](#step-6-agent-runtime)
- [Step 7: Pipe Connectors](#step-7-pipe-connectors)
- [Step 8: Z-Space + ECS + Simulation](#step-8-zspace-ecs-simulation)
- [Step 9: 3D Quality Pipeline](#step-9-3d-quality-pipeline)
- [Step 10: Ledger](#step-10-ledger)
- [Step 11: Auth & Permissions](#step-11-auth)
- [Step 12: Application Shell](#step-12-application-shell)
- [Step 13: Evolutionary Optimization](#step-13-optimization)
- [Step 14: Deploy & Final Validation](#step-14-deploy)

---

> **INSTRUCTION TO CLAUDE CODE:**
> Execute each step in order. Run the validation at the end of each step.
> If validation fails, debug and fix before moving on.
> If a dependency (npm package, API) is unavailable, use the documented fallback.
> Document every decision in /docs/decisions/.
> Do not ask the human anything. Build until Step 14 passes.

---

## Step 0: Project Scaffold

```
CREATE living-canvas/ monorepo
  - See MASTER_PLAN.md for full directory structure
  - package.json with workspaces for all packages
  - tsconfig.json with strict mode
  - CLAUDE.md pointing to this wiki
  - SOUL.md for the system personality
  - .gitignore

VALIDATE: All directories exist. npm install succeeds.
```

## Step 1: Core Types & Registry

```
IN /packages/core:
  - types.ts: All interfaces from 01-INTERFACES.md
  - registry.ts: ModuleRegistry implementation
  - ports.ts: Port system with type checking
  - events.ts: EventEmitter wrapper
  - index.ts: Exports

VALIDATE: Registry CRUD works. Port type checking works. Swap works.
```

## Step 2: Device Adapter

```
IN /packages/device-adapter:
  - Implement DeviceAdapter from 02-FOUNDATION.md section 2.3
  - Browser API detection (screen, input, capabilities)
  - Unified input event stream
  - Layout hints based on device

VALIDATE: Registers in registry. Detects screen. Emits input events.
```

## Step 3: Canvas Renderer (Evolutionary)

```
FOR EACH OF [threejs, babylon, playcanvas]:
  IN /packages/canvas-{name}/:
    - Implement CanvasRenderer from 02-FOUNDATION.md section 2.2
    - 3D scene graph, camera, raycasting, responsive resize
    - Must use DeviceAdapter for screen info

RUN /tests/benchmarks/canvas-renderer.test.ts
SCORE using framework from 09-EVOLUTION.md
SELECT winner → Document in /docs/decisions/canvas-renderer.md
ARCHIVE losers → /docs/alternatives/

VALIDATE: Winner renders scene at ≥55fps. Raycasting works. Responsive.
```

## Step 4: Sync Engine (Evolutionary)

```
FOR EACH OF [yjs, automerge, loro]:
  IN /packages/sync-{name}/:
    - Implement SyncEngine from 02-FOUNDATION.md section 2.5
    - Create/update/delete shared docs. Awareness. Offline merge.

RUN benchmarks. SCORE. SELECT. DOCUMENT. ARCHIVE.

VALIDATE: Two clients sync within 100ms. Offline merge works.
```

## Step 5: Timeline Engine

```
IN /packages/timeline:
  - Implement TimelineEngine from 05-ORCHESTRATION.md
  - Append-only event log, snapshots, scrubbing, branching, playback
  - Visual: DAW-style multi-track view + Factorio dependency graph

VALIDATE: Record→scrub→verify. Branch→switch→verify. Playback works.
```

## Step 6: Agent Runtime

```
IN /packages/agent-runtime:
  - Implement AgentRuntime from 03-AGENTS.md
  - Soul loader, heartbeat, task queue, inbox/outbox

FOR EACH OF [claude, openrouter]:
  IN /packages/agent-llm-{name}/:
    - Implement AgentLLMBackend
    - NOTE: If API keys unavailable, create mock that simulates responses

RUN evolutionary test. SELECT. DOCUMENT.

VALIDATE: Agent heartbeats. Tasks process. Timeline records events.
```

## Step 7: Pipe Connectors

```
IN /packages/pipes-mcp:
  - MCP client connecting to any MCP server URL
  - Visual pipe with state indicators

IN /packages/pipes-cli:
  - Sandboxed shell execution with whitelist
  - stdout/stderr streaming to canvas

IN /packages/pipes-automation:
  - Webhook bridge to n8n/Zapier

VALIDATE: MCP connects and calls tools. CLI executes safely. Webhooks fire.
```

## Step 8: Z-Space + ECS + Simulation

```
IN /packages/zspace:
  - ZSpaceManager from 06-ZSPACE-AND-SIMULATION.md section 6.1
  - Stack, spread, layer, collapse, device-adaptive

IN /packages/core (or /packages/ecs):
  - EntityManager, ComponentStore, SystemRunner
  - All standard components and systems from section 6.2

IN /packages/simulation:
  - SimulationEngine with malleable physics from section 6.4
  - At least 3 magic tools: Gravity Well, Assembler, Magnifying Glass
  - Physics engine: Evolutionary test (Rapier vs Cannon.js vs Jolt)

VALIDATE: Z-space stacks/spreads. ECS creates entities with components.
         Physics runs at ≥55fps with 50 entities. Magic tools function.
```

## Step 9: 3D Quality Pipeline

```
IN /packages/asset-pipeline:
  - Full pipeline from 07-3D-QUALITY-PIPELINE.md
  - Procedural generators (all 7 patterns from section 7.5)
  - AI tool integration (Meshy, Tripo) with procedural fallback
  - Quality audit (20-point checklist, automated scoring)
  - Character system (soul→visual mapping, rigging, animation)
  - LOD generation and optimization

EVOLUTIONARY TEST: Generate 5 assets with each method. Score. Select per category.

VALIDATE: Panel scores ≥70. Pipe scores ≥70. Character scores ≥70.
         ≥55fps with 5 agents + 10 pipes. Animations smooth.
```

## Step 10: Ledger

```
IN /packages/ledger:
  - LedgerEngine from 08-LEDGER.md
  - Append-only, hash-chained, verifiable
  - Visual chain renderer

VALIDATE: 10 transfers chain correctly. Provenance traces. Tampering detected.
```

## Step 11: Auth

```
IN /packages/auth:
  - AuthGate with Clerk (or fallback to custom JWT)
  - Per-user and per-agent permissions
  - Visual indicators on pipes

VALIDATE: Auth flow works. Permissions enforced. Visual states correct.
```

## Step 12: Application Shell

```
IN /packages/app:
  BOOTSTRAP SEQUENCE:
    1. Create ModuleRegistry
    2. Register DeviceAdapter
    3. Register SyncEngine (winner)
    4. Register CanvasRenderer (winner)
    5. Register ZSpaceManager
    6. Register SimulationEngine
    7. Register AssetPipeline
    8. Register TimelineEngine
    9. Register LedgerEngine
    10. Register AuthGate
    11. Init all in dependency order
    12. Render canvas with z-space layers:
        Layer 0: Agent workspaces
        Layer 1: Pipe infrastructure
        Layer 2: Timeline/orchestration
        Layer 3: Ledger/history
    13. Spawn default agent with soul
    14. Connect default MCP pipes
    15. System is live

VALIDATE: All modules healthy. Canvas renders. Agent heartbeats.
```

## Step 13: Evolutionary Optimization

```
FOR EACH module with alternatives:
  - Swap in each alternative
  - Run full integration tests
  - Compare system-level performance
  - Confirm or change selection
  - Document final decision with benchmarks

GENERATE:
  - Comparison dashboards
  - Architecture diagram (actual, not planned)
  - Decision log with pros/cons

VALIDATE: All docs complete. System stable 10 minutes under simulated load.
```

## Step 14: Deploy & Final Validation

```
DEPLOY:
  - Frontend → Netlify (auto-deploy from git)
  - Sync server → DigitalOcean (WebSocket server for CRDT sync)
  - n8n → DigitalOcean (automation engine)

FINAL VALIDATION (ALL must pass):
  ✅ App loads at deployed URL
  ✅ Canvas renders with z-space layers
  ✅ Agent spawns with heartbeat visible
  ✅ Agent processes a task (real or simulated LLM call)
  ✅ Pipe connects to at least one MCP server
  ✅ Two browser tabs sync state in real time
  ✅ Timeline records and scrubs correctly
  ✅ Timeline branches and switches
  ✅ Ledger tracks a transfer with valid chain
  ✅ Z-space stack/spread/focus works
  ✅ Works on desktop viewport
  ✅ Works on mobile viewport (simulated Galaxy Fold)
  ✅ 3D assets score ≥70 on quality audit
  ✅ ≥55fps on desktop
  ✅ All decision docs exist in /docs/decisions/
  ✅ All alternatives archived in /docs/alternatives/

WHEN ALL PASS: System is ready. Report to human.
```

---

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS (BOTTOM)      │
# └─────────────────────────────────────┘
- [Step 0: Project Scaffold](#step-0-project-scaffold)
- [Step 1: Core Types & Registry](#step-1-core-types--registry)
- [Step 2: Device Adapter](#step-2-device-adapter)
- [Step 3: Canvas Renderer (Evolutionary)](#step-3-canvas-renderer)
- [Step 4: Sync Engine (Evolutionary)](#step-4-sync-engine)
- [Step 5: Timeline Engine](#step-5-timeline-engine)
- [Step 6: Agent Runtime](#step-6-agent-runtime)
- [Step 7: Pipe Connectors](#step-7-pipe-connectors)
- [Step 8: Z-Space + ECS + Simulation](#step-8-zspace-ecs-simulation)
- [Step 9: 3D Quality Pipeline](#step-9-3d-quality-pipeline)
- [Step 10: Ledger](#step-10-ledger)
- [Step 11: Auth](#step-11-auth)
- [Step 12: Application Shell](#step-12-application-shell)
- [Step 13: Evolutionary Optimization](#step-13-optimization)
- [Step 14: Deploy & Final Validation](#step-14-deploy)
