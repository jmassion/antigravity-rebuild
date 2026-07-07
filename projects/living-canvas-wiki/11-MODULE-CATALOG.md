# ╔══════════════════════════════════════════════════════════════╗
# ║  📦 PHASE 11: MODULE CATALOG                               ║
# ║  Quick reference for every module, interface, and port      ║
# ╚══════════════════════════════════════════════════════════════╝

## Complete Module Reference

| Module | Type | IN Ports | OUT Ports | BIDI Ports | Implementations | Default |
|--------|------|----------|-----------|------------|-----------------|---------|
| CanvasRenderer | canvas | scene-graph, device-info | frame-buffer, raycast-hits | — | Three.js, Babylon.js, PlayCanvas | Evolutionary winner |
| DeviceAdapter | device | — | input-events, device-info, layout-hints | — | Browser API | Single |
| SyncEngine | sync | — | awareness | state-patches | Yjs, Automerge, Loro | Evolutionary winner |
| TimelineEngine | timeline | events | timeline-state, playback-stream | — | Custom event store | Single |
| AgentRuntime | agent | tasks, messages | results, status, events | — | Core runtime | Single |
| AgentLLMBackend | agent | prompts | completions, tool-calls | — | Claude API, OpenRouter | Evolutionary winner |
| MCPConnector | pipe | — | — | requests/responses | MCP client | Single |
| CLIAccess | pipe | commands | stdout, stderr | — | Sandboxed shell | Single |
| AutomationBridge | pipe | — | — | triggers/results | n8n, Zapier | n8n |
| LedgerEngine | ledger | transfers | receipts, chains | — | SQLite, in-memory | SQLite |
| AuthGate | auth | credentials | tokens, permissions | — | Clerk, Auth0, custom JWT | Clerk |
| StorageBackend | storage | — | — | documents/queries | Supabase, PocketBase, SQLite | Supabase |
| ZSpaceManager | zspace | layout-requests | z-assignments | — | Custom | Single |
| SimulationEngine | simulation | sim-commands | sim-state, visual-output | — | Rapier, Cannon.js, Jolt | Evolutionary winner |
| AssetPipeline | asset | asset-requests | quality-assets | — | Procedural, AI (Meshy/Tripo), Hybrid | Evolutionary per category |
| HostingTarget | hosting | build-artifacts | deploy-url | — | Netlify, Cloudflare | Netlify |

## Key Data Types

```typescript
// Used across the system — defined in /packages/core/types.ts

type EntityId = string;
type BranchId = string;
type Timestamp = number;
type ContentHash = string;

interface Transform { position: Vector3; rotation: Quaternion; scale: Vector3; }
interface Vector3 { x: number; y: number; z: number; }
interface Vector2 { x: number; y: number; }
interface Quaternion { x: number; y: number; z: number; w: number; }

interface Task { id: string; type: string; payload: unknown; priority: number; dependencies: string[]; }
interface TaskResult { taskId: string; success: boolean; output: unknown; duration: number; }
interface AgentMessage { from: string; to: string; type: string; payload: unknown; timestamp: Timestamp; }
interface AgentOutput { agentId: string; type: string; data: unknown; timestamp: Timestamp; }

interface Transfer { from: string; to: string; content: unknown; type: string; }
interface Receipt { transferId: string; timestamp: Timestamp; contentHash: ContentHash; verified: boolean; }

interface TimelineEvent { id: string; type: string; timestamp: Timestamp; agentId?: string; data: unknown; }
interface SystemState { modules: Record<string, SerializableState>; timestamp: Timestamp; branch: BranchId; }
```
