# Developer Guide — Extending VirtuOS Gallery

How to add new modes, modify existing ones, and work with this codebase.

## Loading This Project Into a New AI Session

Paste this prompt to give a new Claude/Cursor/Copilot session full context:

```
I'm working on a Three.js 3D gallery called VirtuOS. It's a single self-contained
HTML file (~4,200 lines) with 9 interactive modes. I need you to read these files
to understand the project:

1. README.md — Architecture overview and mode system
2. TECHNICAL-REFERENCE.md — Code patterns, gotchas, globals
3. API-REFERENCE.md — API research for all onboarding steps
4. index.html — The actual source code

Key things to know:
- Three.js r128 from CDN, no build tools
- Single scene, modes show/hide object arrays
- Lerp-based animation (0.08 factor)
- Canvas textures for procedural graphics
- transitionTo() for all mode switches
- NEVER use Object.assign() for Three.js position/rotation/scale
- Storyboard and Onboarding modes are pure HTML (hide canvas)
```

## Adding a New 3D Mode

Follow these 7 steps exactly. Every existing mode was built this way.

### 1. Add the Home Screen Card

In the HTML `<div class="mode-picker">` section (~line 809), add:

```html
<div class="mode-card glass" id="modeNewThing">
    <span class="badge">TAG</span>
    <span class="icon">🎯</span>
    <h3>New Thing</h3>
    <p>Short description of what this mode does.</p>
</div>
```

### 2. Create the Object Array

Near the top of the `<script>` section, with the other arrays:

```javascript
const newThingObjects = [];
let newThingGroup = null;
```

### 3. Write the Creation Function

```javascript
function createNewThing() {
    newThingGroup = new THREE.Group();

    // Create your 3D objects here
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);  // NEVER use Object.assign!
    newThingGroup.add(mesh);
    newThingObjects.push(mesh);

    scene.add(newThingGroup);
    newThingGroup.visible = false;  // Hidden by default
}
```

### 4. Write the Update Function

```javascript
function updateNewThingMode(elapsed) {
    // Camera orbit (if drag-to-orbit mode)
    const radius = 12;
    camera.position.x = Math.sin(newThingDragAngle) * radius;
    camera.position.y = newThingDragY;
    camera.position.z = Math.cos(newThingDragAngle) * radius;
    camera.lookAt(0, 3, 0);

    // Animate your objects
    newThingObjects.forEach(obj => {
        obj.rotation.y += 0.005;
    });
}
```

### 5. Write the Enter Function

```javascript
function enterNewThingMode() {
    transitionTo(() => {
        currentMode = 'newthing';
        const ov = document.getElementById('overlay');
        ov.style.opacity = '0'; ov.style.pointerEvents = 'none';
        if (document.pointerLockElement) document.exitPointerLock();
        playerState.isLocked = false;

        hideAll();
        newThingObjects.forEach(o => o.visible = true);
        if (newThingGroup) newThingGroup.visible = true;
        showUI(['backBtn', 'wireframeBtn', 'modeLabel']);
        setModeLabel('New Thing');

        if (!wireframeOn) {
            scene.background = new THREE.Color(0x080810);
            scene.fog = new THREE.FogExp2(0x080810, 0.02);
        }
        camera.position.set(0, 4, 12);
        camera.lookAt(0, 3, 0);
    });
}
```

### 6. Wire It Up

Add these in the correct locations:

```javascript
// In hideAll():
newThingObjects.forEach(o => o.visible = false);
if (newThingGroup) newThingGroup.visible = false;

// In animation loop:
if (currentMode === 'newthing') updateNewThingMode(elapsed);

// In mousedown handler:
if (currentMode === 'newthing' && e.target === renderer.domElement) {
    newThingIsDragging = true;
}

// In mousemove handler:
if (newThingIsDragging && currentMode === 'newthing') {
    newThingDragAngle -= e.movementX * 0.004;
    newThingDragY = Math.max(1.5, Math.min(8, newThingDragY - e.movementY * 0.008));
}

// In mouseup handler:
newThingIsDragging = false;

// In wheel handler:
if (currentMode === 'newthing') {
    newThingDragY = Math.max(1.5, Math.min(8, newThingDragY + e.deltaY * 0.003));
}

// In event listeners section:
document.getElementById('modeNewThing').addEventListener('click', enterNewThingMode);

// In initialization section:
createNewThing();
```

### 7. Update the Table of Contents

Add your new mode to both the top and bottom TOC comments in the script.

## Adding a New HTML-Only Mode (like Storyboard)

If your mode doesn't need 3D rendering:

1. Add an HTML container: `<div id="newThingContainer" style="display:none"></div>`
2. In `enterNewThingMode()`, hide the canvas: `renderer.domElement.style.display = 'none'`
3. Show your container: `document.getElementById('newThingContainer').style.display = 'block'`
4. In your exit function, restore the canvas: `renderer.domElement.style.display = 'block'`
5. No animation loop update needed — the canvas isn't rendering

## Adding a New Onboarding Step

In the `ONBOARD_STEPS` array (around line 3404):

```javascript
{
    icon: '🎯',
    title: 'Import Something',
    color: '#667eea',
    btnText: 'CONNECT',
    desc: 'Description of what this step does.',
    importAPIs: [
        { name: 'API Name', type: 'REST', pricing: 'Free', docs: 'example.com/docs' }
    ],
    serveAPIs: [
        { name: 'VirtuOS Something API', endpoints: [
            'POST /api/v1/something/import',
            'GET /api/v1/something'
        ]}
    ],
    devSteps: [
        'Step 1: Do this first',
        'Step 2: Then do this'
    ]
}
```

Insert it before the final "Migration Complete" step. The UI auto-generates everything from this data — step numbers, progress bar, info modal content.

## Performance Notes

The file is ~4,200 lines and ~200KB. For a single HTML file this is getting large but still loads instantly. If it grows significantly, consider:

- **Splitting CSS into a separate file** — saves ~900 lines
- **Lazy-loading modes** — only create 3D objects for a mode when it's first entered
- **Disposing unused geometry** — call `.geometry.dispose()` and `.material.dispose()` when leaving a mode (currently everything stays in memory)
- **Using real post-processing** — the current bloom simulation works but real `UnrealBloomPass` from Three.js examples would look better (requires importing `EffectComposer`)

## Common Tasks

**Change a mode's background color:** Update `BG_COLORS` object and the color in the mode's enter function.

**Add a new carousel style:** In the card mode section, add a new case to `setCarouselStyle()` that computes `targetPos`, `targetRot`, and `targetScale` for each card.

**Change the gallery items:** Edit the `ITEMS` array near the top of the script (~line 1070). Each item needs `icon`, `title`, `description`, and `color`.

**Add a new device to Device Lab:** Add an entry to the `DEVICES` array (~line 2466) with `name`, `emoji`, `w`, `h`, `bezel`, `radius`, `pos`, `rot`, `scale`.

**Add a new app to Device Lab:** Add an entry to `DL_APPS` array (~line 2482) with `name`, `icon`, `color`, `layout`.
