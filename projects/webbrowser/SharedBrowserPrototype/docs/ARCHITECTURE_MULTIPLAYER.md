# Multiplayer Architecture — TabSpace World

## Goals
- Many users join a shared 3D world from many device types.
- Real browser sessions stay on “Hosts” (desktop machines or server containers).
- A central “Game Layer” controls what is visible/interactive at the Surface level.

## Actors
### Client (Viewer/Controller)
- Runs in any modern browser (mobile/desktop/VR).
- Renders the 3D world.
- Subscribes to Surface streams based on permissions.
- Sends control requests and input events.

### Host (Surface Provider)
- Runs on a desktop machine (preferred for “already logged in”) or server.
- Creates browser sessions/containers (Chrome profiles, Electron BrowserViews, Playwright contexts).
- Publishes Surfaces into rooms.
- Streams pixels (WebRTC or WS frames).
- Injects input into the real browser target only when allowed (capability token).

### Server (Authoritative Room/Policy Server)
- Authenticates users/hosts (placeholder in this skeleton).
- Maintains room state: surfaces, policies, transforms, presence.
- Enforces permissions and issues capability tokens.
- Maintains locks and timeouts; supports revoke.

## Data Planes
### Control Plane (WebSocket)
- All state changes, requests, permissions, and input pass through server.
- Server is authoritative.

### Media Plane (WebRTC recommended)
- Surface pixels delivered as per-surface video tracks (or WS JPEG for proto).

## Key Concept: Surface
A Surface is an object in the world representing a browser target:
- Owned by a user/org
- Backed by a host session/container
- Governed by a policy (visibility + control)
- Positioned by a transform in a 3D room

