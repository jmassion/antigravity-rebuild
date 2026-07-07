# ╔══════════════════════════════════════════════════════════════╗
# ║  🌌 THE LIVING CANVAS — MASTER BUILD PLAN                  ║
# ║  🤖 For Autonomous Execution by Claude Code                ║
# ║  📅 v1.0 — March 2026                                      ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS               │
# └─────────────────────────────────────┘

> **How to use this document:**
> Read this file first. It tells you the build order.
> Each phase links to a detailed spec file.
> Execute phases in order. Each phase has validation criteria.
> Do NOT proceed to the next phase until validation passes.
> Do NOT stop to ask the human anything. Build, test, select, move on.

---

## 🧭 Phase Map

| Phase | File | What It Builds | Depends On |
|-------|------|----------------|------------|
| 0 | [00-PHILOSOPHY.md](./00-PHILOSOPHY.md) | Mental models, method, principles | Nothing — read first |
| 1 | [01-INTERFACES.md](./01-INTERFACES.md) | Module system, port types, registry | Phase 0 |
| 2 | [02-FOUNDATION.md](./02-FOUNDATION.md) | Canvas, devices, multiplayer sync | Phase 1 |
| 3 | [03-AGENTS.md](./03-AGENTS.md) | Agent runtime, souls, heartbeats | Phases 1-2 |
| 4 | [04-CONNECTIONS.md](./04-CONNECTIONS.md) | MCP, APIs, CLI, pipes, permissions | Phases 1, 3 |
| 5 | [05-ORCHESTRATION.md](./05-ORCHESTRATION.md) | Timeline, dependencies, branching | Phases 1-4 |
| 6 | [06-ZSPACE-AND-SIMULATION.md](./06-ZSPACE-AND-SIMULATION.md) | Z-depth, game patterns, virtual physics | Phases 1-2 |
| 7 | [07-3D-QUALITY-PIPELINE.md](./07-3D-QUALITY-PIPELINE.md) | Beautiful 3D assets, characters, animation | Phases 2, 6 |
| 8 | [08-LEDGER.md](./08-LEDGER.md) | Immutable transfer records, provenance | Phases 1, 5 |
| 9 | [09-EVOLUTION.md](./09-EVOLUTION.md) | Multi-branch testing, selection, growth | All prior phases |
| 10 | [10-BUILD-PROCEDURE.md](./10-BUILD-PROCEDURE.md) | Complete pseudo-code, autonomous execution | All prior phases |
| 11 | [11-MODULE-CATALOG.md](./11-MODULE-CATALOG.md) | Every module, every interface, every type | Reference doc |
| 12 | [12-VALIDATION.md](./12-VALIDATION.md) | Self-test protocol, completion criteria | Reference doc |

---

## 🚨 The Autonomy Contract

```
YOU ARE BUILDING THIS ENTIRELY ON YOUR OWN.
- Do NOT stop to ask the human for decisions
- Do NOT ask for permission to proceed
- DO build multiple implementations when the spec says to
- DO test and score each option using the evaluation framework
- DO select winners based on data, not guesses
- DO document every decision in /docs/decisions/
- DO archive every rejected alternative in /docs/alternatives/
- DO keep building until Phase 10 validation passes completely
- The human will interact with the system ONLY after it is fully ready
```

---

## 🏗️ The Build Sequence (Quick Reference)

```
Phase 0:  Read philosophy → understand the method
Phase 1:  Build /packages/core → Module registry + types + ports
Phase 2:  Build 3 canvas renderers + 3 sync engines → TEST → SELECT winners
Phase 3:  Build agent runtime + 2 LLM backends → TEST → SELECT winner
Phase 4:  Build MCP pipes + CLI + automation bridges
Phase 5:  Build timeline engine (recording, scrubbing, branching)
Phase 6:  Build z-space system + ECS architecture + simulation physics
Phase 7:  Build 3D quality pipeline (asset generation, rigging, animation)
Phase 8:  Build ledger (append-only chain, provenance tracing)
Phase 9:  Run evolutionary optimization across all swappable modules
Phase 10: Wire everything into running app → DEPLOY → VALIDATE
```

---

## 📁 Project Structure (Create in Phase 1)

```
living-canvas/
├── packages/
│   ├── core/                  ← Module registry, types, interfaces
│   ├── canvas-threejs/        ← Three.js renderer (Option A)
│   ├── canvas-babylon/        ← Babylon.js renderer (Option B)
│   ├── canvas-playcanvas/     ← PlayCanvas renderer (Option C)
│   ├── device-adapter/        ← Device detection + input normalization
│   ├── sync-yjs/              ← Yjs CRDT engine (Option A)
│   ├── sync-automerge/        ← Automerge engine (Option B)
│   ├── sync-loro/             ← Loro engine (Option C)
│   ├── agent-runtime/         ← Agent lifecycle, soul, heartbeat
│   ├── agent-llm-claude/      ← Claude API backend
│   ├── agent-llm-openrouter/  ← OpenRouter backend
│   ├── pipes-mcp/             ← MCP connection manager
│   ├── pipes-automation/      ← n8n/Zapier bridge
│   ├── pipes-cli/             ← CLI/shell access module
│   ├── timeline/              ← Event recording and replay
│   ├── ledger/                ← Immutable transfer chain
│   ├── auth/                  ← Authentication and permissions
│   ├── storage/               ← Persistent data backend
│   ├── zspace/                ← Z-depth organization system
│   ├── simulation/            ← Virtual physics + magic systems
│   ├── asset-pipeline/        ← 3D quality generation pipeline
│   └── app/                   ← Main application shell
├── tests/
│   ├── interfaces/            ← Interface compliance tests
│   ├── benchmarks/            ← Performance comparison tests
│   └── integration/           ← Full-system integration tests
├── docs/
│   ├── decisions/             ← Why each tech was selected
│   └── alternatives/          ← Archived rejected implementations
├── .wiki/                     ← THIS WIKI (the spec files)
├── CLAUDE.md                  ← Agent instructions
├── SOUL.md                    ← System personality
├── PRD.md                     ← Product requirements
└── ARCHITECTURE.md            ← Architecture overview
```

---

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS (BOTTOM)      │
# └─────────────────────────────────────┘

> Same as top — repeated for easy navigation from the bottom of the file.

| Phase | File | What It Builds |
|-------|------|----------------|
| 0 | 00-PHILOSOPHY.md | Mental models, method, principles |
| 1 | 01-INTERFACES.md | Module system, port types, registry |
| 2 | 02-FOUNDATION.md | Canvas, devices, multiplayer sync |
| 3 | 03-AGENTS.md | Agent runtime, souls, heartbeats |
| 4 | 04-CONNECTIONS.md | MCP, APIs, CLI, pipes, permissions |
| 5 | 05-ORCHESTRATION.md | Timeline, dependencies, branching |
| 6 | 06-ZSPACE-AND-SIMULATION.md | Z-depth, game patterns, virtual physics |
| 7 | 07-3D-QUALITY-PIPELINE.md | Beautiful 3D assets, characters, animation |
| 8 | 08-LEDGER.md | Immutable transfer records, provenance |
| 9 | 09-EVOLUTION.md | Multi-branch testing, selection, growth |
| 10 | 10-BUILD-PROCEDURE.md | Complete autonomous build pseudo-code |
| 11 | 11-MODULE-CATALOG.md | Every module, every interface |
| 12 | 12-VALIDATION.md | Self-test protocol, completion criteria |
