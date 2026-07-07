# 🏢 Organizations

Organization and company tracking for the AntiGravity ecosystem.

## Organization Schema

Each organization entry should include:

| Field | Type | Description |
|-------|------|-------------|
| **Name** | text | Company/org name |
| **Type** | enum | `company`, `agency`, `nonprofit`, `platform`, `internal` |
| **Website** | url | Primary website |
| **Industry** | text | Industry sector |
| **Contacts** | links | Related [[08-crm/contacts]] entries |
| **Relationship** | enum | `client`, `vendor`, `partner`, `platform` |
| **Status** | enum | `active`, `inactive`, `prospect` |
| **Notes** | text | Context and relationship details |

## Key Organizations

### Internal
| Organization | Type | Purpose |
|-------------|------|---------|
| AntiGravity | Internal | Parent company / umbrella brand |
| HolodeckOS | Internal | Platform brand |
| AlphaUnicorn | Internal | Business consultancy |

### Platforms & Services
| Platform | Relationship | Usage |
|----------|-------------|-------|
| Vercel | Platform | Web hosting & deployment |
| GitHub | Platform | Source control |
| SiteGround | Vendor | DNS & domain management |
| Air.inc | Platform | Digital asset management |

## Integration Plans

- **DenchClaw CRM** — Company tracking with linked contacts
- **Sanity Studio** — Schema-driven organization management
- Link companies ↔ contacts ↔ projects for full relationship graph

---

See also: [[08-crm]], [[08-crm/contacts]], [[09-core-objects/companies-orgs]]
