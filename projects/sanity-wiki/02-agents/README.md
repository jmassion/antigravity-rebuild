# 🤖 Agents

AI agent configuration, orchestration, and coordination for the AntiGravity ecosystem.

## Overview

Agents are AI assistants that help build, organize, and maintain the projects. Each agent has a defined role, set of skills, and coordination rules.

## Pages

| Page | Description |
|------|-------------|
| [[02-agents/agent-registry]] | All agents and their roles |
| [[02-agents/orchestration]] | Parallel task coordination system |

## Agent Types

| Type | Description | Example |
|------|-------------|---------|
| **Builder** | Creates code, content, and assets | AntiGravity main agent |
| **Reviewer** | Validates quality and consistency | Code review agent |
| **Coordinator** | Manages task distribution | Orchestration agent |
| **Specialist** | Domain-specific expertise | 3D design, CRM, etc. |

## Rules

Agent-specific rules are stored in [[05-rules]]. Key rules:

1. **Always check orchestration status** before starting work
2. **Lock files** you're actively editing
3. **Report status** to `_orchestration/status.json`
4. **Never overlap** with another agent's locked resources
5. **Download skills carefully** — always verify for bugs/malice and check recency

---

See also: [[02-agents/orchestration]], [[03-skills]], [[05-rules]]
