# ╔══════════════════════════════════════════════════════════════╗
# ║  🔌 PHASE 4: THE CONNECTION LAYER                          ║
# ║  MCP, APIs, CLI, automation, pipes, permissions             ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS               │
# └─────────────────────────────────────┘
- [4.1 MCP — Universal Adapter Protocol](#41-mcp)
- [4.2 Automation Bridges (n8n, Zapier)](#42-automation-bridges)
- [4.3 CLI & Shell Access](#43-cli-shell-access)
- [4.4 Pipe Visualization](#44-pipe-visualization)
- [4.5 Permission Architecture](#45-permission-architecture)
- [4.6 Build Instructions](#46-build-instructions)
- [4.7 Validation Criteria](#47-validation-criteria)

---

## 4.1 MCP

MCP servers are the primary connection mechanism. Each becomes a visible pipe on canvas:

| MCP Server | Connects To | Data That Flows |
|------------|-------------|-----------------|
| Gmail MCP | Email | Messages, threads, drafts |
| Google Calendar MCP | Calendar | Events, free/busy, attendees |
| Figma MCP | Design files | Designs, screenshots, variables |
| GitHub MCP | Repositories | Files, PRs, issues, commits |
| Slack MCP | Team messaging | Messages, channels, threads |
| Filesystem MCP | Files | File contents, directory trees |
| Database MCP | Databases | Query results, schema info |

```typescript
interface MCPConnector extends Module {
  type: 'pipe';
  connect(serverUrl: string, config: MCPConfig): Promise<void>;
  disconnect(): void;
  listTools(): MCPTool[];
  callTool(name: string, args: Record<string, unknown>): Promise<MCPResult>;
  
  ports: {
    'requests': Port<MCPRequest>;    // BIDI
    'responses': Port<MCPResponse>;  // BIDI
  };
}
```

---

## 4.2 Automation Bridges

**n8n (self-hosted on DigitalOcean):** 400+ integrations. Trigger via webhook. Full control.

**Zapier:** 6000+ integrations. Cloud-hosted. Quick connections to niche services.

**Plaid:** Financial data. Bank accounts, transactions. Critical for home management.

```typescript
interface AutomationBridge extends Module {
  type: 'pipe';
  triggerWorkflow(webhookUrl: string, payload: unknown): Promise<unknown>;
  registerWebhook(path: string, handler: (data: unknown) => void): string;
  
  ports: {
    'triggers': Port<WebhookTrigger>;   // BIDI
    'results': Port<WebhookResult>;     // BIDI
  };
}
```

---

## 4.3 CLI Shell Access

Permissioned, logged, sandboxed shell execution:

```typescript
interface CLIAccess extends Module {
  type: 'pipe';
  execute(command: string, options: CLIOptions): Promise<CLIResult>;
  allowedCommands: string[];
  sandboxLevel: 'full' | 'restricted' | 'readonly';
  timeout: number;
  
  ports: {
    'commands': Port<CLICommand>;
    'stdout': Port<string>;
    'stderr': Port<string>;
  };
}
```

All commands logged to timeline. stdout/stderr visible on canvas in agent workspace.

---

## 4.4 Pipe Visualization

Every connection draws as a visible pipe showing:
- **State:** green (active), amber (idle), red (error), gray (not permitted)
- **Flow:** animated particles when data transfers
- **Volume:** thickness = throughput
- **Direction:** arrows for flow direction
- **Lock:** padlock for encrypted, open for unencrypted
- **Permission:** who can see/use this pipe

---

## 4.5 Permission Architecture

```typescript
interface PermissionSet {
  canRead: ResourcePattern[];
  canWrite: ResourcePattern[];
  canExecute: CommandPattern[];
  canDelegate: boolean;
  rateLimits: RateLimit[];
  quotas: Quota[];
  expiry: Date | null;
}
```

Permissions are **visual and spatial** — granting access creates a visible pipe. Revoking disconnects it. Not buried in settings panels.

---

## 4.6 Build Instructions

```
IN /packages/pipes-mcp:
  1. MCP client that connects to any MCP server URL
  2. Tool discovery and invocation
  3. Visual pipe component (state, flow animation, direction)
  4. Error handling and reconnection

IN /packages/pipes-cli:
  1. Sandboxed shell execution
  2. Command whitelist, timeout, sandbox levels
  3. stdout/stderr streaming to canvas
  4. All commands logged to timeline

IN /packages/pipes-automation:
  1. Webhook trigger (outbound to n8n/Zapier)
  2. Webhook receiver (inbound results)
  3. Plaid integration for financial data

IN /packages/auth:
  1. User authentication (Clerk default, swappable)
  2. Permission sets per user and per agent
  3. Visual indicators (lock/unlock/blocked on pipes)
  4. Rate limits and quotas
```

---

## 4.7 Validation Criteria

```
✅ MCP connector connects to a test MCP server, lists tools, calls tool
✅ CLI executes whitelisted command, captures stdout
✅ CLI blocks non-whitelisted command
✅ Automation bridge triggers webhook, receives result
✅ Pipe visualization shows correct state (green/amber/red)
✅ Data flow animation activates during transfer
✅ Auth: user authenticates, permissions loaded
✅ Auth: unauthorized pipe access blocked, visual shows blocked state
✅ All pipe events recorded on timeline
```

---

# ┌─────────────────────────────────────┐
# │  📖 TABLE OF CONTENTS (BOTTOM)      │
# └─────────────────────────────────────┘
- [4.1 MCP](#41-mcp)
- [4.2 Automation Bridges](#42-automation-bridges)
- [4.3 CLI Shell Access](#43-cli-shell-access)
- [4.4 Pipe Visualization](#44-pipe-visualization)
- [4.5 Permission Architecture](#45-permission-architecture)
- [4.6 Build Instructions](#46-build-instructions)
- [4.7 Validation Criteria](#47-validation-criteria)
