# 📡 Publishing Workflows

Step-by-step workflows for publishing content across the AntiGravity ecosystem.

## Quick Deploy (Wiki Updates)

For small content changes that should go live immediately:

1. Make your edits in the `Sanity/` folder
2. Run the deploy workflow:
   ```powershell
   cd c:\Users\jmass\Dropbox\AntiGravity\Sanity
   git add -A
   git commit -m "update: <describe changes>"
   git push origin main
   ```
3. Wait ~30 seconds for Vercel auto-deploy
4. Verify at https://sanity-one-flame.vercel.app

## New Wiki Section

When adding an entirely new section to the wiki:

1. Create folder with numeric prefix: `NN-section-name/`
2. Create `README.md` with section overview
3. Add entry to `_config.json` sections array
4. Add all `.md` files to `PAGE_MANIFEST` in `app.js`
5. Update cross-references in related sections
6. Deploy using Quick Deploy workflow

## New Wiki Page

When adding a new page to an existing section:

1. Create `.md` file in the appropriate section folder
2. Follow naming convention: `lowercase-with-hyphens.md`
3. Start with `# Emoji Title` heading
4. Add `[[wiki-links]]` for cross-references
5. Add the file path to `PAGE_MANIFEST` in `app.js`
6. Update the section's `README.md` to reference the new page
7. Deploy using Quick Deploy workflow

## Content Review Checklist

Before publishing, verify:
- [ ] All `[[wiki-links]]` resolve to real pages
- [ ] Tables render correctly
- [ ] Code blocks have language specified
- [ ] No broken image references
- [ ] Section README updated if structure changed
- [ ] `PAGE_MANIFEST` in `app.js` updated with new files

---

See also: [[07-publishing/channels]], [[00-getting-started/05-conventions]]
