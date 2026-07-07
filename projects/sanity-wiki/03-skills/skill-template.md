# ⚡ Skill Template

Use this template to create new reusable skills for AI agents.

## Template

```markdown
---
name: [Skill Name]
description: [What this skill does in one sentence]
version: 1.0
author: [agent-name or human author]
tags: [category, subcategory]
requires: [list any prerequisites or dependencies]
---

# [Skill Name]

## Purpose
Explain what this skill accomplishes and when to use it.

## Prerequisites
- [ ] Required tool/CLI installed
- [ ] Required credentials/access
- [ ] Required files/data available

## Instructions

### Step 1: [Description]
```command or code```

### Step 2: [Description]
```command or code```

### Step 3: [Description]
```command or code```

## Verification
How to confirm the skill executed successfully:
- [ ] Check 1
- [ ] Check 2

## Error Handling
Common errors and how to resolve them:

| Error | Cause | Fix |
|-------|-------|-----|
| Error A | Reason | Solution |

## Examples
Show concrete usage examples.
```

## Best Practices

1. **Keep skills atomic** — one skill = one well-defined task
2. **Include verification** — always explain how to confirm success
3. **Document errors** — common failure modes save debugging time
4. **Version your skills** — bump version when making breaking changes
5. **Tag appropriately** — tags enable discovery and search

---

See also: [[03-skills]], [[02-agents/agent-registry]]
