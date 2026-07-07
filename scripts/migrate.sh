#!/bin/bash
# Migrate prototypes from the original AntiGravity folder into projects/.
# Repeatable: re-running refreshes copies from the source of truth.
# Heavy media, node_modules, and build junk are excluded; projects whose
# media lives on a CDN or an existing Vercel deploy are embedded remotely
# instead (see catalog/projects.json).
set -euo pipefail

SRC="${ANTIGRAVITY_SRC:-/Users/wyoming/Dropbox/4. Dropbox/AntiGravity}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/projects"
mkdir -p "$DEST"

R="rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude .DS_Store --exclude *.zip"

copy() { # copy <src-rel> <dest-slug> [extra rsync args...]
  local from="$SRC/$1"; local to="$DEST/$2"; shift 2
  echo "→ $to"
  mkdir -p "$to"
  $R "$@" "$from/" "$to/"
}

# ── Platforms & OS ──────────────────────────────────────────────
copy "OS Solar System"                     os-solar-system
copy "playground/oneOS/public"             oneos
copy "Utilities/GameEngine"                game-engine --exclude package-lock.json
copy "Utilities/WebBrowser"                webbrowser
copy "playground/void-room-package"        void-room

# ── Sites & case studies ────────────────────────────────────────
copy "Case-Studies/NoahOS"                 noahos
copy "Case-Studies/Garfield"               garfield
copy "Scraper/siteground/AlphaUnicorn"     alphaunicorn
copy "playground/air-rebuild"              air-rebuild
copy "FranchiseOS"                         franchiseos

# ── Wikis & knowledge ───────────────────────────────────────────
copy "lessons"                             lessons
copy "living-canvas-wiki"                  living-canvas-wiki
# Sanity: static SPA + markdown content only (studio/frontend are source-only)
copy "Sanity"                              sanity-wiki \
  --exclude studio --exclude frontend --exclude .agent

# HolodeckOS Gallery v1: the old root gallery, preserved (thumbnails included —
# the gallery renders broken images without them)
mkdir -p "$DEST/holodeck-gallery/ag-assets"
cp "$SRC/index.html" "$DEST/holodeck-gallery/index.html"
rsync -a --delete --exclude node_modules --exclude package-lock.json \
  --exclude capture.js --exclude package.json \
  "$SRC/ag-assets/" "$DEST/holodeck-gallery/ag-assets/"

# ── Data browsers & scrapers ────────────────────────────────────
copy "Scraper/Higgsfield"                  higgsfield --exclude api --exclude "*.har"
copy "Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy" air-ui-study \
  --exclude data-export.json   # 38MB export not referenced by the app
copy "Scraper/LovartHiggsFieldAirOrganizer/public"     air-organizer
# lovable-aurora / lovable-dreamscape / lovable-muse are NOT copied here:
# the originals are unbuilt Vite/React source (Lovable exports). They are
# compiled (npm install && vite build --base=./) and their dist/ output is
# committed to projects/<slug>/ directly — see README build recipe.

# ── 3D & interaction demos ──────────────────────────────────────
copy "Demos/Immersive Gallery"             immersive-gallery
copy "Demos/Corridors"                     corridors
copy "Demos/3D Mouse Mastery"              mouse-mastery
copy "playground/rive-showcase"            rive-showcase --exclude package-lock.json
copy "playground/Root Dashboard"           nexus-dashboard

# ── Tools ───────────────────────────────────────────────────────
copy "Utilities/SwipeRate"                 swiperate
copy "Utilities/agent-manager-dashboard"   agent-manager
copy "Utilities/Annotation Studio/app"     annotation-studio
copy "MCP/Vercel"                          vercel-mcp
copy "cloud_dashboard/public"              cloud-dashboard
copy "Utilities/Stream Deck Project/_project.streamdeck-ai/packages/website" streamdeck-ai

# ── post-copy patches (fixes for static serving under /p/<slug>/) ──
# rive-showcase: vite-dev absolute paths → relative
sed -i '' -e 's|href="/style.css"|href="./style.css"|' \
          -e 's|src="/main.js"|src="./main.js"|' \
          -e 's|src="/agent-demo.webp"|src="./public/agent-demo.webp"|' \
  "$DEST/rive-showcase/index.html"
sed -i '' "s|'/rive-button.riv'|'./public/rive-button.riv'|" "$DEST/rive-showcase/main.js"
# cloud-dashboard: initApp referenced before its defining script block
sed -i '' 's|addEventListener("DOMContentLoaded", initApp)|addEventListener("DOMContentLoaded", () => initApp())|' \
  "$DEST/cloud-dashboard/index.html"

echo "Done. Built apps (agentworld, mission-control, spatial-lab, lovable-*) are compiled separately — see README."
echo "Note: mission-control build needs 's|\"/images/|\"images/|g' applied to its bundle after vite build."
