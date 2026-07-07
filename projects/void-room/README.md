# 🌌 Void Room — Universal Collaborative 3D Space

## What's in this package

| File | Description |
|---|---|
| `index.html` | **Combined edition** — 3D space + device guide in one file with tab navigation |
| `void-room.html` | **Standalone 3D space** — just the collaborative 3D app |
| `device-guide.html` | **Standalone device guide** — setup instructions for 26 devices across 8 categories |

## Quick Start

1. **Local testing:** Open `index.html` in any browser — it works offline (except for Three.js CDN)
2. **Deploy:** Drag `index.html` to [Netlify Drop](https://app.netlify.com/drop) — live in seconds, free
3. **Share:** Send the URL to friends. Append `#room-name` to create/join specific rooms

## Multiplayer

- Same-device tabs sync instantly via BroadcastChannel + localStorage
- For cross-device sync: host the file online and share the URL
- Everyone with the same `#room-name` hash joins the same space

## Supported Devices

| Category | Devices | Difficulty |
|---|---|---|
| 🍎 Apple | iPhone, iPad, Mac, Apple TV, Vision Pro, Apple Watch | Easy → Hackery |
| 🪟 Windows | PC, Laptop, Surface, Xbox | Easy → Medium |
| 🤖 Android | Phone, Tablet, Chromebook | Easy |
| 📺 Smart TVs | Samsung Tizen, LG webOS, Android TV, Roku | Medium → Hard |
| 🔥 Amazon | Fire Stick, Fire Tablet, Echo Show, Echo Speaker | Easy → Hackery |
| ⌚ Wearables | Apple Watch, Wear OS, Galaxy Watch | Hackery |
| 🎮 Consoles | PlayStation, Xbox, Nintendo Switch, Steam Deck | Easy → Hard |
| 🖥️ DIY | Raspberry Pi, Smart Fridge, Projector, Meta Quest, Car Display | Easy → Hard |

## Controls

- **Mouse:** Left-click = interact, Right-drag = orbit, Scroll = zoom
- **Touch:** One finger = interact, Two fingers = orbit, Pinch = zoom
- **Keyboard:** M=Move, P=Place, R=Rotate, S=Scale, X=Delete, C=Color, 1-9=Shapes
- **Gamepad:** Left stick = orbit, Right stick = move, Triggers = zoom

## Free Hosting Options

- **Netlify Drop** — drag & drop, instant
- **GitHub Pages** — push to repo, enable Pages
- **Vercel** — `vercel deploy --prod`
- **Cloudflare Pages** — upload via dashboard
- **Local network** — `python3 -m http.server 8080`
