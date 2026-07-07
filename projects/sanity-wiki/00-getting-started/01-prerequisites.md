# 📋 Prerequisites

Before setting up the project, ensure you have the following tools and accounts ready.

## Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v20+ | JavaScript runtime |
| **npm** | v10+ | Package manager |
| **Git** | Latest | Version control |
| **Vercel CLI** | Latest | Deployment & preview |
| **GitHub CLI** | Latest | Repo management from terminal |

## Accounts Needed

| Service | URL | Purpose |
|---------|-----|---------|
| **GitHub** | github.com | Source code hosting |
| **Vercel** | vercel.com | Deployment & hosting |
| **SiteGround** | siteground.com | DNS management, domain hosting |
| **Sanity** | sanity.io | Future CMS backend |

## Optional (Future)

| Service | Purpose |
|---------|---------|
| **NanoBanana** | 3D visualization & UI generation |
| **Meshy API** | 3D object/character generation |
| **PlayCanvas** | 3D UI framework |

## Installation Commands

```powershell
# Install Vercel CLI
npm install -g vercel

# Install GitHub CLI (Windows)
winget install GitHub.cli

# Authenticate
vercel login
gh auth login
```

## Verify Installation

```powershell
node --version    # Should be v20+
npm --version     # Should be v10+
git --version     # Any recent version
vercel --version  # Any recent version
gh --version      # Any recent version
```

---

See also: [[00-getting-started/02-github-setup]], [[00-getting-started/03-vercel-setup]]
