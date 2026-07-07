# Master Agent Prompt (copy/paste into Claude/Codex)

Build TabSpace Multiplayer: server + host + client with permissions.

## Required demo behaviors
- Host publishes 2 surfaces into a room
- Client joins room and sees surfaces
- Client requests control for a surface
- Server grants control via signed capability token + soft lock
- Client sends input including cap
- Server forwards input to host only if authorized
- Host rejects input if cap invalid/expired

Use docs/PROTOCOL_SPEC.md as the contract.

