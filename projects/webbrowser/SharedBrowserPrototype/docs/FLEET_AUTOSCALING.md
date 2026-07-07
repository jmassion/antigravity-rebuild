# Fleet Autoscaling + Scheduling (Remote Hosts)

Host types:
- Personal Desktop Host (best for already logged-in)
- Managed Remote Host (autoscaled; Playwright/Electron contexts)

Scheduling inputs:
- region/latency, egress policy, load, account sensitivity

Rules:
- scale out on high memory/encode/queue
- scale in when idle
- keep logged-in containers long-lived to avoid re-auth storms

