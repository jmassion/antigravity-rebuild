# 🔗 Backlink System

How bidirectional linking works in the wiki.

## How It Works

1. **Authors write `[[wiki-links]]`** in any markdown file
2. **The wiki browser parses** all markdown files on load
3. **A backlink index** is computed in memory (and cached to `_backlinks/index.json`)
4. **Every page shows** a "Backlinks" panel listing all pages that link TO it

## Link Syntax

```markdown
<!-- Link to a section (resolves to README.md) -->
[[02-agents]]

<!-- Link to a specific page -->
[[02-agents/orchestration]]

<!-- Link with display text -->
[[02-agents/orchestration|Agent Orchestration]]
```

## Backlink Index Format

```json
{
  "02-agents/orchestration": {
    "linkedFrom": [
      { "page": "00-getting-started/README", "context": "The [[02-agents/orchestration]] system prevents conflicts" },
      { "page": "01-framework/README", "context": "See [[02-agents/orchestration]] for coordination" }
    ]
  }
}
```

## Why Backlinks Matter

- **Discoverability**: Find related content you didn't know existed
- **Completeness**: See the full picture of how concepts connect
- **Maintenance**: Know what will break when you rename/move a page
- **Agent-friendly**: Agents can traverse the knowledge graph

## Future: Sanity References

When migrated to Sanity Studio, `[[wiki-links]]` become proper Sanity references with:
- Type-safe linking
- Referential integrity
- Visual graph explorer

---

See also: [[01-framework/schema-design]], [[00-getting-started/05-conventions]]
