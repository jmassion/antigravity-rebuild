# 📁 Folder Structure

The Sanity wiki follows a numbered-prefix convention for predictable ordering and easy navigation.

## Top-Level Layout

```
Sanity/
├── index.html                    ← Wiki browser SPA
├── app.js                        ← Browser logic
├── style.css                     ← Liquid Glass design system
├── _config.json                  ← Site metadata & nav config
│
├── 00-getting-started/           ← Setup guide (you are here)
├── 01-framework/                 ← Core architecture & schemas
├── 02-agents/                    ← AI agent config & orchestration
├── 03-skills/                    ← Reusable agent skills
├── 04-styles/                    ← Design system & visuals
├── 05-rules/                     ← Global and per-item rules
├── 06-brand/                     ← Brand identity & assets
├── 07-publishing/                ← Publishing & distribution
├── 08-crm/                       ← CRM — people & organizations
├── 09-core-objects/              ← The "playset" — worlds, characters, etc.
├── 10-changelog/                 ← Version history
├── 11-planning/                  ← Future roadmap & vision
├── 12-chat-logs/                 ← Saved agent conversations
│
├── _orchestration/               ← Agent coordination (real-time)
│   ├── status.json               ← Current agent states
│   ├── lock-registry.json        ← File/task locks
│   └── README.md
│
└── _backlinks/                   ← Auto-generated backlink index
    └── index.json
```

## Naming Conventions

| Pattern | Example | Use |
|---------|---------|-----|
| `NN-slug/` | `00-getting-started/` | Top-level sections |
| `README.md` | `00-getting-started/README.md` | Section landing page |
| `NN-slug.md` | `01-prerequisites.md` | Numbered sub-pages |
| `_prefix/` | `_orchestration/` | System/meta folders |
| `slug.md` | `core-objects.md` | Named sub-pages |

## Adding a New Section

1. Create a folder with the next number prefix
2. Add a `README.md` with section overview
3. Add the section to `_config.json`
4. Use `[[wiki-links]]` to cross-reference

## Extending Beyond Sanity/

This wiki is designed to grow. Future folders at the repo root level will follow the same patterns:

- `/Agents/` — Agent configurations (referenced from [[02-agents]])
- `/Skills/` — Shared skills (referenced from [[03-skills]])
- `/Brand/` — Brand assets (referenced from [[06-brand]])

The wiki browser supports linking to any path relative to the repo root.

---

See also: [[00-getting-started/05-conventions]], [[01-framework]]
