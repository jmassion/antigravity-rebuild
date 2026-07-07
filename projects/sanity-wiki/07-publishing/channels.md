# 📡 Publishing Channels

All active and planned publishing channels for the AntiGravity ecosystem.

## Active Channels

| Channel | URL | Purpose | Status |
|---------|-----|---------|--------|
| **Sanity Wiki** | sanity-one-flame.vercel.app | Project documentation & knowledge base | ✅ Live |
| **GitHub** | github.com/jmassion/sanity | Source code & version control | ✅ Active |
| **Vercel** | vercel.com/jmassions-projects | Web hosting & auto-deployment | ✅ Active |

## Deployment Pipeline

```
Local Edit → git add → git commit → git push origin main → Vercel Auto-Deploy (~30s)
```

### Key Details
- **Branch**: Always push to `main` (no PRs, no branches)
- **Build**: Static site, no build step required
- **CDN**: Vercel Edge Network (global)
- **SSL**: Auto-provisioned by Vercel

## Planned Channels

| Channel | Purpose | Status |
|---------|---------|--------|
| `sanity.holodeckos.com` | Custom domain for wiki | 🔧 Needs DNS setup |
| Sanity Studio | Structured CMS for content | 📋 Planning phase |
| PlayCanvas 3D UI | Interactive 3D wiki browser | 📋 Vision stage |

## Domain Architecture

| Domain | Points To | Purpose |
|--------|-----------|---------|
| holodeckos.com | Main site | Platform umbrella |
| sanity.holodeckos.com | Sanity Wiki (Vercel) | Knowledge base |
| lovart.holodeckos.com | Lovart design agent | Design generation |

---

See also: [[00-getting-started/03-vercel-setup]], [[00-getting-started/02-github-setup]]
