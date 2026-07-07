# 🐙 GitHub Setup

The AntiGravity repo is the single source of truth for all projects.

## Repository

- **URL**: https://github.com/jmassion/AntiGravity
- **Branch**: `main` (production)
- **Remote**: `origin`

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Vercel |
| `dev/*` | Feature development branches |
| `staging` | Pre-production testing (future) |

## Auto-Deployment

Every push to `main` triggers a Vercel deployment. This means:

1. Make your changes locally
2. Commit with a descriptive message
3. Push to `main`
4. Vercel deploys automatically (~30 seconds)
5. Preview at your configured domains

## Commit Convention

```
type: brief description

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation changes
- style:    CSS/visual changes
- refactor: Code restructuring
- chore:    Build/config changes
- wiki:     Wiki content updates
```

## Git Commands Cheatsheet

```powershell
# Check status
git status

# Stage all changes
git add -A

# Commit
git commit -m "wiki: add getting started docs"

# Push to production
git push origin main

# Pull latest
git pull origin main
```

## GitHub Actions

The repo has a GitHub Actions workflow for GitHub Pages deployment (`.github/workflows/deploy-pages.yml`). The primary deployment is via Vercel's Git integration.

---

See also: [[00-getting-started/03-vercel-setup]], [[05-rules/code-rules]]
