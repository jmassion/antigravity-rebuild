# Air DAM Browser — Architecture & Context

## What This Is

A standalone, self-contained Digital Asset Management (DAM) browser built in **vanilla HTML/CSS/JS** (no framework dependencies). It mirrors the UI/UX of Air.inc but is designed to work entirely offline with exported JSON data.

This is **NOT** a wrapper around Air.inc — it is a **replacement viewer** that reads exported data and lets you browse 5,000+ media assets with rich metadata, provenance tracking, and multi-view layouts.

## Project Structure

```
AirUIStudy/
├── index.html          # Single-page app shell (sidebar, toolbar, views, detail modal)
├── css/
│   └── styles.css      # All styling — dark theme, layout, components, animations
├── js/
│   ├── app.js          # Main application logic — state management, rendering, event handling
│   └── data.js         # Data layer — currently mock data, replace with real Air export
└── ARCHITECTURE.md     # This file
```

## How It Works

### Data Flow

1. `data.js` exports: `ALL_ASSETS` (array), `BOARDS` (hierarchy), `CUSTOM_FIELD_DEFS`, `TABLE_COLUMNS`, `PILL_COLORS`
2. `app.js` imports these and manages all UI state in a single `state` object
3. The app renders 4 view types: **Gallery**, **Table**, **Board** (Kanban), **Detail Modal**
4. All state (view, sort, filters, favorites, columns) persists to `localStorage`

### State Object (`app.js`)

```js
const state = {
  currentView: 'gallery',       // gallery | table | board
  currentBoard: 'root',         // active board ID
  searchQuery: '',
  sortBy: 'dateCreated',
  sortDir: 'desc',
  selectedAsset: null,          // asset object shown in detail modal
  favorites: new Set(),         // asset IDs
  activeFilters: {},            // { source: 'Lovart', type: 'video', ... }
  columns: [...],               // table column visibility config
  // ... playback state for video/audio
};
```

### Key UI Components

| Component | Location | Description |
|-----------|----------|-------------|
| **Sidebar** | Left panel | Board tree navigation, favorites link, board counts |
| **Toolbar** | Top bar | Search, view toggle, sort dropdown, filter chips |
| **Gallery View** | Main area | CSS grid of asset cards with thumbnails |
| **Table View** | Main area | Sortable data table with configurable columns |
| **Board View** | Main area | Kanban-style board grouping |
| **Detail Modal** | Overlay | Full asset viewer with media player, metadata panels |
| **Filter Chips** | Below toolbar | Type/Source/Tool Name toggleable filter pills |

---

## Data Model — Asset Schema

Each asset in `ALL_ASSETS` has these fields. **When exporting real data from Air.inc, map to this schema:**

```js
{
  // ─── Core Identity ───
  id: 'asset_0001',                    // Unique ID
  name: 'Mechanical Butterfly V2',     // Display name
  type: 'image',                       // image | video | audio | 3d-model
  extension: 'png',                    // File extension

  // ─── File Metadata ───
  size: 4500000,                       // Bytes
  sizeFormatted: '4.3 MB',
  resolution: { width: 2048, height: 1536 },
  duration: null,                      // Seconds (video/audio only)
  durationFormatted: null,             // '2:30' format

  // ─── Timestamps ───
  createdAt: '2026-03-15T10:30:00Z',
  modifiedAt: '2026-03-20T14:00:00Z',
  uploadedAt: '2026-03-16T09:00:00Z',
  uploadedBy: 'Justin Massion',

  // ─── Organization ───
  boards: [{ id: 'lovart_images', title: 'Lovart Images', path: 'Lovart Assets / Lovart Images' }],
  thumbnailUrl: 'https://...',

  // ─── Air.inc Custom Fields (from workspace setup) ───
  customFields: {
    seed: '847291',                     // Generation seed
    thumbnailUrl: null,                 // Override thumbnail
    folderIds: 'folder_123',            // Higgsfield folder mapping
    coverUrl: null,                     // Cover image URL  
    artifactId: 'art_12345',            // Air artifact ID
    toolName: 'generate_image',         // Lovart tool: generate_image, generate_video, etc.
    subAgent: 'ImageSubAgent',          // Lovart sub-agent name
    taskType: 'create',                 // create | edit | transform | analyze
    artifactType: 'image_info',         // Lovart artifact type
    modelId: 'flux-1.1-pro',            // AI model used
    inferenceDuration: '12.4s',         // Generation time
    orientation: 'landscape',           // landscape | portrait | square
    source: 'Lovart',                   // Lovart | Higgsfield
    mediaType: 'image',                 // Same as type
    projectName: 'Pooky Animatronic Design',  // Lovart project name
    threadTitle: 'Generate steampunk robot',  // Lovart thread title
    prompt: 'A steampunk observatory...',     // Generation prompt text
    generationMethod: 'generate_image',       // How it was created
    category: 'generated',              // generated | researched | reference
    isFavourite: 'No',
  },

  // ─── Provenance (from Lovart chat extraction) ───
  provenance: {
    projectId: 'proj_abc123',           // Lovart project ID
    threadId: 'thread_xyz789',          // Lovart thread ID
    actionId: 'action_001',             // Lovart action group ID
    chatOrder: 5,                       // Position in chat (1-indexed)
    totalChatSteps: 12,                 // Total messages in thread
    assistantMessage: 'Here is your steampunk observatory...', // AI response
    referenceImages: [                  // User-uploaded reference images
      { url: 'https://...', label: 'mood board ref' }
    ],
    searchFindings: 'Found 12 steampunk references...', // Research text
    relatedAssetIds: ['asset_0002', 'asset_0003'],      // Same action siblings
    subAgentName: 'image_generation',   // Sub-agent that created this
    toolArguments: { style: 'detailed', aspect: '16:9' }, // Tool params
  },

  // ─── Higgsfield-specific ───
  higgsfield: {
    jobSetType: 'cinematic_studio_video_v2',  // Higgsfield model name
    rawUrl: 'https://d8j0ntlcm91z4.cloudfront.net/...', // CDN URL
    minUrl: 'https://...min.webp',      // Thumbnail
    folderIds: ['c1f08d06-...'],         // Higgsfield folder IDs
  },

  // ─── AI-Generated Metadata ───
  smartSummary: 'A detailed image featuring mechanical components...',
  smartTags: ['steampunk', 'machinery', 'vintage'],
  description: null,
  tags: ['featured'],

  // ─── Video-Only ───
  chapters: [
    { number: 1, title: 'Introduction', startTime: 0, endTime: 15, ... }
  ],
  transcript: [
    { timestamp: 0, timestampFormatted: '0:00', text: 'Welcome...' }
  ],

  // ─── Versioning ───
  versions: [{ id: 'ver_1', number: 1 }],
  apiAssetId: 'a_uuid',               // Air.inc asset ID for API calls
  apiVersionId: 'v_uuid',             // Air.inc version ID
}
```

---

## Data Sources & Import Pipeline

### Source 1: Lovart (`Scraper/lovart/scraping-from-loveart`)

**API**: `api.lovart.ai` + `www.lovart.ai` (JWT auth with refresh tokens)

**Hierarchy**: Projects → Threads → Chat Messages → Assets

**Key data extracted per asset**:
- `prompt_text` — The generation prompt
- `art.source` — Tool name (generate_image, generate_video, etc.)
- `sub_agent_info.sub_agent_name` — Which AI agent handled it
- `image_list` — User-uploaded reference images
- `artifact.search_info.key_findings` — Research/analysis results
- `action_id` — Groups related chat messages together
- Message `type`: user (prompts), assistant (responses), tool_use (generations)

**Category logic** (from `MessageBlock.jsx`):
- `generated` = source includes 'generate_image/video/3d' OR has prompt_text
- `researched` = all other tool results (search, analyze)
- `reference` = user-uploaded via `image_list`

### Source 2: Higgsfield (`Scraper/higgsfield`)

**Data**: `parsed_data.json` (3,184 items synced from Higgsfield API)

**Key fields per item**:
- `job_set_type` — Model name (e.g., `cinematic_studio_video_v2`, `qwen_camera_control`)
- `raw_url` / `min_url` / `thumbnail_url` — CDN links
- `folder_ids` — Organization
- `is_favourite` — User-marked favorites
- Type inferred from URL extension (.mp4 → video, .png → image, .mp3 → audio)

### Source 3: Air.inc (the target platform)

**API**: `api.air.inc` (API key auth)

**The Air Organizer** (`LovartHiggsFieldAirOrganizer/src/`) imports assets from both sources into Air.inc workspaces with:
- Custom fields (source, mediaType, category, generationMethod, toolName, subAgent, etc.)
- Board organization (lovart_images, lovart_videos, lovart_3d, higgsfield_images, etc.)
- Tags and metadata

---

## How to Connect Real Data

### Step 1: Export from Air.inc

Use the Air.inc API to export all assets with their custom fields:

```js
// GET /v1/assets — paginate through all assets
// GET /v1/assets/{id}/custom-fields — get custom fields per asset
// GET /v1/boards — get board hierarchy
```

### Step 2: Transform to this schema

Map the Air.inc API response to the asset schema above. Key mappings:
- Air custom field "Source" → `customFields.source`
- Air custom field "Prompt" → `customFields.prompt`  
- Air custom field "Generation Method" → `customFields.generationMethod`
- Air custom field "Category" → `customFields.category`
- Air custom field "Tool Name" → `customFields.toolName`
- Air custom field "Project Name" → `customFields.projectName`
- Air custom field "Thread Title" → `customFields.threadTitle`

### Step 3: Replace data.js

Replace the `generateAssets()` mock function with:
```js
const ALL_ASSETS = await fetch('/data/exported-assets.json').then(r => r.json());
```

Or for a static build, inline the JSON:
```js
const ALL_ASSETS = [/* exported data */];
```

### Step 4: Enrich with Lovart chat data (optional)

For full provenance, also export the chat history per thread and attach it to assets:
```js
// For each asset with source=Lovart:
// 1. Look up its threadId
// 2. Fetch chat history from Lovart API (or cached export)
// 3. Attach as asset.provenance.chatMessages
```

---

## Board Hierarchy

```
root (Lovart Higgsfield Library)
├── lovart (Lovart Assets)
│   ├── lovart_3d (Lovart 3D Models)
│   ├── lovart_videos (Lovart Videos)
│   └── lovart_images (Lovart Images)
└── higgsfield (Higgsfield Assets)
    ├── higgsfield_images (Higgsfield Images)
    ├── higgsfield_videos (Higgsfield Videos)
    └── higgsfield_audio (Higgsfield Audio)
```

---

## Running Locally

```bash
cd AirUIStudy
npx -y serve -l 3847 .
# Open http://localhost:3847
```

No build step needed. Pure static files.

---

## Custom Field Definitions

These match the Air.inc workspace custom fields. When exporting, map Air field names to these keys:

| Key | Air.inc Field Name | Type | Values |
|-----|--------------------|------|--------|
| `source` | Source | select | Lovart, Higgsfield |
| `mediaType` | Media Type | select | image, video, audio, 3d-model |
| `category` | Category | select | generated, researched, reference |
| `generationMethod` | Generation Method | select | generate_image, generate_video, generate_3d, search_image, analyze, user_upload |
| `toolName` | Tool Name | select | generate_image, generate_video, edit_video_ffmpeg, generate_3d, search_image, analyse_image |
| `subAgent` | Sub Agent | select | VideoSubAgent, ImageSubAgent, 3DSubAgent, ResearchSubAgent |
| `projectName` | Project Name | text | Lovart project name |
| `threadTitle` | Thread Title | text | Lovart thread/conversation title |
| `prompt` | Prompt | text | Full generation prompt |
| `modelId` | Model ID | text | AI model identifier |
| `seed` | Seed | text | Generation seed number |
| `artifactType` | Artifact Type | select | image_info, video_info, 3d_info, reference_image |
| `orientation` | Orientation | select | landscape, portrait, square |
| `isFavourite` | Is Favourite | select | Yes, No |

---

## Key Files in the Parent Project

```
LovartHiggsFieldAirOrganizer/
├── src/
│   ├── air-client.js           # Air.inc API client (import, boards, custom fields)
│   ├── config.js               # API keys and configuration
│   └── importers/
│       ├── lovart.js           # Lovart → Air.inc importer (extracts chat/media/metadata)
│       └── higgsfield.js       # Higgsfield → Air.inc importer
├── data/
│   └── workspace-state.json    # Cached Air workspace state (boards, fields, etc.)
└── AirUIStudy/                 # ← THIS PROJECT (the DAM browser)
```

Related projects:
- `Scraper/lovart/scraping-from-loveart/` — Lovart Explorer (React, Vite, deploys to Vercel)
- `Scraper/higgsfield/` — Higgsfield Browser (vanilla HTML, reads parsed_data.json)

---

## Deployment & Live Access

### Git Repository

- **Repo**: `https://github.com/jmassion/AntiGravity.git`
- **Branch**: `main`
- **Path in repo**: `Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy/`

### Vercel Projects (from the same repo)

All the following Vercel projects deploy from the **same GitHub repo** (`jmassion/AntiGravity`), each with its own root directory:

| Vercel Project | Domain | Root Directory | What It Does |
|:---|:---|:---|:---|
| `anti-gravity` | `ag.holodeckos.com` | `/` (repo root) | Main AntiGravity dashboard |
| `contentengine` | `contentengine.holodeckos.com` | `Scraper/LovartHiggsFieldAirOrganizer/` | Air Organizer API (Lovart/HF import APIs) |
| `lovart-explorer` | `lovart.holodeckos.com` | `Scraper/LovArt/scraping-from-loveart/` | Lovart chat/thread explorer |
| `browser` | `browser.holodeckos.com` | (TBD) | General browser view |
| **`air-dam-browser`** | **`dam.holodeckos.com`** (to be configured) | `Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy/` | **THIS project** — DAM browser UI |

### Setting Up the AirUIStudy Vercel Project

This project needs its own Vercel project because it's in a sub-directory. Steps:

1. Go to Vercel → "Add New Project"
2. Select the `jmassion/AntiGravity` GitHub repo
3. Set **Root Directory** to: `Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy`
4. Framework: **Other** (no framework)
5. Build Command: leave blank (static files, no build)
6. Output Directory: `.`
7. After deploying, add a custom domain: `dam.holodeckos.com`
8. In SiteGround DNS, add a CNAME record: `dam → cname.vercel-dns.com`

### Running Locally

```bash
cd Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy
npx -y serve -l 3847 .
# Open http://localhost:3847
```

No build step needed. Pure static HTML/CSS/JS.

---

## Claude Code Handoff — Data Export Pipeline

### Overview

The DAM browser currently uses **mock data** (generated in `data.js`). The next step is to connect it to **real exported data** from Air.inc. The pipeline is:

```
Air.inc API → Export JSON → Google Drive → DAM Browser (data.js)
```

### Step 1: Export Assets from Air.inc

Use the Air.inc API to paginate through all assets with custom fields:

```js
// Air.inc API — REST, API key auth
// Base URL: https://api.air.inc
// Auth header: Authorization: Bearer <API_KEY>

// 1. List all boards
GET /v1/boards

// 2. List assets (paginated)
GET /v1/boards/{boardId}/assets?cursor={cursor}&limit=100

// 3. Get asset details with custom fields  
GET /v1/assets/{assetId}
// Returns: name, type, versions, custom_fields, boards, etc.
```

The Air API key is stored in `Scraper/LovartHiggsFieldAirOrganizer/src/config.js` as `AIR_API_KEY`.
The workspace ID is also in that config file.

### Step 2: Export Media Files to Google Drive

For each asset exported from Air.inc:

1. **Download the media file** from the Air.inc CDN URL (the `downloadUrl` in the API response)
2. **Upload to Google Drive** organized by board/source:
   ```
   Google Drive/
   └── AntiGravity Media/
       ├── Lovart/
       │   ├── Images/
       │   ├── Videos/
       │   └── 3D Models/
       └── Higgsfield/
           ├── Images/
           ├── Videos/
           └── Audio/
   ```
3. **Store the Google Drive share link** in the asset JSON so the DAM browser can reference it

### Step 3: Generate the Data JSON

Create a consolidated export file that maps to the schema in this doc:

```js
// Export to: AirUIStudy/data/exported-assets.json
{
  "assets": [
    {
      "id": "air_asset_uuid",
      "name": "...",
      "type": "image",
      // ... all fields from the Asset Schema section above
      "mediaUrl": "https://drive.google.com/...",  // Google Drive link
      "thumbnailUrl": "https://...",                // CDN thumbnail
      "customFields": { /* Air custom fields mapped */ },
      "provenance": { /* Lovart chat data if available */ },
      "higgsfield": { /* HF metadata if available */ }
    }
  ],
  "boards": [/* board hierarchy */],
  "exportedAt": "2025-04-07T18:00:00Z"
}
```

### Step 4: Update data.js to Load Real Data

Replace the mock `generateAssets()` call in `data.js` with:

```js
// Option A: Fetch from file (for Vercel deployment)
let ALL_ASSETS = [];
const response = await fetch('/data/exported-assets.json');
const data = await response.json();
ALL_ASSETS = data.assets;

// Option B: Fetch from API endpoint (dynamic)
const response = await fetch('https://contentengine.holodeckos.com/api/air');
const data = await response.json();
ALL_ASSETS = data.assets;
```

### Important: The Air Organizer APIs

The parent project (`LovartHiggsFieldAirOrganizer/`) already has Vercel API routes that can serve as the backend:

- **`/api/air.js`** — Proxies requests to the Air.inc API
- **`/api/lovart.js`** — Proxies requests to the Lovart API

These deploy to `contentengine.holodeckos.com`. The DAM browser can call these APIs at runtime to fetch live data instead of relying on static JSON exports.

### Key Environment Variables

These are set in Vercel env vars for the `contentengine` project:

| Variable | Purpose |
|:---|:---|
| `AIR_API_KEY` | Air.inc workspace API key |
| `AIR_WORKSPACE_ID` | Air.inc workspace ID |
| `LOVART_TOKEN` | Lovart JWT access token (auto-refreshed daily) |
| `LOVART_REFRESH_TOKEN` | Lovart refresh token |

### Import Scripts (already built by Claude Code)

Claude Code has already created Python import scripts in the parent directory:

| Script | Purpose |
|:---|:---|
| `run-import.py` | General Air.inc asset importer |
| `run-lovart-import.py` | Lovart → Air.inc importer (chat extraction) |
| `run-lv-v2.py` | Lovart v2 importer (enhanced) |
| `run-hf-v2.py` | Higgsfield → Air.inc importer |

And data files:

| File | Purpose |
|:---|:---|
| `data/dedup-plan.json` | De-duplication plan for v1 asset cleanup |
| `data/field-map.json` | Air.inc custom field ID → name mapping |
| `data/hf-import-v2.json` | Higgsfield import state |
| `data/lv-import-v2.json` | Lovart import state |
| `data/import-progress.json` | Overall import progress tracking |

---

## Architecture Summary for Claude Code

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                              │
│                                                              │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │  Lovart API  │   │ Higgsfield   │   │   Air.inc    │     │
│  │ (chat/media) │   │  (media DB)  │   │  (DAM API)   │     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘     │
│         │                  │                   │              │
│         ▼                  ▼                   ▼              │
│  ┌─────────────────────────────────────────────────┐         │
│  │        Import Scripts (Python)                   │         │
│  │  run-lovart-import.py / run-hf-v2.py            │         │
│  │  Normalize → Enrich → Upload to Air.inc         │         │
│  └─────────────────────┬───────────────────────────┘         │
│                        │                                      │
│                        ▼                                      │
│  ┌─────────────────────────────────────────────────┐         │
│  │         Air.inc Workspace (5,000+ assets)        │         │
│  │  Custom fields, boards, versions, CDN media      │         │
│  └─────────────────────┬───────────────────────────┘         │
│                        │                                      │
│              ┌─────────┴──────────┐                          │
│              ▼                    ▼                           │
│  ┌──────────────────┐  ┌──────────────────────┐             │
│  │ Export to JSON    │  │ Export media to       │             │
│  │ (data.js / API)   │  │ Google Drive          │             │
│  └────────┬─────────┘  └──────────┬───────────┘             │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌─────────────────────────────────────────┐                 │
│  │       DAM Browser (AirUIStudy)           │                │
│  │  ┌───────────┐ ┌───────────┐ ┌────────┐ │                │
│  │  │  Gallery   │ │   Table   │ │ Board  │ │                │
│  │  │  View      │ │   View    │ │ View   │ │                │
│  │  └───────────┘ └───────────┘ └────────┘ │                │
│  │  ┌───────────────────────────────────┐   │                │
│  │  │     Detail Modal                   │   │                │
│  │  │  Info │ Provenance │ Comments      │   │                │
│  │  │  Chat Timeline │ Chapters │ Trans  │   │                │
│  │  └───────────────────────────────────┘   │                │
│  │                                           │                │
│  │  Deploys to: dam.holodeckos.com           │                │
│  └───────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### What Claude Code Needs to Know

1. **The DAM browser is vanilla JS** — no React, no build step, no npm. Just serve the files.
2. **Mock data in `data.js`** must be replaced with real Air.inc export data.
3. **The asset schema** (documented above) is the contract between the export pipeline and the UI.
4. **Provenance data** comes from Lovart chat history — the import scripts already extract and store this in Air custom fields.
5. **The UI features** (Provenance tab, Chat Timeline, category badges) are already built and waiting for real data.
6. **Media files** can be served from Air.inc CDN, Google Drive, or any URL — the UI just needs `thumbnailUrl` and the media URL.
7. **The parent contentengine API** (`contentengine.holodeckos.com/api/air`) can proxy Air.inc requests if needed at runtime.

