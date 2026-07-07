# Technical Reference

Code conventions, gotchas, and patterns a developer needs to know before touching this file.

## Core Globals

```javascript
let currentMode = "none";
// Valid values: "none", "gallery", "cards", "logo", "os",
//               "storyboard", "storyboard2", "devicelab", "onboard"

const BG_COLORS = {
    home:     new THREE.Color(0x08080f),
    gallery:  new THREE.Color(0x0a0b14),
    cards:    new THREE.Color(0x0a0b12),
    logo:     new THREE.Color(0x0c0810),
    os:       new THREE.Color(0x060810),
    devicelab:new THREE.Color(0x060a10),
    wire:     new THREE.Color(0x04040a)
};
```

The `currentMode` string is checked everywhere: animation loop, event listeners, mouse handlers, keyboard handlers. **Always set it inside `transitionTo()` callbacks.**

## Object Visibility System

Each 3D mode has an array of objects it owns:

```javascript
const homeObjects = [];           // Home screen floating shapes
const galleryOnlyObjects = [];    // Gallery floor, pillars, interactive objects
const cardOnlyObjects = [];       // 3D playing cards
const logoObjects = [];           // Logo geometry, orbiting particles
const os3dObjects = [];           // OS dock icons, desktop, widgets
const dlObjects = [];             // Device Lab device meshes
```

Plus group containers for complex modes:

```javascript
let logoGroup = null;             // THREE.Group for the full logo assembly
let osDesktopGroup = null;        // THREE.Group for OS desktop + monitor
let dlGroup = null;               // THREE.Group for all Device Lab objects
```

`hideAll()` sets `.visible = false` on every array and group, plus hides all UI elements. Every `enterXMode()` calls `hideAll()` first, then shows only what it needs.

## The Animation Loop

```javascript
function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);  // Capped at 50ms
    const elapsed = clock.elapsedTime;

    if (currentMode === 'none')      updateHomeAnimation(elapsed);
    if (currentMode === 'gallery')   { updateGalleryMovement(delta); updateGalleryRaycaster(); ... }
    if (currentMode === 'cards')     updateCardMode(elapsed);
    if (currentMode === 'logo')      updateLogoMode(elapsed);
    if (currentMode === 'os')        updateOSMode(elapsed);
    if (currentMode === 'devicelab') updateDeviceLabMode(elapsed);

    renderer.render(scene, camera);
}
```

Note: `storyboard`, `storyboard2`, and `onboard` modes are **pure HTML** — they hide the Three.js canvas entirely and don't need animation loop updates.

## Transition System

```javascript
function transitionTo(callback) {
    const overlay = document.getElementById('transitionOverlay');
    overlay.style.opacity = '1';              // Fade to black
    setTimeout(() => {
        callback();                           // Do the mode switch
        overlay.style.opacity = '0';          // Fade back in
    }, 400);
}
```

All mode switches go through this. Never set `currentMode` outside of a `transitionTo()` callback — it causes visual glitches.

## Camera Patterns

**Gallery Mode** — First-person. Uses Pointer Lock API. Camera rotation tracked via `playerState.yaw` and `playerState.pitch`. Movement uses lerp:

```javascript
playerState.smoothPos.lerp(targetPosition, 0.08);
camera.position.copy(playerState.smoothPos);
```

The `0.08` lerp factor is critical — it eliminates the jitter that plagued earlier versions.

**Orbit Modes (Logo, OS, Device Lab)** — All share this pattern:

```javascript
// In mousemove handler:
dragAngle -= e.movementX * 0.004;
dragY = Math.max(min, Math.min(max, dragY - e.movementY * 0.008));

// In animation loop:
const radius = 12;
camera.position.x = Math.sin(dragAngle) * radius;
camera.position.y = dragY;
camera.position.z = Math.cos(dragAngle) * radius;
camera.lookAt(0, centerY, 0);
```

## Critical Gotcha: Three.js `position` Property

**Never use `Object.assign()` to set `.position` on Three.js objects.** The `position` property is a getter/setter (it's a `THREE.Vector3` that gets intercepted), not a plain property.

```javascript
// WRONG — causes "Cannot assign to read only property 'position'"
Object.assign(new THREE.PointLight(0x667eea, 0.4, 20), {
    position: new THREE.Vector3(0, 8, 0)
});

// CORRECT
const light = new THREE.PointLight(0x667eea, 0.4, 20);
light.position.set(0, 8, 0);
```

This also applies to `.rotation`, `.scale`, and `.quaternion`.

## Canvas Texture Generation

Cards, device screens, and OS icons are all drawn procedurally:

```javascript
function createCardTexture(item, side) {
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 560;
    const ctx = canvas.getContext('2d');
    // ... draw gradients, text, icons ...
    return new THREE.CanvasTexture(canvas);
}
```

After creating a canvas texture, call `texture.needsUpdate = true` if you modify the canvas later.

## CSS Design System

The UI uses a consistent glassmorphism pattern:

```css
.glass {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
}
```

Color palette across the project:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#667eea` | Accents, buttons, glows |
| Primary Purple | `#764ba2` | Gradients, secondary accents |
| Cyan | `#4facfe` | Highlights |
| Pink | `#e88ded` | Accents |
| Green | `#43e97b` | Success states, indicators |
| Red/Coral | `#f5576c` | Warnings, close buttons |
| Gold | `#f6d365` | Badges |
| Background | `#0a0a12` | Main body/scene background |

## Renderer Settings

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.outputEncoding = THREE.sRGBEncoding;
```

The pixel ratio cap at 2 is intentional — prevents performance issues on high-DPI displays.

## Voice Control (Device Lab)

Uses the Web Speech API (browser-native, no library):

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceRecognition = new SpeechRecognition();
voiceRecognition.continuous = true;
voiceRecognition.interimResults = false;
```

Voice commands include: "next app", "previous app", "load [app name]", "show [device name]". Speech synthesis (`SpeechSynthesisUtterance`) provides voice feedback.

## Storyboard HTML Pattern

Both storyboard modes work the same way:

1. `enterSB2Mode()` hides the Three.js canvas via `renderer.domElement.style.display = 'none'`
2. Shows a full-page HTML container with CSS scroll sections
3. `exitSB2Mode()` restores `renderer.domElement.style.display = 'block'`

This means the Three.js scene is still loaded in memory — it's just hidden. No scene disposal happens.

## Onboarding Data Structure

Each step in `ONBOARD_STEPS[]` has this shape:

```javascript
{
    icon: '📧',
    title: 'Import Emails',
    color: '#667eea',
    btnText: 'CONNECT EMAIL',
    desc: 'Connect Gmail, Outlook, Yahoo...',
    importAPIs: [
        { name: 'Gmail API', type: 'REST', pricing: 'Free (500MB/day)', docs: 'developers.google.com/gmail/api' }
    ],
    serveAPIs: [
        { name: 'VirtuOS Email API', endpoints: ['POST /api/v1/emails/import/{provider}', ...] }
    ],
    devSteps: ['OAuth 2.0 for Gmail...', 'OAuth 2.0 for Microsoft Graph...', ...]
}
```

The `openObInfoModal(stepIndex)` function reads this data and builds the info modal dynamically.
