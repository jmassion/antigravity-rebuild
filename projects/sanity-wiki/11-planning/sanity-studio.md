# Sanity Studio Architecture

## Overview

Sanity Studio is an **open-source React-based Single Page Application** that runs entirely in the browser and connects with Sanity's hosted APIs and Content Lake. It serves as the primary editorial interface for managing large-scale structured content within the AntiGravity ecosystem.

## Self-Hosted vs Cloud-Hosted

| Aspect | Sanity-Hosted (`*.sanity.studio`) | Self-Hosted (Vercel) |
|--------|-----------------------------------|----------------------|
| **Backend** | Same Content Lake API | Same Content Lake API |
| **UI Customization** | Default UI only | Full React customization |
| **Structure Builder** | Default pane layout | Custom nav, filters, groups |
| **Custom Themes** | No | Liquid Glass theming possible |
| **Plugins** | Yes | Yes + custom plugins |
| **Domain** | `yourstudio.sanity.studio` | `studio.holodeckos.com` |
| **Embedding** | No | Yes — can embed in wiki |

**Decision: Self-hosted** — deployed on Vercel alongside the wiki for full customization.

> **Important:** Both options use the exact same Sanity backend (Content Lake). Self-hosting only changes where the React frontend runs.

## Installation

The Studio is scaffolded via the Sanity CLI, **not** by cloning the `sanity-io/sanity` monorepo:

```bash
npm create sanity@latest -- --project <projectId> --dataset production --output-path studio
```

This creates a `studio/` subfolder with:
- `sanity.config.ts` — Studio configuration + plugins
- `sanity.cli.ts` — CLI configuration (projectId, dataset)
- `schemas/` — Document type definitions
- `package.json` — Dependencies

## Project Structure

```
Sanity/
├── studio/                    ← Sanity Studio app
│   ├── sanity.config.ts       ← Studio config + plugins
│   ├── sanity.cli.ts          ← CLI config (projectId, dataset)
│   ├── package.json
│   ├── schemas/               ← Document type definitions
│   │   ├── index.ts
│   │   ├── wikiPage.ts
│   │   ├── project.ts
│   │   ├── agent.ts
│   │   ├── skill.ts
│   │   ├── contact.ts
│   │   ├── organization.ts
│   │   └── category.ts
│   ├── structure/             ← Custom Structure Builder
│   │   └── index.ts
│   └── components/            ← Custom React components
│       └── Logo.tsx
├── index.html                 ← Existing wiki SPA
└── ...existing files
```

## Key Customization Features

### Structure Builder

The Structure Builder API controls the Studio's sidebar navigation. It allows organizing documents into nested panes with custom filters, dividers, and ordering.

Key capabilities:
- **Nested pane navigation** — category → subcategory → document
- **GROQ-filtered lists** — dynamic grouping by any field
- **Custom document views** — side-by-side edit panels
- **Manual grouping** — arbitrary pane hierarchies

### Schema Design for Large-Scale Content

| Feature | Purpose |
|---------|---------|
| **Field Groups** | Organize 20+ fields into tabs |
| **References** | Bidirectional relationship graphs |
| **List Previews** | Custom preview with status, tags, dates |
| **Conditional Fields** | Show/hide fields based on type/role |
| **Sort Orders** | Custom ordering per document list |
| **Validation** | Custom validation rules per field |

### Theming & Branding

The Studio supports custom theming via the `theme` property in `sanity.config.ts`:
- Custom color scheme (Liquid Glass palette)
- Custom logo component
- Custom fonts
- Dark/light mode

### Plugins

Key plugins for our use case:
- **AI Assist** — In-editor AI content generation & translation
- **Dashboard Widgets** — Custom overview panels
- **Media Library** — Asset management
- **Scheduled Publishing** — Timed content releases

## Deployment

### Development
```bash
cd studio
npm run dev
# Opens http://localhost:3333
```

### Build for Production
```bash
cd studio
npx sanity build
# Outputs to studio/dist/
```

### Deploy to Vercel
The `studio/` folder is deployed as a separate Vercel project with SPA routing configured.

### Schema Deployment
After self-hosting, deploy the schema separately:
```bash
npx sanity schema deploy
npx sanity deploy --external
```

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| Documents | 10,000 |
| Datasets | 2 (public only) |
| Users | 20 |
| API CDN Requests | 1M/month |
| API Requests | 250K/month |
| Asset Storage | 100GB |
| Bandwidth | 100GB/month |

> Studio requests (editing in the UI) do NOT count toward API quotas.

## Related

- [[sanity-mcp]] — MCP server integration for AI agents
- [[sanity-skills]] — Installed agent skills
- [[playcanvas-3d-ui]] — PlayCanvas Editor integration
