/**
 * AI Autopilot — Website Interactivity
 */

// ─── Button Data ────────────────────────────────────

const DEMO_BUTTONS = [
    { keys: '⎋', label: 'Escape', zone: 'pinky', app: 'vscode' },
    { keys: '⌘B', label: 'Sidebar', zone: 'ring', app: 'vscode' },
    { keys: '⌘Z', label: 'Undo', zone: 'middle', app: 'vscode' },
    { keys: '⌘S', label: 'Save', zone: 'middle', app: 'vscode' },
    { keys: 'F2', label: 'Rename', zone: 'index', app: 'vscode' },
    { keys: 'F5', label: 'Debug', zone: 'index', app: 'vscode' },
    { keys: '⌘\\', label: 'Split', zone: 'index', app: 'vscode' },
    { keys: '⌃`', label: 'Terminal', zone: 'index', app: 'vscode' },
    { keys: '⌘←', label: 'Back', zone: 'pinky', app: 'vscode' },
    { keys: '⌘⇧E', label: 'Explorer', zone: 'ring', app: 'vscode' },
    { keys: '⌘X', label: 'Cut', zone: 'middle', app: 'vscode' },
    { keys: '⌘C', label: 'Copy', zone: 'middle', app: 'vscode' },
    { keys: '⌘P', label: 'Quick Open', zone: 'index', app: 'vscode' },
    { keys: '⌘⇧P', label: 'Cmd Palette', zone: 'index', app: 'vscode' },
    { keys: '⌘⇧F', label: 'Find Files', zone: 'index', app: 'vscode' },
    { keys: '⌘/', label: 'Comment', zone: 'index', app: 'vscode' },
    { keys: '⌘W', label: 'Close', zone: 'pinky', app: 'vscode' },
    { keys: '⌘⇧V', label: 'Preview', zone: 'ring', app: 'vscode' },
    { keys: '⌘V', label: 'Paste', zone: 'middle', app: 'vscode' },
    { keys: '⌘A', label: 'Select All', zone: 'middle', app: 'vscode' },
    { keys: '⌘D', label: 'Multi Sel', zone: 'index', app: 'vscode' },
    { keys: '⌥↑', label: 'Move Up', zone: 'index', app: 'vscode' },
    { keys: '⌥↓', label: 'Move Down', zone: 'index', app: 'vscode' },
    { keys: 'F12', label: 'Go to Def', zone: 'index', app: 'vscode' },
    { keys: '⌘Q', label: 'Quit', zone: 'pinky', app: 'vscode' },
    { keys: '⌘M', label: 'Minimize', zone: 'ring', app: 'vscode' },
    { keys: '⌘F', label: 'Find', zone: 'middle', app: 'vscode' },
    { keys: '⌘N', label: 'New File', zone: 'middle', app: 'vscode' },
    { keys: '⌘⇧A', label: 'Agent Mgr', zone: 'index', app: 'antigravity' },
    { keys: '⌘⇧J', label: 'Projects', zone: 'index', app: 'antigravity' },
    { keys: '⌘⇧B', label: 'Brain', zone: 'index', app: 'antigravity' },
    { keys: '⌘⇧K', label: 'Quick Cmd', zone: 'index', app: 'antigravity' },
];

const ZONE_COLORS = {
    pinky: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', text: '#FCA5A5', accent: '#EF4444' },
    ring: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', text: '#FCD34D', accent: '#F59E0B' },
    middle: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', text: '#6EE7B7', accent: '#10B981' },
    index: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)', text: '#93C5FD', accent: '#3B82F6' },
};

const APP_ACCENT = {
    vscode: '#007ACC',
    chrome: '#4285F4',
    figma: '#A259FF',
    antigravity: '#6366F1',
};

// ─── Theme Definitions ──────────────────────────────

const THEMES = {
    default: {
        name: 'Dark Pro',
        btnBg: (zone) => ZONE_COLORS[zone].bg,
        btnBorder: (zone) => ZONE_COLORS[zone].border,
        btnText: (zone) => ZONE_COLORS[zone].text,
        frameBg: '#0D0D14',
    },
    neon: {
        name: 'Neon Glow',
        btnBg: () => 'rgba(0, 0, 0, 0.9)',
        btnBorder: (zone) => {
            const neonColors = { pinky: '#FF0080', ring: '#FFD700', middle: '#00FF88', index: '#00BFFF' };
            return neonColors[zone];
        },
        btnText: (zone) => {
            const neonColors = { pinky: '#FF0080', ring: '#FFD700', middle: '#00FF88', index: '#00BFFF' };
            return neonColors[zone];
        },
        frameBg: '#050505',
        glow: true,
    },
    glass: {
        name: 'Glassmorphism',
        btnBg: () => 'rgba(255, 255, 255, 0.06)',
        btnBorder: () => 'rgba(255, 255, 255, 0.12)',
        btnText: () => 'rgba(255, 255, 255, 0.85)',
        frameBg: '#0A0A12',
    },
    pixel: {
        name: 'Pixel Art',
        btnBg: (zone) => {
            const colors = { pinky: '#5a2a2a', ring: '#5a4a1a', middle: '#1a4a2a', index: '#1a2a5a' };
            return colors[zone];
        },
        btnBorder: (zone) => {
            const colors = { pinky: '#ff4444', ring: '#ffaa22', middle: '#22ff44', index: '#4488ff' };
            return colors[zone];
        },
        btnText: () => '#ffffff',
        frameBg: '#1a1c2c',
        pixelated: true,
    },
    contrast: {
        name: 'High Contrast',
        btnBg: () => '#000000',
        btnBorder: () => '#ffffff',
        btnText: () => '#ffffff',
        frameBg: '#000000',
    },
    minimal: {
        name: 'Minimal',
        btnBg: () => '#f0f0f3',
        btnBorder: () => '#e0e0e5',
        btnText: () => '#1a1a2e',
        frameBg: '#fafafa',
    },
    retro: {
        name: 'Retro Terminal',
        btnBg: () => 'rgba(0, 255, 0, 0.05)',
        btnBorder: () => 'rgba(0, 255, 0, 0.3)',
        btnText: () => '#00ff00',
        frameBg: '#0a0a0a',
        monochrome: '#00ff00',
    },
    mosaic: {
        name: '🖼 Mosaic',
        btnBg: (zone, i) => {
            const hue = (i * 11) % 360;
            return `hsl(${hue}, 60%, 20%)`;
        },
        btnBorder: (zone, i) => {
            const hue = (i * 11) % 360;
            return `hsl(${hue}, 70%, 45%)`;
        },
        btnText: () => 'rgba(255, 255, 255, 0.9)',
        frameBg: '#0D0D14',
        mosaic: true,
    },
};

// ─── Grid Rendering ─────────────────────────────────

function createGrid(containerId, buttons, theme = 'default') {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    grid.innerHTML = '';

    const themeConfig = THEMES[theme] || THEMES.default;

    buttons.forEach((btn, i) => {
        const el = document.createElement('div');
        el.className = 'deck-btn';
        const zone = btn.zone;

        el.style.background = themeConfig.btnBg(zone, i);
        el.style.border = `1px solid ${themeConfig.btnBorder(zone, i)}`;
        el.style.color = themeConfig.btnText(zone, i);
        el.style.borderTop = `3px solid ${APP_ACCENT[btn.app] || '#6366F1'}`;

        if (themeConfig.glow) {
            el.style.boxShadow = `0 0 8px ${themeConfig.btnBorder(zone, i)}40`;
        }

        if (themeConfig.pixelated) {
            el.style.borderRadius = '2px';
            el.style.fontFamily = 'monospace';
        }

        el.innerHTML = `
      <span class="key-combo">${btn.keys}</span>
      <span class="key-label">${btn.label}</span>
    `;

        // Bottom zone indicator
        const bottomBar = document.createElement('div');
        bottomBar.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:2px;background:${ZONE_COLORS[zone].accent};opacity:0.6;border-radius:0 0 8px 8px;`;
        el.appendChild(bottomBar);

        // Stagger entrance
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8) translateY(10px)';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'scale(1) translateY(0)';
        }, 50 + i * 20);

        grid.appendChild(el);
    });
}

// ─── Context Switching for Hero Grid ────────────────

const CHROME_BUTTONS = [
    { keys: '⌘T', label: 'New Tab', zone: 'index', app: 'chrome' },
    { keys: '⌘W', label: 'Close Tab', zone: 'pinky', app: 'chrome' },
    { keys: '⌘L', label: 'Address', zone: 'index', app: 'chrome' },
    { keys: '⌘R', label: 'Refresh', zone: 'index', app: 'chrome' },
    { keys: '⌘⌥I', label: 'DevTools', zone: 'index', app: 'chrome' },
    { keys: '⌘⇧T', label: 'Reopen', zone: 'index', app: 'chrome' },
    { keys: '⌘Y', label: 'History', zone: 'ring', app: 'chrome' },
    { keys: '⌘⇧B', label: 'Bookmarks', zone: 'ring', app: 'chrome' },
];

const FIGMA_BUTTONS = [
    { keys: 'V', label: 'Move', zone: 'index', app: 'figma' },
    { keys: 'F', label: 'Frame', zone: 'index', app: 'figma' },
    { keys: 'R', label: 'Rectangle', zone: 'index', app: 'figma' },
    { keys: 'T', label: 'Text', zone: 'index', app: 'figma' },
    { keys: 'P', label: 'Pen', zone: 'middle', app: 'figma' },
    { keys: '⌘G', label: 'Group', zone: 'middle', app: 'figma' },
    { keys: '⌘+', label: 'Zoom In', zone: 'ring', app: 'figma' },
    { keys: 'H', label: 'Hand', zone: 'pinky', app: 'figma' },
];

const contexts = ['vscode', 'chrome', 'figma'];
let contextIndex = 0;

function animateContextSwitch() {
    contextIndex = (contextIndex + 1) % contexts.length;
    const next = contexts[contextIndex];

    const grid = document.getElementById('deckGrid');
    if (!grid) return;

    const buttons = grid.querySelectorAll('.deck-btn');
    let newButtons;
    if (next === 'chrome') newButtons = CHROME_BUTTONS;
    else if (next === 'figma') newButtons = FIGMA_BUTTONS;
    else newButtons = DEMO_BUTTONS;

    buttons.forEach((el, i) => {
        if (i >= 8) return;
        const btn = newButtons[i % newButtons.length];
        const zone = ZONE_COLORS[btn.zone];
        const appColor = APP_ACCENT[btn.app] || '#6366F1';

        setTimeout(() => {
            el.style.transition = 'all 0.3s ease-out';
            el.style.opacity = '0';
            el.style.transform = 'scale(0.85)';

            setTimeout(() => {
                el.querySelector('.key-combo').textContent = btn.keys;
                el.querySelector('.key-label').textContent = btn.label;
                el.style.background = zone.bg;
                el.style.borderColor = zone.border;
                el.style.color = zone.text;
                el.style.borderTop = `3px solid ${appColor}`;
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
            }, 200);
        }, i * 40);
    });

    const label = document.getElementById('deckContextLabel');
    if (label) {
        const names = { vscode: 'VS Code Active', chrome: 'Chrome Active', figma: 'Figma Active' };
        label.textContent = names[next];
    }
}

setInterval(animateContextSwitch, 4000);

// ─── Theme Switching ────────────────────────────────

let currentTheme = 'default';

function switchTheme(theme) {
    currentTheme = theme;

    // Update style deck
    createGrid('styleDeckGrid', DEMO_BUTTONS, theme);

    // Update frame background
    const frames = document.querySelectorAll('.style-deck .deck-frame');
    const themeConfig = THEMES[theme] || THEMES.default;
    frames.forEach(f => f.style.background = themeConfig.frameBg);

    // Update label
    const label = document.getElementById('styleLabel');
    if (label) label.textContent = themeConfig.name;

    // Update active state
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === theme);
    });
}

// Theme card click handlers
document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => switchTheme(card.dataset.theme));
});

// Style prompt handler
const promptBtn = document.getElementById('promptBtn');
if (promptBtn) {
    promptBtn.addEventListener('click', () => {
        const input = document.getElementById('stylePrompt');
        const prompt = input?.value.trim().toLowerCase() || '';

        // Map prompt keywords to themes
        if (prompt.includes('neon') || prompt.includes('glow') || prompt.includes('cyberpunk')) switchTheme('neon');
        else if (prompt.includes('glass') || prompt.includes('blur') || prompt.includes('frosted')) switchTheme('glass');
        else if (prompt.includes('pixel') || prompt.includes('8-bit') || prompt.includes('retro game')) switchTheme('pixel');
        else if (prompt.includes('contrast') || prompt.includes('accessible')) switchTheme('contrast');
        else if (prompt.includes('minimal') || prompt.includes('light') || prompt.includes('clean')) switchTheme('minimal');
        else if (prompt.includes('terminal') || prompt.includes('matrix') || prompt.includes('hacker')) switchTheme('retro');
        else if (prompt.includes('mosaic') || prompt.includes('rainbow') || prompt.includes('panoramic')) switchTheme('mosaic');
        else switchTheme('neon'); // Default to neon for custom prompts

        // Animate the generate button
        promptBtn.innerHTML = '<span>✅ Applied!</span>';
        setTimeout(() => { promptBtn.innerHTML = '<span>✨ Generate</span>'; }, 1500);
    });
}

// ─── Scroll Nav ─────────────────────────────────────

window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── Smooth Scroll ──────────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ─── Intersection Observer ──────────────────────────

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step, .training-card, .pricing-card, .platform-card, .shop-card, .credit-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ─── Init ───────────────────────────────────────────

createGrid('deckGrid', DEMO_BUTTONS, 'default');
createGrid('styleDeckGrid', DEMO_BUTTONS, 'default');
