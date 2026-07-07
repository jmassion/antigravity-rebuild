# ⚡ Skills

Reusable skill library for AI agents.

## Overview

Skills are well-defined capabilities that agents can use to accomplish tasks. Each skill has a name, description, and set of instructions.

## Skill Template

```markdown
---
name: Skill Name
description: Brief description of what this skill does
version: 1.0
author: agent-name
tags: [category, subcategory]
---

## Prerequisites
What the agent needs before using this skill.

## Instructions
Step-by-step instructions for the agent.

## Verification
How to verify the skill was executed correctly.
```

## Current Skills

| Skill | Description | Status |
|-------|-------------|--------|
| Wiki Page Creation | Create properly formatted wiki pages | ✅ Active |
| Git Commit & Push | Stage, commit, and push changes | ✅ Active |
| Vercel Deploy | Deploy to Vercel production | ✅ Active |
| Backlink Update | Rebuild backlink index | ✅ Active |

## Adding New Skills

1. Create a new `.md` file in [[03-skills]]
2. Follow the skill template above
3. Add to the table in this README
4. Cross-reference from [[02-agents/agent-registry]]

## Safety Rules

When downloading or adding external skills:
- ⚠️ **Always verify for bugs and malicious code**
- ⚠️ **Check the recency** — outdated skills may reference deprecated APIs
- ⚠️ **Test in isolation** before applying to production
- ⚠️ **Document origin** — where the skill came from

---

See also: [[02-agents]], [[05-rules]], [[02-agents/agent-registry]]
