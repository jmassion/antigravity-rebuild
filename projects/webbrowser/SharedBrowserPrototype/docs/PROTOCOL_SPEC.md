# Protocol Spec (WebSocket Control Plane)

## Common Fields
- `type`
- `roomId` (when applicable)

## Client -> Server
- HELLO
- JOIN_ROOM
- REQUEST_CONTROL
- RELEASE_CONTROL
- MOVE_SURFACE
- SEND_INPUT (must include `cap`)

## Host -> Server
- HELLO
- JOIN_ROOM
- PUBLISH_SURFACE
- UNPUBLISH_SURFACE

## Server -> Client/Host
- ROOM_STATE
- CONTROL_GRANTED (includes cap)
- CONTROL_DENIED
- FORWARD_INPUT (to host)
- ERROR

## Capability Tokens (v0)
- HMAC SHA-256 signature over JSON payload
Payload includes:
- capType, roomId, surfaceId, userId, scopes, expiresAt
Signature included as `sig`.

