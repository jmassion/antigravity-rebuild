# 🌐 Global Rules

Rules that apply to ALL agents and ALL work in the AntiGravity ecosystem.

## Core Mandates

1. **Always push changes** — Every commit should be pushed immediately for live preview
2. **Always check orchestration** — Read `_orchestration/status.json` before starting work
3. **Always use wiki links** — Cross-reference with `[[wiki-links]]` instead of plain URLs
4. **Always document decisions** — Every non-trivial choice gets a note in [[10-changelog]]
5. **Never store secrets in git** — Use Vercel env vars or `.env.local` (gitignored)

## Quality Standards

- **Design**: Must meet Liquid Glass aesthetic standards ([[04-styles/liquid-glass]])
- **Code**: Must be clean, commented, and follow conventions ([[05-rules/code-rules]])
- **Content**: Must be well-formatted and cross-linked ([[05-rules/content-rules]])
- **Commits**: Must follow the commit convention ([[00-getting-started/02-github-setup]])

## Safety Rules

- **Verify external skills** before installation — check for bugs, malice, and recency
- **Never auto-approve destructive operations** — deletions, overwrites, prod deploys
- **Lock files** when editing — use the orchestration system
- **Backup before major changes** — commit and push before refactoring

## Agent Behavior

- Agents should be proactive but safe
- Agents should prefer visual communication (images, diagrams) alongside text
- Agents should update the wiki as they work
- Agents should save chat logs to [[12-chat-logs]]

---

See also: [[05-rules]], [[05-rules/code-rules]], [[02-agents/orchestration]]
