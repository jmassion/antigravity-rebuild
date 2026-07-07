# Permissions Model — Surfaces, Policies, Roles, Locks

## Surface
- A “screen object” in the world.
- Backed by a host target (tab/page/session).
- Has a Policy and a Transform.

## Policy Dimensions
### Visibility
- HIDDEN: only owner
- PRIVATE: explicit allowlist
- GROUP: role/group based (skeleton treats as allowlist)
- PUBLIC: all room members

### Control Mode
- NONE: view only
- REQUEST: request-to-control; owner approves (skeleton auto-approves)
- SOFT: click takes control; timeouts
- HARD: explicit grant only
- CO: multi-controller (advanced)

### Propagation
- RESHARE: viewers may show same surface elsewhere
- CLONE: viewers may create new surface with same URL but new session

## Locks
- Soft lock with inactivity timeout
- Hard lock until revoked

## Capabilities (Caps)
- Server issues signed caps:
  - VIEW or CONTROL
  - surfaceId, userId, scopes
  - expiresAt
- Hosts require CONTROL cap to inject input.

