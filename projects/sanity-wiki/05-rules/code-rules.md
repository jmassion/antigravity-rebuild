# 💻 Code Rules

Standards for all code in the AntiGravity ecosystem.

## General
- Use clear, descriptive variable and function names
- Comment non-obvious logic
- Prefer simplicity over cleverness
- Keep functions small and focused

## Web Standards
- HTML5 semantic elements
- CSS custom properties for design tokens
- ES modules for JavaScript
- No build step for simple pages (vanilla HTML/CSS/JS)
- Use frameworks (Next.js, Vite) only when complexity warrants it

## Vercel-Specific
- Treat Functions as stateless and ephemeral
- Store state in Blob or marketplace integrations
- Set regions near data sources
- Use `waitUntil` for post-response work
- See the full Vercel best practices in [[00-getting-started/03-vercel-setup]]

## Git
- Follow commit convention: `type: description`
- Push after every meaningful change
- Use branches for experimental work

---

See also: [[05-rules/global-rules]], [[05-rules/content-rules]]
