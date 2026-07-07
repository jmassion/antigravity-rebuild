
# Phase 9 — Flow Canvas 3D: Bloom Post-FX, Subgraph Groups, Node Templates & Polish

## Current state (Phase 7/8 reviewed)
The canvas is 1682 lines with: XYZ drag, port wiring, edge deletion (hover button), BFS execution, Z-slider, fit-to-view (F), focus (Space), minimap, context menu, Shift+click multi-select with bounding box, undo/redo (50 steps), auto-save + export/import JSON, inline node rename (double-click), per-type 3D icons, shader edge tubes.

## Critical gaps from review

1. **Bloom NOT wired** — `@react-three/postprocessing` was planned but never added to the import or Canvas. The Canvas still uses plain `gl={{ antialias: true }}` with no EffectComposer.
2. **Group button does nothing** — `selectedIds.size > 1` shows a Users icon indicator but no `NodeGroup` state or `createGroup()` function exists at all.
3. **Run status is generic** — still shows `"processing wave…"`, not node labels.
4. **No Delete key** — keyboard shortcut for deleting selected node is missing (only Ctrl+Z/undo/redo/F/Space handled).
5. **Description in inspector is read-only** — a static `<div>` with `selectedNode.description`, not editable.
6. **Edge type labels missing** — `EdgeTube` has `hovered` state but no `<Text>` label on hover.
7. **Canvas right-click spawn** — unimplemented.
8. **jumpTarget hack** — using a dummy second `FitController` with a fake node to handle minimap jumps; fragile.

## What Phase 9 Builds

### 1. Bloom Post-Processing
- Add `@react-three/postprocessing` dep
- Wrap `GraphScene` in `<EffectComposer><Bloom luminanceThreshold={0.15} intensity={0.8} mipmapBlur /><Vignette /></EffectComposer>`
- `bloomIntensityRef` boosts to 2.5 during execution via a `BloomController` that updates the composer ref

### 2. NodeGroup state + Group Frame
- Add `NodeGroup[]` state + serialization (extend `serializeGraph` to include groups)
- `createGroup()` called from a real Group button that appears when `selectedIds.size >= 2`
- `GroupFrame` R3F component already in plan — translucent bounding box with `<Text>` label
- Delete group button inside the frame

### 3. Delete key shortcut
- In the `onKeyDown` handler: `Delete`/`Backspace` → `deleteNode(selected)` if `selected` is set

### 4. Editable node description
- Inspector: replace `<div>` description with a `<textarea>` that calls `updateNodeDescription(id, text)` on blur
- Add `updateNodeDescription` to mutate helpers

### 5. Run status — show executing node labels
- Track `currentWaveLabel: string` alongside `runStep`
- Update status bar: `[RUNNING] Step 2/5 — Builder AI (agent)…`

### 6. Edge type labels on hover
- Pass `edgeType` prop to `EdgeTube`
- When `hovered`: render `<Text>` at `midPos` with type in uppercase

### 7. Fix jump controller
- Remove the dummy second `FitController` with fake node
- Add `jumpTargetRef` fed into the main `FitController` as a separate `useEffect` branch

### 8. Canvas right-click → spawn menu
- `onContextMenu` on the hidden background plane → record world position via raycaster
- DOM overlay `CanvasSpawnMenu` with 4 quick templates at that screen position

## Files Changed
| File | Changes |
|---|---|
| `src/pages/FlowCanvas3D.tsx` | All Phase 9 features |
| `package.json` | Add `@react-three/postprocessing` |

## Technical Notes

### Bloom wiring
```tsx
// Inside Canvas, after GraphScene:
<EffectComposer>
  <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={isRunning ? 2.2 : 0.8} mipmapBlur />
  <Vignette offset={0.3} darkness={0.55} />
</EffectComposer>
```
Pass `isRunning` as a boolean prop from parent state into a wrapper.

### Group creation
```ts
const createGroup = () => {
  const color = GROUP_COLORS[groups.length % GROUP_COLORS.length];
  const newGroup: NodeGroup = { id: `g${Date.now()}`, label: "Group", nodeIds: [...selectedIds], color };
  setGroups(prev => [...prev, newGroup]);
  setSelectedIds(new Set());
};
```

### Serialization update
```ts
function serializeGraph(nodes, edges, groups) { ... JSON.stringify({ nodes: ..., edges, groups }) }
```

### Run status with node label
```ts
const currentWaveNodes = nodes.filter(n => wave.includes(n.id));
const waveLabel = currentWaveNodes.map(n => `${n.label} (${n.type})`).join(', ');
setCurrentWaveLabel(waveLabel);
// status bar: `[RUNNING] Step ${runStep}/${runTotal} — ${currentWaveLabel}`
```
