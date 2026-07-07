# 🎼 Agent Orchestration

How multiple AI agents coordinate in parallel without conflicts.

## The Problem

When multiple agents work simultaneously, they can:
- Edit the same files, causing merge conflicts
- Work on overlapping tasks, wasting resources
- Make incompatible decisions
- Break each other's work

## The Solution: Orchestration Protocol

### 1. Status File (`_orchestration/status.json`)

Every agent reports its state:

```json
{
  "lastUpdated": "2026-04-10T10:00:00Z",
  "agents": {
    "agent-name": {
      "status": "active|idle|waiting|done",
      "currentTask": "Brief description",
      "workingOn": ["file1.md", "file2.js"],
      "warnings": ["Don't modify X until I'm done"],
      "startedAt": "ISO-timestamp",
      "estimatedCompletion": "ISO-timestamp"
    }
  }
}
```

### 2. File Locking (`_orchestration/lock-registry.json`)

Before editing a file, agents must check and acquire a lock:

```json
{
  "locks": {
    "Sanity/index.html": {
      "agent": "antigravity-main",
      "acquired": "2026-04-10T10:00:00Z",
      "reason": "Building wiki browser"
    }
  }
}
```

### 3. Wait Conditions

Agents must wait when:

| Condition | Action |
|-----------|--------|
| File is locked by another agent | Wait for lock release |
| Dependent task is in progress | Wait for completion |
| Schema change in progress | Wait for migration complete |
| Deployment in progress | Wait for deploy to finish |

### 4. Coordination Rules

1. **Check before you start**: Read `status.json` before beginning any task
2. **Lock what you touch**: Acquire locks on files you'll modify
3. **Report progress**: Update your status every major step
4. **Release promptly**: Remove locks as soon as you're done
5. **Warn others**: Use the `warnings` field to flag potential conflicts
6. **Small batches**: Prefer small, frequent commits over large batches

## Best Practices

### Avoiding Conflicts
- Break work into independent, non-overlapping units
- Use separate branches for large features
- Communicate intent clearly in status updates

### Recovery from Conflicts
- If a conflict is detected, the agent that started later yields
- Both agents report the conflict in their status
- The orchestrator (human or coordinator agent) resolves

### Scaling to Many Agents
- Group agents by domain (design, code, content)
- Each domain has a coordinator
- Coordinators communicate through the status file
- Use a message queue for high-frequency coordination (future)

---

See also: [[02-agents]], [[02-agents/agent-registry]], [[05-rules/global-rules]]
