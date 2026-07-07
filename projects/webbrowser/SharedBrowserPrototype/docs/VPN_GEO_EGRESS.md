# VPN / Geo Egress (Per Container/Surface)

Attach an egressPolicy to container/surface:
- region, country, provider, staticIpRequired, rotation

Guidance:
- authenticated sessions prefer static IP + failover-only rotation
- disposable sessions can rotate more freely

Implementation options:
- regional NAT gateways
- per-container WireGuard
- per-host VPN

Scheduler must place containers on hosts that satisfy egressPolicy.

