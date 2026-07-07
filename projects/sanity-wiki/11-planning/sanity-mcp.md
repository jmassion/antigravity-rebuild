# Sanity MCP Server

## Overview

The Sanity MCP (Model Context Protocol) server enables AI agents to interact directly with the Sanity Content Lake — querying documents, creating content, managing schemas, and orchestrating releases. It is **cloud-hosted by Sanity** at `mcp.sanity.io` (no local installation required).

## Architecture

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   AI Agent       │ ───► │  Sanity MCP      │ ───► │  Content Lake    │
│   (Antigravity)  │      │  mcp.sanity.io   │      │  (Your Data)     │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

## Setup

### Option A: OAuth (Interactive)
```json
{
  "servers": {
    "Sanity": {
      "type": "http",
      "url": "https://mcp.sanity.io"
    }
  }
}
```
Triggers a browser login flow on first connection.

### Option B: Token Auth (Automated Agents)
```json
{
  "servers": {
    "Sanity": {
      "url": "https://mcp.sanity.io",
      "headers": {
        "Authorization": "Bearer sk-YOUR-SANITY-TOKEN"
      }
    }
  }
}
```

### Prerequisites
1. Sanity.io account (free at sanity.io)
2. A project with a `projectId`
3. An API token (created in Sanity Manage)
4. CORS origins configured for your domains

## Available Tools (25+)

### Schema Management
| Tool | Description |
|------|-------------|
| `get_schema` | Retrieve document type definitions |
| `deploy_schema` | Push schema changes to Content Lake |

### Document Operations
| Tool | Description |
|------|-------------|
| `create_documents_from_json` | Create new documents |
| `patch_document_from_json` | Update existing documents |
| `patch_document_from_markdown` | Update using markdown format |
| `query_documents` | GROQ queries against Content Lake |
| `semantic_search` | AI-powered content discovery |

### Release Management
| Tool | Description |
|------|-------------|
| `create_release` | Create a content release |
| `list_releases` | List all releases |
| `schedule_release` | Schedule a release for later |
| `publish_release` | Publish a release immediately |

### Documentation & Rules
| Tool | Description |
|------|-------------|
| `search_docs` | Search Sanity documentation |
| `read_docs` | Read specific doc pages |
| `list_sanity_rules` | List best-practice rules |
| `get_sanity_rules` | Get specific rule details |

### Media
| Tool | Description |
|------|-------------|
| `generate_image` | AI image generation |
| `transform_image` | Image transformations |

### Project Management
| Tool | Description |
|------|-------------|
| `list_projects` | List all your Sanity projects |
| `create_project` | Create a new project |
| `add_cors_origin` | Add CORS-allowed domain |

## Usage Examples

### Query All Wiki Pages
```groq
*[_type == "wikiPage"] {
  title,
  section->{title},
  status,
  _updatedAt
} | order(_updatedAt desc)
```

### Create a Document
```json
{
  "_type": "wikiPage",
  "title": "New Article",
  "status": "draft",
  "body": [
    {
      "_type": "block",
      "children": [
        { "_type": "span", "text": "Content here..." }
      ]
    }
  ]
}
```

### Semantic Search
```
Find all documents related to "agent orchestration and task routing"
```

## Integration with Agent Skills

The MCP server complements the locally installed agent skills:
- **MCP** gives agents **access** to your content (read/write)
- **Skills** give agents **knowledge** to work properly (best practices)

Both work together for optimal results.

## API Credit Usage

| Operation | Credits |
|-----------|---------|
| Read/Query | Standard API |
| Write/Create | AI credits |
| Semantic Search | AI credits |
| Image Generation | AI credits |

Free tier includes limited monthly AI credits.

## Related

- [[sanity-studio]] — Studio architecture and deployment
- [[sanity-skills]] — Installed agent skills
