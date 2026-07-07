# 📐 Conventions

These conventions ensure consistency across all wiki content and make the system agent-friendly.

## Wiki Links

Use double-bracket syntax to link between pages:

```markdown
See the [[02-agents]] section for agent configuration.
Link to a specific page: [[02-agents/orchestration]]
```

The wiki browser automatically:
- Resolves `[[section]]` → `section/README.md`
- Resolves `[[section/page]]` → `section/page.md`
- Tracks all links in `_backlinks/index.json`
- Displays a "Backlinks" panel on every page

## Page Template

Every page should follow this structure:

```markdown
# 🎯 Page Title

Brief description of what this page covers.

## Section 1

Content...

## Section 2

Content...

---

*Last updated: YYYY-MM-DD*
See also: [[related-page-1]], [[related-page-2]]
```

## Tags

Add tags to any page using YAML frontmatter:

```markdown
---
tags: [agent, orchestration, setup]
status: active
---

# Page Title
```

## Emoji Conventions

| Emoji | Meaning |
|-------|---------|
| 🚀 | Getting started |
| 🏗️ | Architecture/framework |
| 🤖 | Agents |
| ⚡ | Skills |
| 🎨 | Design/styles |
| 📏 | Rules |
| 💎 | Brand |
| 📡 | Publishing |
| 👥 | CRM/people |
| 🧩 | Core objects |
| 📋 | Changelog |
| 🗺️ | Planning |
| 💬 | Chat logs |
| ⚠️ | Warning |
| ✅ | Done/verified |
| 🔒 | Locked/restricted |

## Status Labels

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress |
| `active` | Current and maintained |
| `archived` | No longer current |
| `planned` | Future implementation |

---

See also: [[00-getting-started/04-folder-structure]], [[01-framework/backlink-system]]
