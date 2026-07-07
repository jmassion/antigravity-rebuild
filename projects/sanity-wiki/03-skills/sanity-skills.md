# Sanity Agent Skills

## Overview

Agent skills are instruction bundles that help AI agents generate higher-quality Sanity code. They follow the open [Agent Skills](https://agentskills.io/) format and are supported by tools like Cursor, Claude Code, VS Code, GitHub Copilot, and Antigravity Agent.

Skills give agents the same context an expert developer would have — best practices, architectural patterns, and domain-specific knowledge — loaded on demand.

## Installed Skills

### From `sanity-io/agent-toolkit` (4 Skills)

| Skill | Description | Use When |
|-------|-------------|----------|
| **sanity-best-practices** | Schema design, GROQ queries, TypeGen, Visual Editing, images, Portable Text, Studio structure, localization, migrations, Functions, Blueprints, and framework integrations | Working with Sanity schemas, GROQ, content modeling, Studio customization |
| **content-modeling-best-practices** | Structured content modeling, schema design, content architecture, reuse, references vs. embedded objects, taxonomies | Designing or refactoring content types, planning omnichannel content models |
| **content-experimentation-best-practices** | A/B testing, experiment design, hypotheses, metrics, sample size, statistical foundations, CMS-managed variants | Planning experiments, setting up variants, choosing metrics |
| **seo-aeo-best-practices** | Metadata, Open Graph, sitemaps, robots.txt, hreflang, JSON-LD structured data, EEAT, content optimization | Implementing SEO, schema markup, AI-overview readiness |

### From `sanity-io/agent-context` (3 Skills)

| Skill | Description | Use When |
|-------|-------------|----------|
| **create-agent-with-sanity-context** | Build AI agents with structured access to Sanity content via Agent Context | Setting up chatbots, AI assistants, semantic search over content |
| **dial-your-context** | Interactive session to create Instructions field content for Agent Context MCP | Tuning agent responses, configuring content filters |
| **shape-your-agent** | Interactive session to craft system prompts for AI agents | Defining agent personality, tone, guardrails, refusal behaviors |

## Installation

Skills were installed from the official Sanity repositories:

```bash
# Agent Toolkit (core Sanity skills)
npx skills add sanity-io/agent-toolkit

# Agent Context (AI agent integration)
npx skills add sanity-io/agent-context
```

## Location

Skills are stored at:
```
Sanity/.agent/skills/
├── sanity-best-practices/
│   └── SKILL.md
├── content-modeling-best-practices/
│   └── SKILL.md
├── content-experimentation-best-practices/
│   └── SKILL.md
├── seo-aeo-best-practices/
│   └── SKILL.md
├── create-agent-with-sanity-context/
│   └── SKILL.md
├── dial-your-context/
│   └── SKILL.md
└── shape-your-agent/
    └── SKILL.md
```

## How Skills Work

1. Agent encounters a Sanity-related task
2. Skill `SKILL.md` file is loaded on demand
3. Agent applies the patterns and best practices from the skill
4. Generated code follows Sanity conventions from the first pass

### Benefits
- **Better code on first pass** — agents follow conventions instead of guessing
- **Fewer iterations** — right patterns loaded before generation
- **Consistent quality** — same best practices for everyone

## Relationship to MCP

Skills and the Sanity MCP server complement each other:
- **MCP** → gives agents **access** to your content (read/write operations)
- **Skills** → give agents **knowledge** (best practices, patterns, guides)

Most setups benefit from both.

## Related

- [[sanity-studio]] — Studio architecture
- [[sanity-mcp]] — MCP server for content operations
