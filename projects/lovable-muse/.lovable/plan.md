
# Build Out Underdeveloped Pages

## Problem
Four pages currently use the generic `PhaseSubPage` wrapper, which only shows a filtered asset/project grid with no domain-specific functionality. Each needs a purpose-built UI matching the quality of the rest of the app.

---

## 1. Prompts Page (`/start/prompts`)

**Current state:** Generic PhaseSubPage showing assets tagged "prompt".

**New purpose:** A dedicated prompt library for managing AI/creative prompt templates with versioning, categories, and quick-copy.

**Features:**
- CRUD prompt entries stored in the `docs` table (category = "prompt") -- reuses existing table, no migration needed
- Prompt cards showing title, truncated content preview, tags, and a "Copy" button
- Category chips: Text-to-Image, Text-to-Video, Text-to-3D, Story, Dialogue, General
- Inline markdown editor for prompt content (reuses existing `MarkdownRenderer`)
- Variable highlighting: detects `{variable}` patterns in prompt text and renders them as highlighted chips
- Search and filter by category/tags
- Grid and list view toggle via existing `ViewToolbar`
- Project linking via `ProjectSelect`

**Data model:** Uses `docs` table with `category = 'prompt'`. Content field stores the prompt text. Tags for sub-categorization.

---

## 2. Worlds Page (`/start/worlds`)

**Current state:** Generic PhaseSubPage showing assets tagged "world".

**New purpose:** A world-building bible with structured entries for locations, props, environments, and lore.

**Features:**
- Accordion-based sections: Locations, Props, Environments, Lore, Rules
- Each entry has: name, description, reference image (from asset picker), tags
- Stored in `style_guide_entries` table with category prefixed as `world:locations`, `world:props`, etc. -- reuses existing table, no migration needed
- Image preview thumbnails when a reference asset URL is provided
- Drag-and-drop reordering within sections (reuses `@hello-pangea/dnd` already installed)
- Project filter via `ProjectSelect`
- Inline create/edit forms per section (same pattern as StyleGuides page)
- Empty state with world-building tips

**Data model:** Uses `style_guide_entries` table. `category` = `world:locations`, `world:props`, `world:environments`, `world:lore`, `world:rules`. `value` field stores image URL when applicable.

---

## 3. Campaigns Page (`/grow/campaigns`)

**Current state:** Generic PhaseSubPage showing assets tagged "campaign".

**New purpose:** A campaign tracker with status boards, timeline, and linked deliverables.

**Features:**
- Campaign cards with: title, status (Draft/Active/Complete), date range, linked project, deliverables checklist
- Stored in `plans` table with `content_type = 'campaign'` -- reuses existing table, no migration needed
- Kanban view by status (reuses existing `KanbanView` component)
- List view with columns: Title, Status, Project, Deliverables count, Updated (reuses `ListView`)
- Grid view with campaign cards showing progress ring for deliverables completion
- Create form: title, brief, goals as campaign objectives, deliverables as checklist items, project link, tags
- Status toggle inline on cards
- Reuses the `ProgressRing` SVG component pattern from the Index page

**Data model:** Uses `plans` table filtered by `content_type = 'campaign'`. `goals` array = campaign objectives. `deliverables` array = checklist items. `status` = draft/active/complete.

---

## 4. Marketing Assets Page (`/grow/marketing`)

**Current state:** Generic PhaseSubPage showing image/video assets tagged "marketing".

**New purpose:** A visual asset board for marketing materials with mood board layout, format labels, and platform targeting.

**Features:**
- Masonry-style grid layout for visual assets (images/videos)
- Platform filter chips: Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Web, Print
- Format badges on cards: Story, Reel, Post, Banner, Thumbnail, Poster
- Upload zone with auto-tagging of "marketing" tag
- Asset cards showing: thumbnail, name, platform tags, format, dimensions from metadata
- Detail panel on click (reuses existing `AssetDetailPanel`)
- Bulk attach to projects (reuses `BulkAttachDialog`)
- Video preview support (reuses `VideoThumbnail` and `VideoPreviewModal`)
- Filter by project, platform tag, and format tag

**Data model:** Uses existing `assets` table filtered by tags containing marketing-related terms. Platform and format stored as tags (e.g., `platform:instagram`, `format:story`). No migration needed.

---

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `src/pages/Prompts.tsx` | Full rewrite -- prompt library UI |
| `src/pages/Worlds.tsx` | Full rewrite -- world-building bible |
| `src/pages/Campaigns.tsx` | Full rewrite -- campaign tracker |
| `src/pages/MarketingAssets.tsx` | Full rewrite -- marketing asset board |

### Files NOT Modified
All shared components, hooks, and database schema remain unchanged. Each page reuses existing tables (`docs`, `style_guide_entries`, `plans`, `assets`) with filtering by category/content_type/tags.

### No Database Migrations
All four pages leverage existing tables with smart filtering:
- Prompts: `docs` where `category = 'prompt'`
- Worlds: `style_guide_entries` where `category LIKE 'world:%'`
- Campaigns: `plans` where `content_type = 'campaign'`
- Marketing: `assets` filtered by marketing-related tags

### Shared Patterns Used
- `AppLayout` for page shell
- `ViewToolbar` for grid/list/kanban toggles
- `ListView` and `KanbanView` for alternate views
- `ProjectSelect` for project linking
- `TagInput` for tag management
- `useQuery` / `useMutation` from TanStack Query
- `framer-motion` for animations
- `@hello-pangea/dnd` for drag-and-drop (Worlds page)
- `MarkdownRenderer` for prompt preview (Prompts page)
