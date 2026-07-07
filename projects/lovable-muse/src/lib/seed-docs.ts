import { supabase } from '@/integrations/supabase/client';

interface SeedDoc {
  title: string;
  icon: string;
  category: string;
  slug: string;
  sort_order: number;
  content: string;
  parentSlug?: string;
  tags?: string[];
}

const SEED_DOCS: SeedDoc[] = [
  // ── Top-level: Product Spec ──
  {
    title: 'Product Spec',
    icon: '📋',
    category: 'architecture',
    slug: 'product-spec',
    sort_order: 0,
    tags: ['architecture'],
    content: `# Product Spec

This is a creative production pipeline tool for managing media projects, assets, storyboards, and team collaboration.

## Core Capabilities
- **Project hierarchy** with nested workspaces and sub-projects
- **Asset library** with versioning, AI-powered tagging, and multi-project linking
- **Storyboard system** with frame timelines, cinematic player, multi-format export
- **Connection graph** for visualizing relationships between assets, projects, and people
- **Infinite Canvas** for spatial overview of all app pages as draggable cards
- **AI Chat assistant** with prompt queue and app control via tool calling
- **Team management** with roles, claiming, accountability charts, and audit log
- **Plans & campaigns** for production briefs, goals, and deliverables
- **Provenance tracking** for directed lineage graphs between any entities
- **Style guides** for design tokens — colors, typography, spacing
- **Links & tools** bookmarking with auto-metadata and icon recognition
- **Global search** (Cmd+K) across all entity types
- **Documentation wiki** (you're reading it) for planning and changelogs
- **Thumbnail system** with fit modes and focus-point control

## Tech Stack
- React + Vite + TypeScript + Tailwind CSS
- Lovable Cloud (Supabase) for auth, database, storage, and edge functions
- TanStack Query for data fetching
- Framer Motion for animations
- shadcn/ui component library
- react-force-graph for relationship visualization
- fflate for ZIP compression
- react-markdown for rich text rendering`,
  },
  {
    title: 'Architecture Overview',
    icon: '📐',
    category: 'architecture',
    slug: 'architecture-overview',
    sort_order: 0,
    parentSlug: 'product-spec',
    tags: ['architecture'],
    content: `# Architecture Overview

## Database
All tables use UUID primary keys with \`gen_random_uuid()\`, RLS enabled, and \`owner_id\` scoping.

### Tables
| Table | Purpose |
|-------|---------|
| \`projects\` | Top-level workspaces with nesting via \`parent_id\` |
| \`assets\` | Uploaded files with AI tags and metadata |
| \`asset_versions\` | Version history per asset |
| \`asset_projects\` | Many-to-many link between assets and projects |
| \`storyboards\` | Named storyboard containers per project |
| \`storyboard_frames\` | Ordered frames with assets, audio, annotations |
| \`storyboard_projects\` | Many-to-many storyboard-to-project links |
| \`frame_versions\` | Version history per storyboard frame |
| \`tasks\` | Assignable tasks linked to projects/assets/frames |
| \`docs\` | This wiki system — nested docs with icons and tags |
| \`profiles\` | User display names and avatars |
| \`project_members\` | Team membership per project (auth users) |
| \`team_members\` | Named team members with roles and claiming |
| \`project_team_members\` | Team member assignments per project |
| \`plans\` | Production plans with briefs, goals, deliverables |
| \`links\` | URL bookmarks and tool references |
| \`style_guide_entries\` | Color, typography, and design tokens |
| \`canvas_layouts\` | Persisted infinite canvas positions and viewport |
| \`chat_messages\` | AI chat conversation history with tool calls |
| \`provenance_edges\` | Lineage relationships between any entities |
| \`graph_presets\` | Saved connection graph configurations |
| \`role_audit_log\` | Admin role change audit trail |
| \`user_roles\` | App-level role assignments (super_admin, admin, etc.) |
| \`upload_logs\` | Background upload tracking and progress |

## Storage
- **\`assets\` bucket** (public): All uploaded media files

## Edge Functions
| Function | Purpose |
|----------|---------|
| \`analyze-asset\` | AI-powered description and tag generation |
| \`extract-zip\` | Server-side ZIP extraction into individual assets |
| \`import-cloud-file\` | Import files from external cloud URLs |
| \`chat\` | AI-powered assistant with streaming and tool calling |
| \`export-project\` | Project data export as structured JSON |
| \`fetch-url-meta\` | URL metadata extraction for link previews |
| \`search-expand\` | Expanded search across entities |

## Auth
- Email/password signup with email verification
- Profile auto-created via \`handle_new_user\` trigger
- All data scoped to \`auth.uid()\` via RLS policies
- App-level roles via \`user_roles\` table (super_admin, admin, manager, member, viewer)`,
  },
  {
    title: 'Database Schema',
    icon: '🗄️',
    category: 'architecture',
    slug: 'database-schema',
    sort_order: 1,
    parentSlug: 'product-spec',
    tags: ['architecture'],
    content: `# Database Schema

## projects
\`\`\`
id                uuid PK
name              text NOT NULL
description       text
owner_id          uuid NOT NULL
parent_id         uuid FK → projects(id)  -- nesting
phase             text DEFAULT 'start'
content_type      text DEFAULT 'general'
tags              text[]
thumbnail_url     text
thumbnail_fit     text DEFAULT 'cover'
thumbnail_focus_x real DEFAULT 50
thumbnail_focus_y real DEFAULT 50
created_at        timestamptz
updated_at        timestamptz
\`\`\`

## assets
\`\`\`
id              uuid PK
name            text NOT NULL
file_url        text NOT NULL
file_type       text DEFAULT 'image'
file_size       bigint
owner_id        uuid NOT NULL
description     text
tags            text[]
ai_tags         text[]
ai_description  text
thumbnail_url   text
metadata        jsonb
created_at      timestamptz
updated_at      timestamptz
\`\`\`

## storyboard_frames
\`\`\`
id                uuid PK
storyboard_id     uuid FK
asset_id          uuid FK
title             text
notes             text
status            text DEFAULT 'draft'
sort_order        integer
duration_seconds  numeric DEFAULT 3.0
audio_url         text
annotations       jsonb
assignee_id       uuid FK → team_members(id)
ai_description    text
ai_tags           text[]
created_at        timestamptz
updated_at        timestamptz
\`\`\`

## canvas_layouts
\`\`\`
id          uuid PK
owner_id    uuid NOT NULL
name        text DEFAULT 'Default'
layout      jsonb DEFAULT '{}'
viewport    jsonb DEFAULT '{"x":0,"y":0,"zoom":1}'
created_at  timestamptz
updated_at  timestamptz
\`\`\`

## chat_messages
\`\`\`
id               uuid PK
owner_id         uuid NOT NULL
conversation_id  uuid NOT NULL
role             text DEFAULT 'user'    -- user, assistant, system
content          text
tool_calls       jsonb
tool_results     jsonb
created_at       timestamptz
\`\`\`

## frame_versions
\`\`\`
id               uuid PK
frame_id         uuid FK → storyboard_frames(id)
version_number   integer DEFAULT 1
title            text
notes            text
status           text DEFAULT 'draft'
asset_id         uuid FK
duration_seconds numeric DEFAULT 3.0
audio_url        text
annotations      jsonb
ai_description   text
ai_tags          text[]
snapshot_reason  text DEFAULT 'manual'
created_by       uuid NOT NULL
created_at       timestamptz
\`\`\`

## links
\`\`\`
id            uuid PK
owner_id      uuid NOT NULL
project_id    uuid FK → projects(id)
title         text NOT NULL
url           text NOT NULL
description   text
tool_name     text
tool_icon_url text
category      text DEFAULT 'general'
tags          text[]
sort_order    integer DEFAULT 0
created_at    timestamptz
updated_at    timestamptz
\`\`\`

## plans
\`\`\`
id            uuid PK
owner_id      uuid NOT NULL
project_id    uuid FK → projects(id)
title         text NOT NULL
brief         text
goals         text[]
deliverables  text[]
status        text DEFAULT 'draft'
content_type  text DEFAULT 'general'
tags          text[]
created_at    timestamptz
updated_at    timestamptz
\`\`\`

## provenance_edges
\`\`\`
id            uuid PK
owner_id      uuid NOT NULL
source_type   text NOT NULL
source_id     uuid NOT NULL
target_type   text NOT NULL
target_id     uuid NOT NULL
relationship  text DEFAULT 'derived_from'
notes         text
created_at    timestamptz
\`\`\`

## style_guide_entries
\`\`\`
id          uuid PK
owner_id    uuid NOT NULL
project_id  uuid FK → projects(id)
label       text
value       text
description text
category    text DEFAULT 'general'
metadata    jsonb
tags        text[]
sort_order  integer DEFAULT 0
created_at  timestamptz
updated_at  timestamptz
\`\`\`

## team_members
\`\`\`
id                 uuid PK
owner_id           uuid NOT NULL
display_name       text NOT NULL
role               text DEFAULT 'member'
title              text
bio                text
avatar_url         text
member_type        text DEFAULT 'placeholder'  -- person, ai_agent, department, vendor
user_id            uuid
claimed_by         uuid
claimed_at         timestamptz
is_active          boolean DEFAULT true
primary_project_id uuid FK → projects(id)
created_at         timestamptz
updated_at         timestamptz
\`\`\`

## upload_logs
\`\`\`
id            uuid PK
owner_id      uuid NOT NULL
project_id    uuid FK → projects(id)
asset_id      uuid FK → assets(id)
file_name     text NOT NULL
file_type     text DEFAULT 'document'
file_size     bigint DEFAULT 0
folder_path   text DEFAULT '/'
source        text DEFAULT 'local'
status        text DEFAULT 'uploading'
progress      smallint DEFAULT 0
error_message text
started_at    timestamptz
completed_at  timestamptz
created_at    timestamptz
\`\`\`

## docs
\`\`\`
id          uuid PK
owner_id    uuid NOT NULL
parent_id   uuid FK → docs(id)
icon        text DEFAULT ''
title       text NOT NULL
slug        text NOT NULL
category    text DEFAULT 'general'
tags        text[]
content     text
sort_order  integer DEFAULT 0
created_at  timestamptz
updated_at  timestamptz
\`\`\``,
  },

  // ── Top-level: Features ──
  {
    title: 'Features',
    icon: '🚀',
    category: 'features',
    slug: 'features',
    sort_order: 1,
    tags: ['features'],
    content: `# Features

An overview of all major features in the production pipeline.

Each child document covers a specific feature area in detail.`,
  },
  {
    title: 'Asset Management',
    icon: '📁',
    category: 'features',
    slug: 'asset-management',
    sort_order: 0,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Asset Management

## Upload
- Drag-and-drop or click-to-upload via FileDropZone
- Supports images, video, audio, PDFs, ZIPs, and 3D files
- ZIP files auto-extracted server-side via edge function
- Background upload queue with progress indicator

## Versioning
- Each asset tracks version history in \`asset_versions\`
- Side-by-side diff view between versions
- Notes per version for change documentation

## AI Analysis
- Automatic description and tag generation via \`analyze-asset\` edge function
- AI tags displayed alongside manual tags
- Searchable across all tag types

## Multi-Project Linking
- Assets can belong to multiple projects via \`asset_projects\`
- Folder paths within each project for organization

## Detail Panel
- Slide-out panel with full metadata, version history, and project links
- Inline editing of name, description, and tags`,
  },
  {
    title: 'Storyboards & Timeline',
    icon: '🎬',
    category: 'features',
    slug: 'storyboards-timeline',
    sort_order: 1,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Storyboards & Timeline

## Storyboard Management
- Create named storyboards within any project
- Each storyboard contains ordered frames
- Content type classification per storyboard

## Frame Timeline
- Drag-and-drop reordering of frames
- Each frame has: asset, title, notes, status, duration, audio, annotations
- Visual filmstrip with thumbnails
- AI-generated description and tags per frame
- Frame version history with snapshot reasons

## Video Preview
- Full sequence playback with frame-by-frame timing
- Audio overlay support per frame
- Export-ready preview modal

## Status Tracking
- Frame statuses: draft, in-progress, review, approved
- Assignee per frame for team workflow (linked to team_members)`,
  },
  {
    title: 'Connection Graph',
    icon: '🔗',
    category: 'features',
    slug: 'connection-graph',
    sort_order: 2,
    parentSlug: 'features',
    tags: ['features', 'architecture'],
    content: `# Connection Graph

## Overview
Force-directed graph visualization showing relationships between projects, assets, storyboards, and team members.

## Node Types
- **Projects** (blue) — with nested children shown as clusters
- **Assets** (green) — linked to projects they belong to
- **Storyboards** (purple) — linked to parent project
- **Members** (orange) — linked to projects they're part of

## Interactions
- Drag nodes to rearrange
- Click to select and highlight connections
- Hover for quick info tooltip
- Zoom and pan across the canvas
- Save/load graph presets via \`graph_presets\` table

## Data Sources
- Pulls from projects, assets, asset_projects, storyboards, project_members, and team_members tables
- Real-time updates via TanStack Query refetch`,
  },
  {
    title: 'Project Hierarchy',
    icon: '📂',
    category: 'features',
    slug: 'project-hierarchy',
    sort_order: 3,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Project Hierarchy

## Nesting
- Projects have optional \`parent_id\` for unlimited depth nesting
- Tree view in sidebar shows hierarchy
- Breadcrumb navigation for deep nesting

## Workspace Cards
- Grid layout with square thumbnail cards
- Thumbnail upload with fit mode and focus point control
- Quick actions: move to parent, delete, create child

## Content Types & Tags
- Projects have a \`content_type\` field for classification (general, film, game, etc.)
- Tags array for flexible categorization
- Phase-based workflow: Start → Build → Grow

## Seeding
- 16 workspace projects auto-seeded on first load from reference design
- MANRIQUE, PIXEL, VIRTUOS, GAME OF LIFE, MAGIC TIGER STUDIO, etc.`,
  },
  {
    title: 'Tag System',
    icon: '🏷️',
    category: 'features',
    slug: 'tag-system',
    sort_order: 4,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Tag System

## Dynamic Tags
- Projects use a \`phase\` field with values like start, build, grow
- Assets support both manual \`tags\` and AI-generated \`ai_tags\`
- Docs use \`category\` plus a \`tags\` array for multi-placement
- Plans, links, storyboards, and style guides all support tags
- Unified tag autocomplete pool across entity types

## Tag Colors
- Phase-based coloring with CSS custom properties
- Category badges with semantic color mapping
- Prefix-based coloring for visual scanning`,
  },
  {
    title: 'Thumbnail Focus Points',
    icon: '🖼️',
    category: 'features',
    slug: 'thumbnail-focus-points',
    sort_order: 5,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Thumbnail Focus Points

## Fit Modes
- **Cover**: Fill the space, crop overflow (default)
- **Contain**: Show entire image, letterbox if needed
- **Fill**: Stretch to fill (may distort)
- **Auto**: Browser default behavior

## Focus Point Picker
- Click anywhere on the thumbnail to set focal center
- Crosshair overlay shows current focus position
- Values stored as \`thumbnail_focus_x\` and \`thumbnail_focus_y\` (0-100%)
- Applied via CSS \`object-position\`

## Implementation
- \`ThumbnailSettings\` popover component on project cards
- Settings persist to database per project
- Works with all fit modes`,
  },
  {
    title: 'Documentation System',
    icon: '📖',
    category: 'features',
    slug: 'documentation-system',
    sort_order: 6,
    parentSlug: 'features',
    tags: ['features', 'architecture'],
    content: `# Documentation System

## Wiki Structure
- Nested docs with \`parent_id\` for unlimited depth
- Custom emoji icons per document
- Category tags for multi-placement filtering
- Full markdown rendering with syntax highlighting

## Sidebar Tree
- Recursive collapsible tree
- Search filtering across title, content, and category
- Category filter chips

## Editing
- Inline markdown editor with live preview
- Title and icon editing
- Parent document selection for moving in hierarchy

## Seeding
- Auto-populates with product spec, features, and changelog on first load
- Changelog entries document each build iteration`,
  },
  {
    title: 'Infinite Canvas',
    icon: '🗺️',
    category: 'features',
    slug: 'infinite-canvas',
    sort_order: 7,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Infinite Canvas

## Overview
A spatial overview of all app pages rendered as draggable cards on an infinite zoomable canvas. Think of it as a bird's-eye map of the entire Pipeline app.

## Features
- **Draggable cards** — each app page is a card you can position freely
- **Card stacking** — drag a card onto another to create a stack, or use the context menu
- **Magnetic snapping** — alignment guides appear when cards approach each other
- **Minimap** — orientation widget showing your viewport position on the full canvas
- **Fullscreen overlay** — double-click a card to enter that page in an overlay
- **Zoom-based auto-collapse** — cards collapse to compact chips below 0.3× zoom
- **Persistent layout** — positions and viewport saved per user to \`canvas_layouts\` table

## Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Arrow keys | Pan the canvas |
| \`+\` / \`-\` | Zoom in / out |
| Double-click | Open page overlay |
| Right-click | Context menu (stack, unstack, reset) |

## Technical Details
- Uses CSS transforms for pan/zoom (no canvas element)
- Layout stored as JSON in \`canvas_layouts.layout\` column
- Viewport state (x, y, zoom) persisted in \`canvas_layouts.viewport\``,
  },
  {
    title: 'AI Chat Assistant',
    icon: '🤖',
    category: 'features',
    slug: 'ai-chat-assistant',
    sort_order: 8,
    parentSlug: 'features',
    tags: ['features'],
    content: `# AI Chat Assistant

## Overview
A slide-out AI panel that acts as the command center for the entire Pipeline app. It can answer questions, execute actions, and help manage your creative workflow.

## Access
- **Floating button** — bottom-right corner of every page
- **Keyboard shortcut** — \`Cmd+J\` (Mac) or \`Ctrl+J\` (Windows)

## Prompt Queue
- Stack multiple messages while the AI is processing
- Queued prompts appear as editable chips below the input
- Click a chip to edit it, click × to remove
- When the current response finishes, the next queued prompt fires automatically
- Visual indicator showing queue depth

## Tool Calling
The AI can execute structured actions:
| Tool | What It Does |
|------|-------------|
| \`navigate\` | Go to any page in the app |
| \`create_project\` | Create a new project with name, phase, tags |
| \`create_task\` | Create a task with title, priority, status |
| \`create_plan\` | Create a plan with title, brief, goals |
| \`search\` | Search across all entity types |
| \`list_items\` | List and filter projects, tasks, assets, etc. |
| \`summarize_page\` | Describe what a specific page does |

## Technical Details
- Streaming responses via SSE from the \`chat\` edge function
- Uses Lovable AI gateway (Gemini Flash) with tool definitions
- Conversation persistence in \`chat_messages\` table
- Context-aware — knows which page you're currently on
- Markdown rendering for formatted responses`,
  },
  {
    title: 'Storyboard Export & Player',
    icon: '🎥',
    category: 'features',
    slug: 'storyboard-export-player',
    sort_order: 9,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Storyboard Export & Player

## Cinematic Player
- Fullscreen playback with transport controls (play, pause, prev, next)
- Playback speed control (0.5×, 1×, 1.5×, 2×)
- Crossfade transitions between frames
- Frame-by-frame keyboard navigation (← →)
- Loop mode for continuous playback
- Mute/unmute toggle for audio frames
- Annotation and subtitle overlay system

## Export Formats
| Format | Description |
|--------|-------------|
| **Image Sequence** | ZIP file of all frame images (via fflate) |
| **Video** | WebM recording via MediaRecorder API |
| **PDF Shot List** | Formatted document with frame details |
| **Audio Compilation** | Combined audio tracks from frames |
| **Full Package** | Everything bundled together |

## Technical Details
- Player state managed locally with React refs for smooth playback
- Auto-advance uses frame \`duration_seconds\` for timing
- Export dialog with format selection and progress indicator
- Video export captures the player canvas via MediaRecorder`,
  },
  {
    title: 'Team Management',
    icon: '👥',
    category: 'features',
    slug: 'team-management',
    sort_order: 10,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Team Management

## Team Members
- Display name, role, title, bio, and avatar
- Member types: **person**, **ai_agent**, **department**, **vendor**
- Active/inactive status tracking
- Primary project assignment

## Claim System
- Team members can be "claimed" by authenticated users
- Links a \`team_member\` record to an \`auth.user\` via \`claimed_by\`
- Timestamp recorded in \`claimed_at\`
- Allows team members to be pre-created before users sign up

## Accountability Chart
- Visual org-chart style visualization of team structure
- Shows reporting relationships and project assignments

## Admin Role Management
- App-level roles: super_admin, admin, manager, member, viewer
- Roles stored in \`user_roles\` table
- Role changes tracked in \`role_audit_log\` with previous/new role and notes
- Only admins and super_admins can manage roles

## Project Assignments
- Team members assigned to projects via \`project_team_members\`
- Per-project role override (e.g., member on one project, lead on another)`,
  },
  {
    title: 'Plans & Campaigns',
    icon: '📅',
    category: 'features',
    slug: 'plans-campaigns',
    sort_order: 11,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Plans & Campaigns

## Production Plans
- Title, brief description, goals (text array), and deliverables (text array)
- Status tracking: **draft** → **active** → **complete**
- Linked to a specific project or standalone
- Content type classification (general, film, game, etc.)
- Tags for flexible categorization

## Campaigns
- Marketing campaigns for the **Grow** phase of a project
- Campaign management interface for tracking distribution efforts

## Marketing Assets
- Dedicated marketing asset management page
- Separate from the main asset library for distribution-focused content`,
  },
  {
    title: 'Provenance & Lineage',
    icon: '🔍',
    category: 'features',
    slug: 'provenance-lineage',
    sort_order: 12,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Provenance & Lineage

## Overview
A directed graph tracking relationships between any entity types in the system — projects, assets, storyboards, plans, etc.

## Edges
- **source_type** + **source_id** → **target_type** + **target_id**
- Relationship labels (e.g., \`derived_from\`, \`inspired_by\`, \`references\`)
- Notes per edge for additional context

## Visual Explorer
- Lineage graph visualization on the Provenance page
- Follow chains of derivation to understand asset origins
- Filter by entity type or relationship

## Use Cases
- Track which assets were derived from which source files
- Document creative inspiration chains
- Map project dependencies`,
  },
  {
    title: 'Links & Tools',
    icon: '🔗',
    category: 'features',
    slug: 'links-tools',
    sort_order: 13,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Links & Tools

## URL Bookmarking
- Save URLs with title, description, and category
- Tags for flexible organization
- Project-scoped or global links

## Tool Recognition
- Known tool names matched to icons (e.g., Figma, Notion, Slack)
- Custom tool icon URLs for unrecognized tools
- Tool name auto-detected from URL patterns

## Auto-Metadata
- \`fetch-url-meta\` edge function extracts page title, description, and favicon
- Populated automatically when adding a new link
- Manual override available for all fields

## Organization
- Category-based grouping
- Sort order for manual arrangement
- Searchable across title, description, URL, and tags`,
  },
  {
    title: 'Style Guides',
    icon: '🎨',
    category: 'features',
    slug: 'style-guides',
    sort_order: 14,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Style Guides

## Design Token Entries
- **Label**: Human-readable name (e.g., "Primary Blue")
- **Value**: The token value (e.g., "#3B82F6", "Inter", "16px")
- **Category**: color, typography, spacing, mood, etc.
- **Description**: Usage notes
- **Metadata**: Rich JSON for complex values (font stacks, gradient definitions, etc.)

## Organization
- Category-based grouping with visual separation
- Project-scoped entries (linked to a specific project) or global
- Tags for cross-category discovery
- Sort order for manual arrangement within categories

## Use Cases
- Define color palettes per project
- Document typography choices with font stacks
- Track spacing and layout tokens
- Record mood/style references`,
  },
  {
    title: 'Global Search',
    icon: '🔎',
    category: 'features',
    slug: 'global-search',
    sort_order: 15,
    parentSlug: 'features',
    tags: ['features'],
    content: `# Global Search

## Access
- **Cmd+K** (Mac) or **Ctrl+K** (Windows) opens the search overlay
- Available from any page in the app

## Search Scope
Searches across all major entity types:
- Projects (name, description, tags)
- Assets (name, description, tags, AI tags)
- Storyboards (name, description, tags)
- Docs (title, content, tags)
- Tasks (title, description)
- Plans (title, brief, tags)
- Links (title, URL, description, tags)

## Features
- Fuzzy matching across titles, descriptions, and tags
- Quick navigation — select a result to jump directly to that entity
- Grouped results by entity type
- Real-time filtering as you type`,
  },

  // ── Top-level: Changelog ──
  {
    title: 'Changelog',
    icon: '📝',
    category: 'changelog',
    slug: 'changelog',
    sort_order: 2,
    tags: ['changelog'],
    content: `# Changelog

A chronological record of all major builds and iterations.

Each entry documents what was implemented, changed, or fixed.`,
  },
  {
    title: 'v1.3 — UX Polish',
    icon: '✨',
    category: 'changelog',
    slug: 'v1-3-ux-polish',
    sort_order: 0,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v1.3 — UX Polish

## What Changed
- Quick-add (+) buttons on sidebar items for faster entity creation
- Global search (Cmd+K) overlay searching across all entity types
- Content type classification added across projects, storyboards, and plans
- Unified tag autocomplete pool pulling from all entity tags
- Improved sidebar navigation with collapsible sections
- Bulk operations for tagging and linking entities`,
  },
  {
    title: 'v1.2 — AI Chat System',
    icon: '🤖',
    category: 'changelog',
    slug: 'v1-2-ai-chat',
    sort_order: 1,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v1.2 — AI Chat System

## What Changed
- Pipeline AI chat panel with streaming responses via Gemini Flash
- Slide-out drawer accessible from every page (Cmd+J)
- Prompt queue: stack messages while AI processes, edit/remove queued prompts
- Tool calling for app control — navigate pages, create projects/tasks/plans, search, list items
- Conversation persistence in \`chat_messages\` table
- Context-aware: AI knows which page you're currently viewing
- Markdown rendering for formatted AI responses`,
  },
  {
    title: 'v1.1 — Infinite Canvas',
    icon: '🗺️',
    category: 'changelog',
    slug: 'v1-1-infinite-canvas',
    sort_order: 2,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v1.1 — Infinite Canvas

## What Changed
- Spatial canvas with all app pages as draggable cards
- Card stacking via drag-overlap or context menu
- Magnetic snapping with alignment guides
- Minimap widget for orientation
- Fullscreen overlay mode — double-click a card to enter the page
- Zoom-based auto-collapse below 0.3× zoom
- Layout and viewport saved per user to \`canvas_layouts\` table
- Keyboard shortcuts: arrow keys for pan, +/- for zoom`,
  },
  {
    title: 'v1.0 — Provenance & Links',
    icon: '🔍',
    category: 'changelog',
    slug: 'v1-0-provenance-links',
    sort_order: 3,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v1.0 — Provenance & Links

## What Changed
- Provenance edge tracking for entity lineage (source → target with relationship labels)
- Visual lineage explorer on the Provenance page
- Links & tools bookmarking with categories, tags, and tool icon recognition
- Auto-metadata extraction via \`fetch-url-meta\` edge function
- Style guide entries system for design tokens (colors, typography, spacing)
- Category-based organization with metadata JSON for rich values`,
  },
  {
    title: 'v0.9 — Team & Plans',
    icon: '👥',
    category: 'changelog',
    slug: 'v0-9-team-plans',
    sort_order: 4,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.9 — Team & Plans

## What Changed
- Team members system with display name, role, title, bio, avatar
- Member types: person, ai_agent, department, vendor
- Claim system linking team members to authenticated users
- Accountability chart visualization
- Admin role management (super_admin, admin, manager, member, viewer)
- Role change audit log in \`role_audit_log\` table
- Production plans with title, brief, goals, and deliverables
- Plan status tracking: draft → active → complete
- Project-team member assignments via \`project_team_members\``,
  },
  {
    title: 'v0.8 — Storyboard Export & Player',
    icon: '🎥',
    category: 'changelog',
    slug: 'v0-8-storyboard-export',
    sort_order: 5,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.8 — Storyboard Export & Player

## What Changed
- Cinematic fullscreen player with transport controls (play, pause, prev, next)
- Playback speed control (0.5×, 1×, 1.5×, 2×)
- Crossfade transitions between frames
- Export dialog with multiple formats: ZIP images, WebM video, PDF shot list, audio, full package
- Annotation and subtitle overlay system
- Frame-by-frame keyboard navigation
- Loop and mute controls
- Frame version history with snapshot tracking`,
  },
  {
    title: 'v0.7 — Wiki Docs System',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-7-wiki-docs',
    sort_order: 6,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.7 — Wiki Docs System

## What Changed
- Transformed flat category-based docs into recursive wiki tree
- Added \`parent_id\` and \`icon\` columns to docs table
- Built recursive sidebar with collapsible sections
- Added emoji icon picker for documents
- Added parent selector for nesting documents
- Implemented category filter chips
- Seeded all planning content: product spec, architecture, features, and changelog
- Documents can appear in multiple sections via tags array`,
  },
  {
    title: 'v0.6 — Documentation Portal',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-6-docs-portal',
    sort_order: 7,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.6 — Documentation Portal

## What Changed
- Created \`docs\` table with category, tags, slug, sort_order
- Built docs page with sidebar navigation and markdown rendering
- Category-based grouping with collapsible sections
- Full CRUD: create, edit, delete documents
- Search across title, content, and category
- Markdown renderer with code syntax highlighting`,
  },
  {
    title: 'v0.5 — Thumbnails & Workspaces',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-5-thumbnails',
    sort_order: 8,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.5 — Thumbnails & Workspaces

## What Changed
- Added \`thumbnail_fit\`, \`thumbnail_focus_x\`, \`thumbnail_focus_y\` to projects
- Built ThumbnailSettings popover with fit mode selector and focus point picker
- Converted projects page to grid layout with square thumbnail cards
- Seeded 16 workspace projects from reference design
- Thumbnail upload directly on project cards
- Dynamic object-fit and object-position from database values`,
  },
  {
    title: 'v0.4 — Connection Graph & Tags',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-4-graph',
    sort_order: 9,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.4 — Connection Graph & Tags

## What Changed
- Built force-directed connection graph visualization
- Node types: projects, assets, storyboards, members
- Interactive canvas with drag, click, hover, zoom
- Inline project creation from sidebar
- Upload-time tag assignment for assets
- Dynamic tag coloring system`,
  },
  {
    title: 'v0.3 — Storyboards & Timeline',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-3-storyboards',
    sort_order: 10,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.3 — Storyboards & Timeline

## What Changed
- Created storyboards and storyboard_frames tables
- Built frame timeline with drag-and-drop reordering
- Added video preview modal with frame-by-frame playback
- Audio URL support per frame
- Frame status tracking (draft, in-progress, review, approved)
- Storyboard strip component with filmstrip thumbnails`,
  },
  {
    title: 'v0.2 — Asset Library',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-2-assets',
    sort_order: 11,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.2 — Asset Library

## What Changed
- Created assets, asset_versions, and asset_projects tables
- Built asset grid with filtering and search
- Drag-and-drop file upload with background queue
- Version history with side-by-side diff view
- AI analysis via analyze-asset edge function
- ZIP extraction via extract-zip edge function
- Asset detail panel with metadata editing
- Multi-project asset linking`,
  },
  {
    title: 'v0.1 — Initial Setup',
    icon: '📝',
    category: 'changelog',
    slug: 'v0-1-initial',
    sort_order: 12,
    parentSlug: 'changelog',
    tags: ['changelog'],
    content: `# v0.1 — Initial Setup

## What Changed
- Project scaffolding with React + Vite + TypeScript + Tailwind
- Lovable Cloud integration for auth, database, and storage
- Email/password authentication with email verification
- User profiles with auto-creation trigger
- Projects table with CRUD and RLS policies
- App layout with sidebar navigation
- Dark theme with custom design tokens
- Routing: Dashboard, Projects, Assets, Storyboards, Connections, Docs`,
  },
];

export async function seedDocs(userId: string): Promise<boolean> {
  // Insert top-level docs first
  const topLevel = SEED_DOCS.filter(d => !d.parentSlug);
  const { data: topData, error: topErr } = await supabase
    .from('docs')
    .insert(topLevel.map(d => ({
      owner_id: userId,
      title: d.title,
      icon: d.icon,
      category: d.category,
      slug: d.slug,
      sort_order: d.sort_order,
      content: d.content,
      tags: d.tags || [],
    })))
    .select('id, slug');

  if (topErr || !topData) {
    console.error('Seed top-level failed:', topErr);
    return false;
  }

  const slugToId: Record<string, string> = {};
  topData.forEach(d => { slugToId[d.slug] = d.id; });

  // Insert children with parent_id
  const children = SEED_DOCS.filter(d => d.parentSlug);
  if (children.length > 0) {
    const { error: childErr } = await supabase
      .from('docs')
      .insert(children.map(d => ({
        owner_id: userId,
        title: d.title,
        icon: d.icon,
        category: d.category,
        slug: d.slug,
        sort_order: d.sort_order,
        content: d.content,
        tags: d.tags || [],
        parent_id: slugToId[d.parentSlug!] || null,
      })));

    if (childErr) {
      console.error('Seed children failed:', childErr);
      return false;
    }
  }

  return true;
}
