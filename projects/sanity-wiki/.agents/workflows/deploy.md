---
description: Deploy the Sanity Wiki to production (push to GitHub → Vercel auto-deploys)
---

# Deploy Sanity Wiki

This workflow pushes all local changes directly to `main` on `jmassion/sanity` GitHub repo.
Vercel auto-deploys on every push — no PRs, no merging, no manual steps.

**Live URL**: https://sanity-one-flame.vercel.app
**GitHub Repo**: https://github.com/jmassion/sanity
**Vercel Project**: https://vercel.com/jmassions-projects/sanity

## Steps

// turbo-all

1. Stage all changes:
```powershell
cd c:\Users\jmass\Dropbox\AntiGravity\Sanity && git add -A
```

2. Commit with a descriptive message:
```powershell
cd c:\Users\jmass\Dropbox\AntiGravity\Sanity && git commit -m "update: <describe changes>"
```

3. Push directly to main:
```powershell
cd c:\Users\jmass\Dropbox\AntiGravity\Sanity && git push origin main
```

4. Verify deployment is live (wait ~30 seconds, then check):
- Visit https://sanity-one-flame.vercel.app
- Or check https://vercel.com/jmassions-projects/sanity for deployment status

## Important Notes

- The Sanity folder has its **own git repo** (separate from AntiGravity parent)
- Working directory for all git commands: `c:\Users\jmass\Dropbox\AntiGravity\Sanity`
- The parent AntiGravity `.gitignore` already excludes `Sanity/.git`
- Always push directly to `main` — no branches, no PRs
