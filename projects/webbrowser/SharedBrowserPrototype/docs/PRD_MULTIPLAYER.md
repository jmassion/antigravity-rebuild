# PRD — Multiplayer + Permissions

## Vision
A shared 3D browser world where each screen is a Surface with game-level permissions:
- Some surfaces are private.
- Some are view-only.
- Some can be co-controlled with locks and approvals.
- Multiple users can bring their own logged-in sessions.

## Must-have (v1)
- Rooms: create/join with link/code
- Presence: users in room
- Surfaces: publish/unpublish, move, bind to host targets
- Policies: visibility + control modes
- Locks: soft lock (timeout), hard lock (explicit)
- Capability tokens: short-lived VIEW/CONTROL caps; revokeable
- Audit events (metadata only by default)

## Should-have (v1.5)
- Role templates
- Surface panic hide + revoke
- Re-share and clone controls

## Nice-to-have (v2)
- Multi-room portals
- Enterprise org policies + SSO

## Non-goals (initial)
- Sharing cookies/credentials between users
- Circumventing iframe/CSP restrictions
- Perfect high-FPS video at large scale without optimization

