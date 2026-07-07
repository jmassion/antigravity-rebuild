# 📏 Global Agent Rules

Rules that ALL agents in the AntiGravity ecosystem must follow.

## Core Principles

1. **Never delete without confirmation** — Always ask before removing files, data, or configurations
2. **Commit often, push intentionally** — Make granular commits; push when a logical unit is complete
3. **Document as you go** — Update relevant wiki pages when you make structural changes
4. **Respect locks** — Check `_orchestration/status.json` before modifying shared files

## File Conventions

| Rule | Details |
|------|---------|
| **Naming** | Use lowercase with hyphens: `my-page-name.md` |
| **Folders** | Prefix with number for ordering: `00-getting-started/` |
| **README.md** | Every folder must have one — it's the section landing page |
| **Cross-links** | Use `[[wiki-link]]` syntax for internal references |
| **Tags** | Use YAML frontmatter `tags: [tag1, tag2]` when applicable |

## Communication Protocol

- Update `_orchestration/status.json` when starting/finishing tasks
- Acquire locks before modifying shared resources
- Release locks promptly when done
- Log significant actions in [[12-chat-logs]]

## Safety Rules

- ⚠️ **Never hardcode credentials** — use environment variables
- ⚠️ **Always verify external skills** for bugs and malicious code
- ⚠️ **Test changes locally** before pushing to production
- ⚠️ **Back up data** before destructive operations

---

See also: [[05-rules]], [[05-rules/code-rules]], [[02-agents/orchestration]]
