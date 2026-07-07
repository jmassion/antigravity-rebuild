# ╔══════════════════════════════════════════════════════════════╗
# ║  🏗️ PHASE 2: THE FOUNDATION LAYER                          ║
# ║  Canvas, devices, multiplayer — built right from day one    ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS               │
# └─────────────────────────────────────┘
- [2.1 Adaptive Canvas Runtime](#21-adaptive-canvas-runtime)
- [2.2 Evolutionary Test: Canvas Renderer](#22-evolutionary-test-canvas-renderer)
- [2.3 Device Adapter Module](#23-device-adapter-module)
- [2.4 Multiplayer Sync (CRDT Engine)](#24-multiplayer-sync)
- [2.5 Evolutionary Test: Sync Engine](#25-evolutionary-test-sync-engine)
- [2.6 Module System Bootstrap Sequence](#26-bootstrap-sequence)
- [2.7 Build Instructions](#27-build-instructions)
- [2.8 Validation Criteria](#28-validation-criteria)

---

## 2.1 Adaptive Canvas Runtime

The canvas fills whatever device it runs on. NOT a fixed viewport. It dynamically adapts to:
- Screen dimensions and pixel density (Galaxy Fold, iPad, TV, laptop, watch)
- Input modality (touch, mouse, keyboard, pen, gamepad)
- Orientation changes (portrait, landscape, fold states)
- Available z-depth (how much depth the device can display meaningfully)

---

## 2.2 Evolutionary Test: Canvas Renderer

Build THREE implementations behind the CanvasRenderer interface:

**Option A — Three.js:** Known territory. Huge ecosystem. React Three Fiber for declarative scene graph. WebGL with WebGPU upgrade path. Best for custom shaders.

**Option B — Babylon.js:** More batteries-included. Built-in GUI system. Inspector/debugger. Better physics out of box. WebGPU native.

**Option C — PlayCanvas:** Lightweight, fast. WebGPU-first. Entity-component system built in. Good for game-like interactions.

### CanvasRenderer Interface
```typescript
interface CanvasRenderer extends Module {
  type: 'canvas';
  
  // Scene management
  addObject(obj: SceneObject): string;    // Returns object ID
  removeObject(id: string): void;
  updateObject(id: string, transform: Transform): void;
  
  // Camera
  setCamera(config: CameraConfig): void;
  getCamera(): CameraConfig;
  
  // Raycasting (for selection/interaction)
  raycast(screenPos: Vector2): RaycastHit[];
  
  // Rendering
  render(): void;                          // Draw one frame
  startLoop(): void;                       // Start render loop
  stopLoop(): void;
  getFPS(): number;
  
  // Responsiveness
  resize(width: number, height: number, pixelRatio: number): void;
  
  ports: {
    'scene-graph': Port<SceneUpdate>;      // IN
    'device-info': Port<DeviceInfo>;       // IN
    'frame-buffer': Port<FrameData>;       // OUT
    'raycast-hits': Port<RaycastHit[]>;    // OUT
  };
}
```

### Selection Criteria (score 1-10, multiply by weight)

| Criterion | Weight | Measure |
|-----------|--------|---------|
| Render quality | 3x | Visual fidelity at default settings |
| Performance | 3x | FPS with 100+ objects on mid-range device |
| Bundle size | 2x | Gzipped JS for renderer module alone |
| API ergonomics | 2x | LOC to implement CanvasRenderer interface |
| Ecosystem | 1x | NPM downloads, docs quality |
| Hot-swap cost | 2x | Lines changed outside renderer module (MUST be 0) |

---

## 2.3 Device Adapter Module

```typescript
interface DeviceAdapter extends Module {
  type: 'device';
  screen: { width: number; height: number; pixelRatio: number; orientation: string; foldState?: string };
  input: { touch: boolean; mouse: boolean; keyboard: boolean; pen: boolean; gamepad: boolean };
  capabilities: { webgl2: boolean; webgpu: boolean; gyroscope: boolean; haptics: boolean };
  onInput(handler: (event: UnifiedInputEvent) => void): Unsubscribe;
  layoutHints(): { maxZDepth: number; preferredDensity: number; interactionRadius: number };
  
  ports: {
    'input-events': Port<UnifiedInputEvent>;
    'device-info': Port<DeviceInfo>;
    'layout-hints': Port<LayoutHints>;
  };
}
```

---

## 2.4 Multiplayer Sync

Multiplayer is NOT added later. Built from day one. Every object on the canvas is a CRDT document:
- Multiple users edit simultaneously without conflicts
- Offline edits merge automatically on reconnect
- State persists without save buttons
- New users see current state immediately
- Presence: see who's connected, their cursor, their focus

---

## 2.5 Evolutionary Test: Sync Engine

**Option A — Yjs:** Most mature. Huge adoption. Many providers (WebSocket, WebRTC, IndexedDB).

**Option B — Automerge:** Richer data model. Better for nested docs. Rust core (WASM).

**Option C — Loro:** Newest. Fastest benchmarks. Built-in time travel. Smallest bundle.

```typescript
interface SyncEngine extends Module {
  type: 'sync';
  createDoc(id: string): SharedDocument;
  getDoc(id: string): SharedDocument;
  deleteDoc(id: string): void;
  awareness: AwarenessProtocol;          // Who's connected + cursor positions
  onSync(handler: (docId: string) => void): Unsubscribe;
  
  ports: {
    'state-patches': Port<StatePatch>;   // BIDI
    'awareness': Port<AwarenessUpdate>;  // OUT
  };
}
```

Score on: sync latency, conflict resolution quality, memory usage, time-travel support, bundle size.

---

## 2.6 Bootstrap Sequence

```
1. Create ModuleRegistry                    (the skeleton)
2. Register DeviceAdapter                   (know the device)
3. Register SyncEngine (winner)             (multiplayer from start)
4. Register CanvasRenderer (winner)         (display the scene)
5. Register TimelineEngine                  (start recording)
6. Init all in dependency order
7. Render empty canvas — system is alive
```

---

## 2.7 Build Instructions

```
1. /packages/device-adapter — Implement DeviceAdapter. Browser API detection.
2. /packages/canvas-threejs — Three.js CanvasRenderer implementation
3. /packages/canvas-babylon — Babylon.js CanvasRenderer implementation
4. /packages/canvas-playcanvas — PlayCanvas CanvasRenderer implementation
5. /packages/sync-yjs — Yjs SyncEngine implementation
6. /packages/sync-automerge — Automerge SyncEngine implementation
7. /packages/sync-loro — Loro SyncEngine implementation
8. Run benchmarks on all 3 canvas renderers → SELECT winner
9. Run benchmarks on all 3 sync engines → SELECT winner
10. Wire winners into bootstrap sequence → empty canvas renders
```

---

## 2.8 Validation Criteria

```
✅ DeviceAdapter registers, detects screen size and input correctly
✅ Canvas renderer (winner) renders a scene with 5 objects at ≥55fps
✅ Canvas responds to DeviceAdapter resize events
✅ Raycasting selects objects correctly
✅ Sync engine (winner): Two clients sync within 100ms
✅ Sync engine: Offline edit merges without data loss
✅ Sync engine: Awareness shows connected peers
✅ Bootstrap: All modules init in order, health checks pass
✅ Empty canvas renders on desktop and mobile viewports
```

---

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS (BOTTOM)      │
# └─────────────────────────────────────┘
- [2.1 Adaptive Canvas Runtime](#21-adaptive-canvas-runtime)
- [2.2 Evolutionary Test: Canvas Renderer](#22-evolutionary-test-canvas-renderer)
- [2.3 Device Adapter Module](#23-device-adapter-module)
- [2.4 Multiplayer Sync](#24-multiplayer-sync)
- [2.5 Evolutionary Test: Sync Engine](#25-evolutionary-test-sync-engine)
- [2.6 Bootstrap Sequence](#26-bootstrap-sequence)
- [2.7 Build Instructions](#27-build-instructions)
- [2.8 Validation Criteria](#28-validation-criteria)
