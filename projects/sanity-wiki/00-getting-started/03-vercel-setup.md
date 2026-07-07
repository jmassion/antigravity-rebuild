# ▲ Vercel Setup

Vercel handles deployment, preview URLs, and custom domain routing for all AntiGravity projects.

## Project Configuration

The repo uses a single Vercel project with subdomain routing:

```json
// vercel.json (root)
{
  "version": 2,
  "framework": null,
  "buildCommand": "",
  "outputDirectory": ".",
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "sanity.holodeckos.com" }],
      "destination": "/Sanity/$1"
    }
  ]
}
```

## Domain Routing

| Subdomain | Serves From | Purpose |
|-----------|-------------|---------|
| `ag.holodeckos.com` | `/` (root) | Main dashboard |
| `sanity.holodeckos.com` | `/Sanity/` | This wiki/CMS |
| `higgsfield.holodeckos.com` | `/Scraper/Higgsfield/` | Higgsfield viewer |

## SiteGround DNS Setup

To connect a subdomain to Vercel:

1. **Login to SiteGround** → Websites → Your Site → Site Tools
2. Go to **Domain** → **DNS Zone Editor**
3. Add a **CNAME Record**:
   - **Name**: `sanity`
   - **Points to**: `cname.vercel-dns.com`
   - **TTL**: 3600
4. **In Vercel Dashboard**:
   - Project Settings → Domains
   - Add `sanity.holodeckos.com`
   - Vercel will verify the CNAME automatically

## Environment Variables

Store secrets in Vercel, not in git:

```powershell
# Set a secret
vercel env add SANITY_API_TOKEN

# Pull env to local
vercel env pull .env.local
```

## Useful Commands

```powershell
# Deploy preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# Pull project settings
vercel pull
```

---

See also: [[00-getting-started/02-github-setup]], [[11-planning/sanity-studio]]
