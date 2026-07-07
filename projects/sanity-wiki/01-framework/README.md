# 🏗️ Framework

The core architecture that ties the AntiGravity ecosystem together.

## Overview

The framework defines **how objects relate to each other**, **how they are stored**, and **how they will eventually be represented** in systems like Sanity Studio and PlayCanvas 3D.

## Core Concept: The Playset

Think of the entire system as a **playset** — a simplified, visual model of the real and virtual world:

- **Worlds** contain **Environments**
- **Environments** contain **Characters**, **Objects**, and **Workstations**
- **Characters** belong to **Teams** and work on **Projects**
- **Projects** have **Tasks**, **Timelines**, and **Deliverables**
- Everything connects through **Tags** and **Relationships**

## Pages

| Page | Description |
|------|-------------|
| [[01-framework/core-objects]] | Complete object taxonomy |
| [[01-framework/schema-design]] | How objects relate (Sanity-ready schemas) |
| [[01-framework/backlink-system]] | How bidirectional linking works |

## Design Principles

1. **Markdown-first** — Everything starts as a markdown file
2. **Schema-ready** — Structure anticipates Sanity Studio migration
3. **Backlink-native** — Every reference is tracked bidirectionally
4. **Visual** — Every concept has a visual representation path
5. **Agent-readable** — AI agents can parse and act on all content

---

See also: [[00-getting-started]], [[09-core-objects]], [[11-planning/sanity-studio]]
