# 🎼 Orchestration System

This folder contains real-time coordination files for parallel AI agents.

## Files

| File | Purpose |
|------|---------|
| `status.json` | Current state of all active agents |
| `lock-registry.json` | File-level locks |

## Protocol

1. **Before starting work**: Read `status.json`
2. **Before editing a file**: Check `lock-registry.json`
3. **During work**: Update your agent status periodically
4. **After finishing**: Release all locks, update status to `idle`

## Full Documentation

See [[02-agents/orchestration]] for the complete orchestration protocol.
