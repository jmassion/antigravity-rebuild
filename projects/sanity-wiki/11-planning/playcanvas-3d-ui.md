# PlayCanvas Editor MCP Integration

## Overview

The PlayCanvas Editor MCP Server enables AI agents to automate the web-based PlayCanvas Editor for 3D scene manipulation — creating entities, managing assets, writing scripts, and controlling the viewport. This is a **secondary integration** that will be activated once Sanity Studio is fully operational.

## Architecture

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   AI Agent       │ ───► │  PlayCanvas MCP  │ ───► │  PlayCanvas      │
│   (Antigravity)  │      │  Local Node.js   │      │  Editor (Chrome) │
│                  │      │  Port 52000      │      │  via Extension   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

Unlike the Sanity MCP (cloud-hosted), the PlayCanvas MCP is a **local Node.js server** that bridges to a running Chrome tab via a WebSocket-connected extension.

## Components

1. **MCP Server** — Local Node.js app translating agent commands into editor actions
2. **Chrome Extension** — Bridges WebSocket from MCP server to the active PlayCanvas Editor tab
3. **AI Host** — Your agent client (Claude Desktop, Cursor, Antigravity)

## Available Tools

### Entity Management
| Tool | Description |
|------|-------------|
| `list_entities` | List all entities in the scene |
| `create_entities` | Create new entities |
| `delete_entities` | Remove entities |
| `duplicate_entities` | Clone entities |
| `modify_entities` | Change entity properties |
| `reparent_entity` | Move entities in hierarchy |
| `add_components` | Add components to entities |
| `remove_components` | Remove components |
| `add_script_component_script` | Attach scripts |

### Asset Management
| Tool | Description |
|------|-------------|
| `list_assets` | List project assets |
| `create_assets` | Create new assets |
| `delete_assets` | Remove assets |
| `instantiate_template_assets` | Instantiate templates |
| `set_script_text` | Set script content |
| `script_parse` | Parse script files |
| `set_material_diffuse` | Set material colors |

### Scene Control
| Tool | Description |
|------|-------------|
| `query_scene_settings` | Read scene settings |
| `modify_scene_settings` | Change scene settings |

### Store
| Tool | Description |
|------|-------------|
| `store_search` | Search PlayCanvas asset store |
| `store_get` | Get store asset details |
| `store_download` | Download store assets |

### Viewport
| Tool | Description |
|------|-------------|
| `capture_viewport` | Screenshot the viewport |
| `focus_viewport` | Focus on specific entity |

## Installation (When Ready)

### Prerequisites
- Node.js installed
- Chrome browser
- PlayCanvas account (free for personal projects)

### Step 1: Clone MCP Server
```bash
git clone https://github.com/playcanvas/editor-mcp-server
cd editor-mcp-server
npm install
```

### Step 2: Install Chrome Extension
1. Visit `chrome://extensions/` and enable Developer mode
2. Click "Load unpacked" and select the `extension/` folder
3. Open your PlayCanvas project in the editor

### Step 3: Configure MCP Client

**Windows Config:**
```json
{
  "mcpServers": {
    "playcanvas": {
      "command": "cmd",
      "args": ["/c", "npx", "tsx", "C:\\path\\to\\editor-mcp-server\\src\\server.ts"],
      "env": { "PORT": "52000" }
    }
  }
}
```

## Use Cases for AntiGravity

1. **3D UI Prototyping** — Create 3D interfaces with AI assistance
2. **Scene Generation** — Build environments from natural language
3. **Asset Management** — Organize and deploy 3D assets programmatically
4. **Interactive Content** — Link Sanity content to 3D scenes

## Status

**Deferred** — Focus is on completing Sanity Studio + MCP integration first. PlayCanvas setup will begin once:
- [ ] Sanity Studio is deployed and operational
- [ ] MCP content pipeline is established
- [ ] PlayCanvas account is created

## Repository

- GitHub: [playcanvas/editor-mcp-server](https://github.com/playcanvas/editor-mcp-server)
- License: MIT
- Stars: 104
- Requires: Chrome extension for WebSocket bridge

## Related

- [[sanity-studio]] — Primary CMS integration
- [[sanity-mcp]] — Content Lake MCP server
- [[sanity-skills]] — Agent skills for Sanity
