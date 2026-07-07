# 👤 Contacts

People tracking and contact management for the AntiGravity ecosystem.

## Contact Schema

Each contact entry should include:

| Field | Type | Description |
|-------|------|-------------|
| **Name** | text | Full name |
| **Role** | text | Job title or relationship role |
| **Organization** | link | Link to [[08-crm/organizations]] entry |
| **Email** | text | Primary email |
| **Phone** | text | Primary phone |
| **Tags** | list | Categories: `client`, `vendor`, `partner`, `team` |
| **Notes** | text | Context and relationship history |
| **Last Contact** | date | Most recent interaction |

## Contact Categories

| Category | Description |
|----------|-------------|
| **Team** | Internal team members and collaborators |
| **Clients** | Current and prospective clients |
| **Partners** | Strategic partners and affiliates |
| **Vendors** | Service providers and contractors |
| **Network** | Extended professional network |

## Integration Points

- **DenchClaw CRM** — Structured contact database with Kanban boards
- **Sanity Studio** — Future schema-driven contact management
- **Email** — Communication history tracking

## Adding Contacts

For now, contacts can be documented inline in this file or as separate `.md` files.
Future integration with [[11-planning/sanity-studio]] will provide structured data entry.

---

See also: [[08-crm]], [[08-crm/organizations]], [[09-core-objects/characters-teams]]
