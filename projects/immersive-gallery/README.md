# VirtuOS 3D Immersive Gallery

A single-file, self-contained 3D web experience built with Three.js r128. It features 9 interactive modes selectable from a glassmorphism home screen, all running in one `index.html` file (~4,200 lines).

## Quick Start

Open `index.html` in any modern browser. No build tools, no dependencies, no server needed. Three.js loads from CDN.

To deploy: drop the file into [Netlify Drop](https://app.netlify.com/drop) inside a folder, and you get a live URL instantly.

## Architecture at a Glance

```
index.html
├── <style>        ~900 lines   CSS (glassmorphism, mode UIs, modals)
├── <body>         ~100 lines   HTML (overlays, panels, UI shells)
└── <script>       ~3,200 lines JavaScript (Three.js scene + all modes)
```

**Single global scene.** One Three.js scene, one camera, one renderer. Modes show/hide object arrays and swap camera positions. No routing, no frameworks, no bundler.

## The 9 Modes

| # | Mode | ID | Input | What It Does |
|---|------|----|-------|-------------|
| 1 | Walk-Through | `gallery` | WASD + Mouse | First-person 3D exploration with Pointer Lock. Floating objects you can look at and click. Minimap in corner. |
| 2 | Card Carousel | `cards` | Drag + Click | 9 double-sided 3D cards in 5 layout styles (Ring, Coverflow, Stack, Helix, Wave). Click to flip. |
| 3 | Virtuos Studios | `logo` | Drag to orbit | 3D metallic winged-V logo with crown, orbiting particles, glow effects. |
| 4 | 3D Operating System | `os` | Drag + Click | Floating 3D desktop with curved dock, app icons, status bar. Click icons to open app windows. |
| 5 | Device Lab | `devicelab` | Drag + Voice | 12 device types (phone, laptop, TV, watch, AR/VR, kiosk, etc.) showing live app UIs. Voice control via Web Speech API. |
| 6 | Storyboard | `storyboard` | Scroll + Click | 7 cinematic sections with frame carousels. Click any frame to upload an image. |
| 7 | Storyboard V2 | `storyboard2` | Scroll + Click | Enhanced version with zoom animation, batch upload, procedural cloud parallax backgrounds. |
| 8 | Onboarding | `onboard` | Click | 11-step migration assembly line to move data into VirtuOS. Each card has an (i) info button showing APIs and dev steps. |
| — | Home | `none` | Click a card | Glassmorphism card picker with floating geometric shapes in background. |

## How Modes Work

Every mode follows the same pattern:

```
enterXMode() {
    transitionTo(() => {           // 1. Fade overlay
        currentMode = 'x';        // 2. Set mode string
        hideAll();                 // 3. Hide every object group
        xObjects.forEach(visible); // 4. Show THIS mode's objects
        showUI([...]);             // 5. Show relevant UI elements
        camera.position.set(...);  // 6. Position camera
    });
}
```

`goHome()` reverses this: cleans up the current mode, hides everything, shows home objects, restores the overlay.

## Key Technical Patterns

**Object Groups** — Each mode has its own array (`galleryOnlyObjects[]`, `cardOnlyObjects[]`, `logoObjects[]`, `os3dObjects[]`, `dlObjects[]`, `homeObjects[]`). `hideAll()` sets `.visible = false` on all of them.

**Lerp Animation** — Movement uses `position.lerp(target, 0.08)` for buttery-smooth transitions instead of instant snapping.

**Canvas Textures** — Card faces, device screens, and OS icons are drawn procedurally on `<canvas>` elements, then applied as `THREE.CanvasTexture`.

**Drag-to-Orbit** — Logo, OS, and Device Lab modes share a pattern: mousedown sets `isDragging = true`, mousemove updates `dragAngle` and `dragY`, the animation loop positions the camera at `(sin(angle) * radius, dragY, cos(angle) * radius)`.

**Storyboard Modes are HTML-only** — Storyboard and Storyboard V2 hide the Three.js canvas entirely and render pure HTML/CSS overlays. They don't use the 3D scene at all.

**Onboarding is also HTML-only** — Same pattern as storyboard. Uses a conveyor-belt progress bar and card-based UI. Each step stores `importAPIs`, `serveAPIs`, and `devSteps` arrays for the info modal.

## File Map (Code Sections)

| Section | Lines (approx) | Description |
|---------|----------------|-------------|
| 1. Setup & Globals | 1020-1070 | Scene, camera, renderer, tone mapping, fog |
| 2. Shared Data | 1070-1090 | Gallery item definitions (icon, title, description, color) |
| 3. Environment Map | 1090-1130 | Procedural CubeTexture (6 gradient canvases with stars) |
| 4. Lighting | 1135-1165 | Ambient + Directional + 2 PointLights + Hemisphere + Rim |
| 5. Home Animation | 1170-1230 | 60 floating geometric shapes behind home screen |
| 6. Gallery Mode | 1230-1575 | Floor, pillars, interactive objects, particles, WASD controls, raycaster, minimap |
| 7. Card Mode | 1575-1770 | Card textures, 5 carousel layouts, flip animation, drag navigation |
| 8. Logo Mode | 1770-1950 | Wings geometry, crown, orbiting particles, metallic materials |
| 8.5 OS Mode | 1950-2460 | Dock with app icons, desktop widgets, app windows, hover/click |
| 8.55 Device Lab | 2460-2780 | 12 device meshes, screen rendering, voice recognition/synthesis |
| 8.6 Storyboard | 2780-2950 | HTML overlay, 7 sections, frame carousels, image upload |
| 8.7 Storyboard V2 | 2950-3400 | Cloud parallax, zoom animation, batch upload |
| 8.9 Onboarding | 3400-3770 | ONBOARD_STEPS data (11 steps with APIs), conveyor UI, info modal |
| 9. Wireframe Toggle | 3770-3790 | Swaps all materials to wireframe, changes background |
| 10. Mode Switching | 3790-3855 | enterXMode() functions, goHome(), transitionTo() |
| 11. Post-Processing | 3855-3865 | (Placeholder — bloom simulated via emissive + particles) |
| 12. Animation Loop | 3865-3910 | requestAnimationFrame, delegates to per-mode update functions |
| 13. Event Listeners | 3910-4050 | Keyboard, mouse, click, wheel, pointer lock, resize |
| 14. Initialization | 4050-4095 | Build all objects, hide non-home, start animate(), fade loading |

## Dependencies

- **Three.js r128** — loaded from `cdnjs.cloudflare.com` CDN
- **Google Fonts (Inter)** — loaded from `fonts.googleapis.com`
- **Web Speech API** — browser-native, used in Device Lab mode for voice control
- **FileReader API** — browser-native, used in Storyboard modes for image upload

No npm, no node_modules, no build step.

## Related Docs in This Folder

- `TECHNICAL-REFERENCE.md` — Code conventions, gotchas, and patterns
- `API-REFERENCE.md` — Full API research for every onboarding step (import APIs, VirtuOS APIs, dev steps)
- `DEVELOPER-GUIDE.md` — How to add new modes, modify existing ones, and extend the system
