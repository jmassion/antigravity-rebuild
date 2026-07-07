# 📊 Schema Design

How objects relate to each other — designed for eventual Sanity Studio migration.

## Entity Relationship Overview

```
World ──has──> Environment ──contains──> Character
                                         Object
                                         Workstation

Character ──belongs-to──> Team
Character ──works-on──> Project
Character ──uses──> Workstation

Project ──has──> Task
Project ──has──> Timeline
Project ──belongs-to──> Company

Company ──has──> Person
Company ──has──> Project

Tag ──applied-to──> (any object)
```

## Sanity-Ready Schema Patterns

Each object type follows this pattern:

```javascript
// Example: Character schema (future Sanity Studio)
export default {
  name: 'character',
  title: 'Character',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', title: 'Name' },
    { name: 'role', type: 'string', title: 'Role' },
    { name: 'team', type: 'reference', to: [{ type: 'team' }] },
    { name: 'workstation', type: 'reference', to: [{ type: 'workstation' }] },
    { name: 'skills', type: 'array', of: [{ type: 'string' }] },
    { name: 'appearance', type: 'object', fields: [
      { name: 'avatar', type: 'image' },
      { name: 'model3d', type: 'url' }
    ]},
    { name: 'tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }
  ]
}
```

## Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| `has` | Ownership/containment | World has Environments |
| `belongs-to` | Membership | Character belongs to Team |
| `works-on` | Activity | Character works on Project |
| `references` | Loose link | Page references Page |
| `tags` | Classification | Any object tagged with Tag |

---

See also: [[01-framework/core-objects]], [[11-planning/sanity-studio]], [[01-framework/backlink-system]]
