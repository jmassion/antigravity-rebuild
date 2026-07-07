# AntiGravity Engine

> A holodeck-like imagination engine where any device becomes a portal into infinite, wishable 3D spaces.

## Philosophy

Every space is an **empty room that listens**. You walk in — with a phone, a laptop, a smart speaker — and you *wish*. Objects appear. Stories unfold. Data breathes as living surfaces.

## Naming

No jargon. No abbreviations. Every name reads like a sentence a human would say.

| Old Paradigm | Our Way |
|---|---|
| SceneGraphNode | Thing |
| InputController | Listener |
| RenderPipeline | Painter |
| TransformComponent | Placement |
| AssetManager | Library |

## Layers

```
7. STORIES    — Wish fulfilment, AI creation
6. TOOLS      — Panels, gizmos, builders
5. MEMORY     — Time, history, branching
4. LIFE       — Physics, gravity, behaviour
3. SENSES     — Input from every device
2. WORLD      — Spaces, things, surfaces
1. FOUNDATION — Core loop, painting, sound
```

## Quick Start

```bash
npm install
npm run dev
```

## SpaceML

Describe 3D worlds in plain English:

```spaceml
space "My Room"
  sky: warm-sunset
  gravity: earth

  thing "Chair"
    shape: box
    size: 0.5m x 0.8m x 0.5m
    surface: oak-wood
    traits:
      - breathes: slow
```
