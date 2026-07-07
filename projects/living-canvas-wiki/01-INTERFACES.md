# ╔══════════════════════════════════════════════════════════════╗

# ║ 🔌 PHASE 1: THE MODULE INTERFACE CONTRACT ║

# ║ The skeleton that makes hot-swapping possible ║

# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐

# │ 📖 TABLE OF CONTENTS │

# └─────────────────────────────────────┘

- [1.1 The Universal Module Shape](#11-the-universal-module-shape)
- [1.2 Port Types — The Wiring Language](#12-port-types--the-wiring-language)
- [1.3 The Module Registry](#13-the-module-registry)
- [1.4 Core Module Types Table](#14-core-module-types-table)
- [1.5 Build Instructions](#15-build-instructions)
- [1.6 Validation Criteria](#16-validation-criteria)

---

## 1.1 The Universal Module Shape

![Module Interface Contract](./diagrams/module_interface.png)

Every module conforms to this shape. No exceptions.

```typescript
interface Module {
  // 🏷️ Identity — who am I?
  id: string; // Unique identifier like "canvas-threejs"
  type: ModuleType; // Category: 'canvas' | 'agent' | 'pipe' | 'sync' | etc
  version: string; // Semver — interfaces are versioned

  // 🔄 Lifecycle — birth, life, death
  init(config: ModuleConfig): Promise<void>; // Start up
  destroy(): Promise<void>; // Clean shutdown
  health(): HealthStatus; // Am I working?

  // 🔌 Communication — how I talk to other modules
  ports: Record<string, Port<unknown>>; // Named typed ports

  // 👁️ Observability — watch me work
  events: EventEmitter; // Emits events for timeline
  state(): SerializableState; // Snapshot for replay/branching
}

type ModuleType =
  | "canvas" // Renders the 3D scene
  | "device" // Handles input and screen info
  | "sync" // CRDT multiplayer state
  | "agent" // AI agent runtime
  | "pipe" // External service connection
  | "timeline" // Event recording/replay
  | "ledger" // Immutable transfer records
  | "auth" // Identity and permissions
  | "storage" // Persistent data
  | "zspace" // Z-depth organization
  | "simulation" // Virtual physics and magic
  | "asset" // 3D quality pipeline
  | "hosting"; // Deployment target

interface HealthStatus {
  healthy: boolean;
  status: "running" | "degraded" | "error" | "stopped";
  message?: string;
  lastHeartbeat: number;
}
```

---

## 1.2 Port Types — The Wiring Language

Ports are how modules connect. A port has a direction, a data type, and a connection state. When you see a "pipe" on the canvas, it's two ports connected.

```typescript
interface Port<T> {
  name: string;
  direction: "in" | "out" | "bidirectional";
  dataType: JSONSchema; // Schema defining what flows through
  connected: boolean;
  peer: Port<unknown> | null; // What am I connected to?

  // For 'out' and 'bidirectional' ports
  send(data: T): void;

  // For 'in' and 'bidirectional' ports
  onReceive(handler: (data: T) => void): Unsubscribe;

  // Connection management
  connect(other: Port<T>): void; // Type-checked at connection time
  disconnect(): void;
}

// Type checking: connecting incompatible ports throws a PortTypeMismatchError
// The canvas enforces this visually — incompatible ports don't snap together
```

---

## 1.3 The Module Registry

The central nervous system. All modules register here. This is how the system discovers what's available and performs hot-swaps.

```typescript
interface ModuleRegistry {
  // CRUD
  register(module: Module): void;
  unregister(id: string): void;
  get(id: string): Module;
  getAll(): Module[];

  // Discovery
  getByType(type: ModuleType): Module[];
  getAlternatives(id: string): Module[]; // Same interface, different impl

  // Hot-swap
  swap(currentId: string, newId: string): SwapResult;
  // swap() does: disconnect ports → destroy old → init new → reconnect ports

  // Observability
  onRegister(handler: (module: Module) => void): Unsubscribe;
  onSwap(handler: (oldId: string, newId: string) => void): Unsubscribe;
}
```

---

## 1.4 Core Module Types Table

| Module Type        | Purpose                    | Input Ports              | Output Ports                            | Swap Options                           |
| ------------------ | -------------------------- | ------------------------ | --------------------------------------- | -------------------------------------- |
| CanvasRenderer     | Renders 3D scene           | scene-graph, device-info | frame-buffer, raycast-hits              | Three.js, Babylon.js, PlayCanvas       |
| DeviceAdapter      | Input/screen normalization | (browser events)         | input-events, device-info, layout-hints | Browser API (single impl)              |
| SyncEngine         | CRDT multiplayer           | state-patches (bidi)     | awareness                               | Yjs, Automerge, Loro                   |
| AgentRuntime       | AI agent lifecycle         | tasks, messages          | results, status, events                 | Core runtime (single)                  |
| AgentLLMBackend    | LLM inference              | prompts                  | completions, tool-calls                 | Claude API, OpenRouter, Hybrid         |
| PipeConnector:MCP  | MCP services               | requests (bidi)          | responses (bidi)                        | MCP client (single)                    |
| PipeConnector:CLI  | Shell access               | commands                 | stdout, stderr                          | Sandboxed shell (single)               |
| PipeConnector:Auto | Automation                 | triggers (bidi)          | results (bidi)                          | n8n, Zapier                            |
| TimelineEngine     | Event record/replay        | events                   | timeline-state, playback                | Custom event store                     |
| LedgerEngine       | Transfer records           | transfers                | receipts, chains                        | SQLite, in-memory                      |
| AuthGate           | Identity/permissions       | credentials              | tokens, permissions                     | Clerk, Auth0, custom JWT               |
| StorageBackend     | Persistence                | documents (bidi)         | queries (bidi)                          | Supabase, PocketBase, SQLite           |
| ZSpaceManager      | Depth organization         | layout-requests          | z-assignments                           | Custom (single)                        |
| SimulationEngine   | Virtual physics            | sim-commands             | sim-state, visual-output                | Rapier, Cannon.js, Jolt                |
| AssetPipeline      | 3D quality                 | asset-requests           | quality-assets                          | Meshy+refine, Tripo+refine, procedural |
| HostingTarget      | Deployment                 | build-artifacts          | deploy-url                              | Netlify, Cloudflare                    |

---

## 1.5 Build Instructions

```
IN /packages/core:

1. CREATE types.ts
   - All interfaces from this document (Module, Port, HealthStatus, etc)
   - All ModuleType definitions
   - All data types used by ports (AgentMessage, TimelineEvent, Transfer, etc)

2. CREATE registry.ts
   - Implement ModuleRegistry class
   - Map-based storage for modules
   - swap() handles: validate interface compat → disconnect → destroy → init → reconnect
   - EventEmitter for register/unregister/swap events

3. CREATE ports.ts
   - Implement Port class with type checking
   - connect() validates dataType compatibility via JSON Schema
   - send() / onReceive() with buffering for disconnected states

4. CREATE index.ts
   - Export everything

5. CREATE package.json
   - Name: @living-canvas/core
   - Dependencies: minimal (eventemitter3, ajv for JSON Schema validation)
```

---

## 1.6 Validation Criteria

```
ALL of the following must pass before proceeding to Phase 2:

✅ ModuleRegistry: register, get, getByType, getAlternatives all work
✅ ModuleRegistry: swap() disconnects old ports and reconnects new ports
✅ Port: Two ports connect and data flows from out to in
✅ Port: Bidirectional ports send data both ways
✅ Port: Connecting incompatible types throws PortTypeMismatchError
✅ Module lifecycle: init() → health() returns healthy → destroy() → health() returns stopped
✅ Module state: state() returns serializable JSON that can be round-tripped
✅ Events: Module emits events. Timeline (mock) receives them.
```

---

# ┌─────────────────────────────────────┐

# │ 📖 TABLE OF CONTENTS (BOTTOM) │

# └─────────────────────────────────────┘

- [1.1 The Universal Module Shape](#11-the-universal-module-shape)
- [1.2 Port Types — The Wiring Language](#12-port-types--the-wiring-language)
- [1.3 The Module Registry](#13-the-module-registry)
- [1.4 Core Module Types Table](#14-core-module-types-table)
- [1.5 Build Instructions](#15-build-instructions)
- [1.6 Validation Criteria](#16-validation-criteria)
