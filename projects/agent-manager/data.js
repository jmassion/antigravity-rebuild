// ─── BASE PATH (root of AntiGravity projects) ───
const AG_ROOT = '/Users/justinmassion/Dropbox/AntiGravity';
const DL_ROOT = `${AG_ROOT}/Utilities/WebBrowser/SharedBrowserPrototype`;

// ─── DATA MODEL ───
const WORKSPACES = [
    {
        id: 'tabspace',
        name: 'TabSpace',
        icon: '🌐',
        color: '#58a6ff',
        workspacePath: `${AG_ROOT}/Utilities/WebBrowser/SharedBrowserPrototype`,
        thumbnail: 'thumbnails/thumb_tabspace.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Three.js', 'CSS3DRenderer', 'WebSocket', 'CDP', 'Playwright', 'Node.js'],
        description: 'Next-gen multiplayer browser — CDP streaming, 3D sphere view, 8 view modes, agent-orchestratable.',
        previewFiles: [
            { label: 'WebBrowser Home', path: `${AG_ROOT}/Utilities/WebBrowser/index.html` },
            { label: 'Main App', path: `${DL_ROOT}/client/index.html` },
            { label: '3D Sphere', path: `${DL_ROOT}/client/3d.html` },
            { label: 'Notes View', path: `${DL_ROOT}/client/notes.html` }
        ],
        threads: [
            {
                id: '61f4cb26',
                fullId: '61f4cb26-e6a1-4d6d-8682-1259938f7a98',
                title: 'CDP Streaming Implementation',
                status: 'complete',
                intent: 'Implement real Chrome browser pixel streaming via Chrome DevTools Protocol (CDP) using Playwright, with binary WebSocket frame forwarding and client-side canvas rendering.',
                whatWorked: [
                    'Playwright-core launches Chrome v145 headlessly and captures screencast frames via CDP',
                    'Binary packet protocol (32-byte surfaceId header + JPEG data) works reliably',
                    'Server forwards binary frames to all connected clients',
                    'Client renders JPEG on <canvas> with "CDP LIVE" badge',
                    'Mouse/keyboard input capture → SEND_INPUT → CDP injection works for interaction'
                ],
                whatDidnt: [
                    'Initial frame quality needed tuning (settled on JPEG quality 60)'
                ],
                outputs: [
                    { name: 'cdp-host.js', desc: 'Chrome launcher + screencast + input injection' },
                    { name: 'server.js', desc: 'Binary frame forwarding' },
                    { name: 'client.js', desc: 'Canvas rendering + input capture' }
                ],
                nextSteps: [
                    'Full-page screenshot mode (capture entire scrollable page as tall image)',
                    'Infinite canvas / pan-zoom sitemap (Figma-style zoom)',
                    'Canvas zoom vs content zoom separation'
                ],
                tasks: [
                    { text: 'Add/remove browsers, protocol messages, modal UI', done: true },
                    { text: 'Fix red/yellow/green window buttons', done: true },
                    { text: 'View mode switcher (Grid / Full Height / Carousel / Sitemap)', done: true },
                    { text: 'CDP host via Playwright-core, Chrome headless', done: true },
                    { text: 'Page.startScreencast → JPEG frames', done: true },
                    { text: 'Server binary frame forwarding', done: true },
                    { text: 'Client canvas rendering + CDP LIVE badge', done: true },
                    { text: 'Mouse/keyboard input capture → SEND_INPUT → CDP injection', done: true }
                ]
            },
            {
                id: '5b99ca87',
                fullId: '5b99ca87-33d6-4901-80c0-058672fb6c46',
                title: 'Smart Rendering & View Modes',
                status: 'partial',
                intent: 'Fix snapshot layer covering iframes (causing blank white viewports) and add 4 new view modes: Stack, Mosaic, Focus, Cinema.',
                whatWorked: [
                    'Iframe-first viewport architecture: iframe at z:0, snapshot at z:1, CDP canvas at z:2',
                    'CDP canvas only overlays when real frames arrive — no more blank viewports',
                    'All 8 view modes render: Grid, Full Height, Carousel, Sitemap, Stack, Mosaic, Focus, Cinema',
                    'Focus button (◎) on each card sets the cinema/focus target'
                ],
                whatDidnt: [
                    'Snapshot layer was covering iframes — required complete architectural rethink',
                    'Some view modes still need full browser verification with live content'
                ],
                outputs: [
                    { name: 'client.js', desc: 'Iframe-first viewport, CDP canvas overlay, 8 view modes' },
                    { name: 'styles.css', desc: 'Mosaic/Focus/Stack/Cinema CSS' },
                    { name: 'index.html', desc: '4 new view mode buttons' },
                    { name: 'cdp-host.js', desc: 'Frame diffing, auto-snapshot after 5s idle' },
                    { name: 'server.js', desc: 'SURFACE_SNAPSHOT, RENDER_MODE_CHANGE handlers' }
                ],
                nextSteps: [
                    'Full browser test — verify all 8 views render with live content',
                    'Ensure iframes remain fully interactive in all modes',
                    'Verify CDP-mode and iframe-mode hosts both work correctly'
                ],
                tasks: [
                    { text: 'CDP host activity detection', done: true },
                    { text: 'Server protocol extensions', done: true },
                    { text: 'Client adaptive viewport', done: true },
                    { text: 'CSS render badges + crossfade', done: true },
                    { text: 'Fix snapshot layer covering iframes', done: 'progress' },
                    { text: 'Ensure iframes remain fully interactive', done: false },
                    { text: 'Add Stack/Mosaic/Focus/Cinema views', done: true },
                    { text: 'Browser test — all views render correctly', done: false }
                ]
            },
            {
                id: '5d5b2e66',
                fullId: '5d5b2e66-8bfc-4643-ae75-2ff6524178bb',
                title: '3D Browser Sphere',
                status: 'partial',
                intent: 'Create a Three.js CSS3DRenderer sphere where browser windows float in 3D space with orbit controls, auto-rotation, and a star field background.',
                whatWorked: [
                    'CSS3DRenderer renders real HTML/iframes in 3D (not textures)',
                    'OrbitControls — click+drag to orbit, scroll to zoom',
                    'Auto-rotation pauses when interacting, resumes after 8s',
                    'Animated star field background',
                    'WebSocket connected — same room/presence system as flat view'
                ],
                whatDidnt: [
                    'Live WebSocket surface data not fully wired to 3D positions'
                ],
                outputs: [
                    { name: '3d.html', desc: 'Three.js CSS3DRenderer sphere view' }
                ],
                nextSteps: [
                    'Wire live surface data from WebSocket to 3D card positions',
                    'Make iframes interactive in 3D space',
                    'Add ambient animations and transitions between views'
                ],
                tasks: [
                    { text: 'Create 3d.html with Three.js CSS3DRenderer', done: 'progress' },
                    { text: 'Arrange 6 browser surfaces on a sphere', done: true },
                    { text: 'Add OrbitControls for rotation', done: true },
                    { text: 'Connect to WebSocket for live surface data', done: false },
                    { text: 'Style browser window chrome in 3D', done: true },
                    { text: 'Add ambient animations (gentle auto-rotate)', done: true }
                ]
            },
            {
                id: '9d62de04',
                fullId: '9d62de04-d7cf-4366-ae98-3f07efe407e2',
                title: 'WebBrowser Homepage & Folder Restructure',
                status: 'complete',
                intent: 'Move tabspace_multiplayer_pack from ~/Downloads into AntiGravity/WebBrowser/SharedBrowserPrototype, create a premium homepage at WebBrowser/index.html, clean up dependencies, and update the dashboard.',
                whatWorked: [
                    'Folder moved and renamed to WebBrowser/SharedBrowserPrototype',
                    'Bundled Node.js binary (2376 files) removed to reduce bloat',
                    'npm dependencies reinstalled cleanly in server/ and host/',
                    'Premium homepage with hero, 5 pillars, demo links, architecture, CTA, star field, glassmorphism',
                    'Dashboard paths and data model updated'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'WebBrowser/index.html', desc: 'Premium homepage — Building a Better Web Browser' },
                    { name: 'package.json (server)', desc: 'Renamed to sharedbrowser-room-server' },
                    { name: 'package.json (host)', desc: 'Renamed to sharedbrowser-host' }
                ],
                nextSteps: [
                    'Test server and host starting from new paths',
                    'Set up process managers (PM2) for persistent running'
                ],
                tasks: [
                    { text: 'Move and rename WebBrowser/SharedBrowserPrototype', done: true },
                    { text: 'Remove unneeded node binaries', done: true },
                    { text: 'Update package.jsons and reinstall deps', done: true },
                    { text: 'Create premium index.html homepage', done: true },
                    { text: 'Update paths in agent-manager-dashboard', done: true }
                ]
            }
        ]
    },
    {
        id: 'mission-control',
        name: 'Mission Control Center',
        icon: '🎛️',
        color: '#a78bfa',
        workspacePath: `${AG_ROOT}/Mission Control Center`,
        thumbnail: 'thumbnails/thumb_mission_control.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['HTML/CSS/JS', 'hash-router', 'localStorage', 'Chat System'],
        description: 'Full CMS and workspace management platform — chat bubbles, people/teams, feedback, file manager, marketing website',
        previewFiles: [
            { label: 'CMS App', path: `${AG_ROOT}/Mission Control Center/index.html` },
            { label: 'Marketing Site', path: `${AG_ROOT}/Mission Control Center/public/website/index.html` }
        ],
        threads: [
            {
                id: '9a07c809',
                fullId: '9a07c809-625a-4984-aad5-4eda5cb7404c',
                title: 'Documentation & Feature Build',
                status: 'complete',
                intent: 'Build 6 major features transforming the Nexus Command Center into a full CMS: chat bubble system, people/team management, interactive overview with feedback, file/folder CMS, task delegation workflow, and route integration.',
                whatWorked: [
                    'Facebook-style minimized chat tray + Android-style draggable bubbles, persists across navigation',
                    'Combined human + AI roster with many-to-many team relationships',
                    'Action items with inline response forms, auto-queued feedback for Antigravity',
                    'Visual file browser with tree explorer, breadcrumbs, grid/list toggle, search',
                    'All 8 sidebar routes working with hash-based router, no console errors'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'chat-system.js', desc: 'Floating chat widget engine' },
                    { name: 'chat-bubbles.css', desc: 'Chat styling' },
                    { name: 'people.js', desc: 'Combined human + AI roster' },
                    { name: 'teams.js', desc: 'Team composition view' },
                    { name: 'mission-control.js', desc: 'Interactive overview + feedback' },
                    { name: 'feedback-store.js', desc: 'localStorage feedback persistence' },
                    { name: 'file-manager.js', desc: 'Tree view + preview pane' },
                    { name: 'delegate-to-claude-code.md', desc: 'Task delegation workflow' }
                ],
                nextSteps: [
                    'Connect feedback system to real AI agent processing',
                    'Add file upload/download capabilities to file manager',
                    'Build documentation/changelog auto-capture system'
                ],
                tasks: [
                    { text: 'Chat Bubble System — floating widget, minimized tray, drag-as-bubble', done: true },
                    { text: 'People & Team Management — cards, filter tabs, many-to-many', done: true },
                    { text: 'Interactive Overview & Feedback System — action items, auto-queue', done: true },
                    { text: 'File/Folder Management CMS — tree, breadcrumbs, grid/list, search', done: true },
                    { text: 'Task Delegation Workflow — Claude Code integration', done: true },
                    { text: 'Route Wiring & Polish — all routes, breadcrumbs, verification', done: true }
                ]
            },
            {
                id: 'a0b97233',
                fullId: 'a0b97233-6687-4608-86e2-5d826b78b504',
                title: 'Marketing Website',
                status: 'complete',
                intent: 'Build a high-converting marketing landing page with 9 sections: hero, social proof, features, competitive comparison, migration tool, savings calculator, pricing, CTA, and footer.',
                whatWorked: [
                    'Animated gradient headline with stat counters and floating particles',
                    'Tool replacement bar showing tools Mission Control replaces',
                    '6 glassmorphism feature cards with hover animations',
                    'Interactive subscription savings slider',
                    '3-tier pricing that shows massive value ($12/mo replaces $200+in tools)',
                    'All sections verified beautiful in browser'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'index.html', desc: 'Full marketing page — 9 sections' },
                    { name: 'styles.css', desc: 'Design system, glassmorphism, animations' },
                    { name: 'script.js', desc: 'Scroll reveal, particles, counters, savings calc' }
                ],
                nextSteps: [
                    'Connect to real backend for signups',
                    'Add analytics tracking',
                    'A/B test hero copy variations'
                ],
                tasks: [
                    { text: 'Create styles.css — design system and all section styles', done: true },
                    { text: 'Create script.js — scroll reveal, particles, calculators', done: true },
                    { text: 'Create index.html — all 9 sections', done: true },
                    { text: 'Visual review in browser — all sections confirmed', done: true }
                ]
            },
            {
                id: '46f68c6a',
                fullId: '46f68c6a-dcb7-47dd-b1b4-82f64acea4b8',
                title: 'AI Thumbnails & Credit Tracking',
                status: 'complete',
                intent: 'Generate 16 AI images (6 agent portraits, 5 project thumbnails, 5 demo previews) and implement a credit tracking system with budget monitoring.',
                whatWorked: [
                    '16 AI-generated images load correctly across all views',
                    'Agent cards now feature full-width cyberpunk portrait banners',
                    'Credit counter shows "$373 left" in topbar',
                    'Credit Usage panel with budget bar and category breakdown',
                    'Demo Gallery hover effects with image zoom'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'state.js', desc: 'Image paths + creditTracker data model' },
                    { name: 'main.js', desc: 'Credit counter badge in topbar' },
                    { name: 'agent-fleet.js', desc: 'Full-width portrait banner cards' },
                    { name: 'project-hub.js', desc: 'Scene thumbnails + team portraits' },
                    { name: 'demo-gallery.js', desc: 'Preview images with hover zoom' },
                    { name: 'mission-control.js', desc: 'Portrait avatars, credit usage panel' }
                ],
                nextSteps: [
                    'Auto-generate imagery when new agents/tasks/projects are created',
                    'Partial updates via image-to-image models',
                    'Model selection: fast models for thumbnails, pro for hero images',
                    'Per-user budget controls and cost caps'
                ],
                tasks: [
                    { text: 'Generate agent character portraits (6 agents)', done: true },
                    { text: 'Generate project thumbnails (5 projects)', done: true },
                    { text: 'Generate demo gallery preview images (5 demos)', done: true },
                    { text: 'Update state.js with image paths', done: true },
                    { text: 'Rewrite Agent Fleet — full-width portrait banners', done: true },
                    { text: 'Credit counter badge + Usage panel in Mission Control', done: true }
                ]
            }
        ]
    },
    {
        id: 'ai-autopilot',
        name: 'AI Autopilot / Stream Deck',
        icon: '🎮',
        color: '#f59e0b',
        workspacePath: `${AG_ROOT}/Stream Deck Project/_project.streamdeck-ai`,
        thumbnail: 'thumbnails/thumb_ai_autopilot.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Stream Deck SDK', 'Rollup', 'TypeScript', 'Stripe', 'WebSocket'],
        description: 'Stream Deck AI Autopilot plugin, marketing website with Style Lab, and tool-specific icon packs',
        previewFiles: [
            { label: 'Website', path: `${AG_ROOT}/Stream Deck Project/_project.streamdeck-ai/packages/website/index.html` },
            { label: 'Wispr Alternative', path: `${AG_ROOT}/Stream Deck Project/_project.streamdeck-ai/packages/website/wispr-alternative.html` }
        ],
        threads: [
            {
                id: '253f9fdd',
                fullId: '253f9fdd-8ee7-4f77-a7f3-908cf37d4a21',
                title: 'Full Platform Build',
                status: 'complete',
                intent: 'Build the complete AI Autopilot platform: self-contained Stream Deck plugin with context detection, a marketing website with AI Style Lab (8 themes), device shop, Wispr Flow comparison page, and Stripe billing.',
                whatWorked: [
                    'Plugin with shared types, ergonomics, shortcuts running in Stream Deck',
                    'Context Agent (macOS detection, WebSocket) on ws://localhost:9876',
                    'Website with animated 8×4 deck grid, 8 interactive themes, accessibility bar',
                    'Device Shop with 8 products and affiliate links',
                    'Credit-based pricing (Starter 50/Pro 500/Lifetime 200 + BYOK)',
                    'Wispr Flow alternative page with live transcription demo and comparison table'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'index.html', desc: 'Main page with all sections' },
                    { name: 'styles.css', desc: 'Complete design system' },
                    { name: 'script.js', desc: 'Theme switching, animations' },
                    { name: 'stripe-config.js', desc: 'Stripe product/credit config' },
                    { name: 'wispr-alternative.html', desc: 'Wispr Flow comparison page' }
                ],
                nextSteps: [
                    'Real Stripe integration (backend checkout sessions)',
                    'AI image generation API endpoint',
                    'Community shortcut knowledge base backend',
                    'Production deployment'
                ],
                tasks: [
                    { text: 'Self-contained plugin with shared types, ergonomics, shortcuts', done: true },
                    { text: 'Context Agent (macOS detection, WebSocket)', done: true },
                    { text: 'Website Phase 1 — Hero, features, pricing, training, CTA', done: true },
                    { text: 'Website Phase 2 — Style Lab, themes, device shop, Wispr page', done: true },
                    { text: 'Stripe billing configuration', done: true }
                ]
            },
            {
                id: '9b0a0880',
                fullId: '9b0a0880-0ddf-478e-aca5-56963bae0972',
                title: 'Profile Automation',
                status: 'partial',
                intent: 'Create pre-built Stream Deck profiles for all device types (XL 32-slot, Standard 15-slot, Mini 6-slot, Plus 8-slot) that auto-install when the plugin is loaded.',
                whatWorked: [
                    '4 device profiles generated with correct grid mappings',
                    'Manifest updated with DontAutoSwitchWhenInstalled: false for auto-install',
                    'Plugin compiles via Rollup → bin/plugin.js',
                    'TypeScript type issues fixed for SDK compatibility'
                ],
                whatDidnt: [
                    'Context agent build not yet verified',
                    'Manual verification with real Stream Deck hardware pending'
                ],
                outputs: [
                    { name: 'AI Autopilot.streamDeckProfile', desc: 'XL — 8×4 — 32 slots' },
                    { name: 'AI Autopilot SD.streamDeckProfile', desc: 'Standard — 5×3 — 15 slots' },
                    { name: 'AI Autopilot Mini.streamDeckProfile', desc: 'Mini — 3×2 — 6 slots' },
                    { name: 'AI Autopilot Plus.streamDeckProfile', desc: 'Plus — 4×2 — 8 slots' },
                    { name: 'manifest.json', desc: 'Registered all 4 profiles' }
                ],
                nextSteps: [
                    'Build the context-agent',
                    'Start context-agent and plugin via the build workflow',
                    'Confirm profile appears in Stream Deck app',
                    'Test dynamic button updates when switching apps'
                ],
                tasks: [
                    { text: 'Generate profiles for all device types', done: true },
                    { text: 'Update manifest.json with profile registration', done: true },
                    { text: 'Build and verify plugin compilation', done: true },
                    { text: 'Build the context-agent', done: false },
                    { text: 'Manual verification with hardware', done: false }
                ]
            }
        ]
    },
    {
        id: 'media-engine',
        name: 'Media Engine',
        icon: '🎬',
        color: '#ec4899',
        workspacePath: `${AG_ROOT}/Media Engine`,
        thumbnail: 'thumbnails/thumb_media_engine.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Vite', 'AI Image Gen', '3D Characters', 'Marketing'],
        description: 'AI-powered social media content factory — marketing website with 3D characters and competitive positioning',
        previewFiles: [
            { label: 'Marketing Site', path: `${AG_ROOT}/Media Engine/index.html` }
        ],
        threads: [
            {
                id: 'a48e6dd6',
                fullId: 'a48e6dd6-d80a-48f3-abf8-9c964b3bd829',
                title: 'Marketing Website Build',
                status: 'partial',
                intent: 'Build a high-converting marketing website for the Media Engine product — a content factory that automates social media creation. Includes competitive research, brand characters, pricing, and interactive sections.',
                whatWorked: [
                    'Vite project initialized with full design system',
                    'Hero section with video/animation built',
                    '"Problem → Solution" narrative and feature showcase with factory/conveyor belt metaphor',
                    'Competitive comparison table (vs Buffer, Hootsuite, Later, etc.)',
                    'Tool savings calculator and tiered pricing',
                    '3D-style brand characters generated (Salesforce-inspired)'
                ],
                whatDidnt: [
                    'Video generation for key sections not yet completed',
                    'Responsive polish still in progress'
                ],
                outputs: [
                    { name: 'Vite project', desc: 'Full marketing site in Media Engine/' },
                    { name: 'Brand characters', desc: '3D-style, friendly illustrations' },
                    { name: 'Process visuals', desc: 'Content factory, assembly line images' }
                ],
                nextSteps: [
                    'Generate up to 10 videos for key website sections',
                    'Polish animations and responsive design',
                    'Define multi-agent factory pipeline architecture',
                    'Map API integrations (social platforms, scheduling)',
                    'Design dashboard / mission control for logged-in users'
                ],
                tasks: [
                    { text: 'Research competitors and pricing models', done: true },
                    { text: 'Initialize Vite project with design system', done: true },
                    { text: 'Build all website sections (hero through footer)', done: true },
                    { text: 'Generate brand characters and process visuals', done: true },
                    { text: 'Generate videos for key sections', done: false },
                    { text: 'Polish responsive design', done: 'progress' },
                    { text: 'Define product architecture', done: false },
                    { text: 'Design user dashboard', done: false }
                ]
            }
        ]
    },
    {
        id: 'lovart',
        name: 'LovArt',
        icon: '🎨',
        color: '#f97316',
        workspacePath: `${AG_ROOT}/Scraper/LovArt`,
        thumbnail: 'thumbnails/thumb_lovart.png',
        vercel: { url: 'https://anti-gravity-lake.vercel.app', status: 'live' },
        tags: ['React', 'Vercel', 'API Scraping', 'Deep Traversal'],
        description: 'AI art platform explorer — media counting fix and generated vs. researched asset separation',
        previewFiles: [
            { label: 'Scraper App', path: `${AG_ROOT}/Scraper/LovArt/scraping-from-loveart/index.html` }
        ],
        threads: [
            {
                id: 'd6107437',
                fullId: 'd6107437-6b25-435a-b1f9-2d012f2d3da1',
                title: 'Media Counting Fix & Explorer',
                status: 'complete',
                intent: 'Debug LovArt API responses to fix missing images and separate generated from researched media. Implement deep traversal of sub_agent_info.history to find all generated images.',
                whatWorked: [
                    'Discovered images were hidden inside sub_agent_info.history — deeply nested arrays',
                    'Used source field to distinguish generated vs researched assets',
                    'Deep recursive traversal finds ALL generated images',
                    '3 media categories: Generated (✨), Researched (🔍), References (📎)',
                    'Smart filter hiding for empty categories',
                    'Deployed to Vercel at anti-gravity-lake.vercel.app'
                ],
                whatDidnt: [
                    'Initial 401 error from API token issue — needed env setup fix'
                ],
                outputs: [
                    { name: 'MessageBlock.jsx', desc: 'Deep traversal + 3-category media separation' },
                    { name: 'ChatHistory.jsx', desc: 'Updated filters + summary badges' }
                ],
                nextSteps: [
                    'Explore additional media types (3D, PDF, HTML)',
                    'Add video autoplay on hover',
                    'Add 3D file embedded viewer'
                ],
                tasks: [
                    { text: 'Analyze data structures for chat messages', done: true },
                    { text: 'Deep traversal of sub_agent_info.history', done: true },
                    { text: 'Implement 3 media categories with filtering', done: true },
                    { text: 'Apply premium styling (dark mode, glassmorphism, animations)', done: true },
                    { text: 'Run dev server and verify rendering', done: true },
                    { text: 'Test filtering functionality', done: true }
                ]
            }
        ]
    },
    {
        id: 'holodeck',
        name: 'HolodeckOS',
        icon: '🕳️',
        color: '#06b6d4',
        workspacePath: `${AG_ROOT}/Higgsfield`,
        thumbnail: 'thumbnails/thumb_holodeck.png',
        vercel: { url: 'https://ag.holodeckos.com', status: 'error' },
        tags: ['Three.js', 'WebGL', 'Scroll Animation'],
        description: 'Three.js portal hero section with animated mannequin and scroll-through effect. (Deployed domain returning 404)',
        previewFiles: [
            { label: 'Portal Hero', path: `${AG_ROOT}/Higgsfield/index.html` }
        ],
        threads: [
            {
                id: '6d479cb1',
                fullId: '6d479cb1-d992-4f52-9b2e-31b2bb57a73c',
                title: 'Portal Hero Section',
                status: 'complete',
                intent: 'Build a 3D hero section with a wooden mannequin gesturing toward a glowing neon portal, with a scroll-through zoom effect that reveals the main content.',
                whatWorked: [
                    'Three.js articulated mannequin with idle breathing/wave animation',
                    'Glowing neon portal with conic-gradient ring (cyan ↔ magenta) and pulsing glow',
                    'Scroll-through effect zooms into portal, fades hero, reveals Section 2',
                    '6 feature cards (AI Agents, AntiGravity Workspace, Connected People, etc.)',
                    'Responsive layout for mobile'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'index.html', desc: 'Three.js mannequin, portal, scroll effect, feature cards' }
                ],
                nextSteps: [
                    'Fix Vercel 404 deployment error for ag.holodeckos.com',
                    'Add more content sections below the hero',
                    'Implement interactive portal interactions',
                    'Add character animations and expressions'
                ],
                tasks: [
                    { text: 'Plan the hero section architecture', done: true },
                    { text: 'Build index.html with Three.js mannequin, portal, scroll effect', done: true },
                    { text: 'Verify in browser', done: true },
                    { text: 'Create walkthrough', done: true }
                ]
            }
        ]
    },
    {
        id: 'swiperate',
        name: 'SwipeRate',
        icon: '👇',
        color: '#ff4b4b',
        workspacePath: `${AG_ROOT}/Utilities/SwipeRate`,
        thumbnail: 'thumbnails/thumb_swiperate.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Drag Engine', 'Rating System', 'Multi-user', 'JavaScript'],
        description: 'Tinder-style swipe left/right rating system with multi-dimensional sorting and tagging',
        previewFiles: [
            { label: 'Main App', path: `${AG_ROOT}/Utilities/SwipeRate/app/index.html` }
        ],
        threads: [
            {
                id: '1cf0d0e4',
                fullId: '1cf0d0e4-0a54-4031-b64f-bb772d467b44',
                title: 'SwipeRate Utilities Planning',
                status: 'partial',
                intent: 'Plan and outline the core functionality for an upgraded swipe rating system with XY/XYZ coordinate sorting, multi-user support, and demo apps.',
                whatWorked: [
                    'Detailed implementation plan created',
                    'Core file-adapters, drag-engine, and rating-resolver structure established'
                ],
                whatDidnt: [
                    'Fully building out the demo apps not yet complete'
                ],
                outputs: [
                    { name: 'implementation_plan.md', desc: 'Comprehensive feature roadmap' },
                    { name: 'app/core/drag-engine.js', desc: 'Drag interactions' }
                ],
                nextSteps: [
                    'Build Dating App demo',
                    'Build Multi-file rater demo',
                    'Implement precise XYZ tracking'
                ],
                tasks: [
                    { text: 'Outline architecture', done: true },
                    { text: 'Scaffold project structure', done: true },
                    { text: 'Implement drag engine mechanics', done: 'progress' },
                    { text: 'Verify demos', done: false }
                ]
            }
        ]
    },
    {
        id: 'noahos',
        name: 'NoahOS Wiki',
        icon: '🧠',
        color: '#60a5fa',
        workspacePath: `${AG_ROOT}/Case Studies/NoahOS`,
        thumbnail: 'thumbnails/thumb_noahos.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Wiki', 'Documentation', 'Character Design'],
        description: 'AntiGravity documentation wiki featuring Noah\'s training manual alongside official Google docs',
        previewFiles: [
            { label: 'Wiki Home', path: `${AG_ROOT}/Case Studies/NoahOS/index.html` }
        ],
        threads: [
            {
                id: '83d217d2',
                fullId: '83d217d2-399a-49a3-851b-028f121672f5',
                title: 'Building AntiGravity Wiki',
                status: 'partial',
                intent: 'Create a wiki structure for AntiGravity docs featuring a left-hand nav and side-by-side comparison between Google docs and Noah\'s style.',
                whatWorked: [
                    'Wiki layout initialized',
                    'Basic responsive sidebar'
                ],
                whatDidnt: [
                    'Content integration fully not completed'
                ],
                outputs: [
                    { name: 'index.html', desc: 'Wiki layout structure' }
                ],
                nextSteps: [
                    'Integrate scraped google doc content',
                    'Implement the side-by-side comparison pane'
                ],
                tasks: [
                    { text: 'Implement wiki interface', done: true },
                    { text: 'Integrate scraped content', done: 'progress' },
                    { text: 'Side-by-side comparison', done: false },
                    { text: 'Push to GitHub', done: false }
                ]
            }
        ]
    },
    {
        id: 'docs-3d',
        name: '3D Gamified Docs',
        icon: '📚',
        color: '#f43f5e',
        workspacePath: `${AG_ROOT}/Media Engine/antigravity-docs`,
        thumbnail: 'thumbnails/thumb_docs_3d.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Vite', '3D Visuals', 'Multi-device'],
        description: 'Self-contained documentation website with 3D gamified visuals, consistent character design, and multi-device showcase',
        previewFiles: [
            { label: 'Docs Site', path: `${AG_ROOT}/Media Engine/antigravity-docs/index.html` }
        ],
        threads: [
            {
                id: '1898ea7a',
                fullId: '1898ea7a-57b2-4eed-b196-8dc765223f45',
                title: 'Docs Website',
                status: 'stalled',
                intent: 'Create a full documentation website for AntiGravity with 3D gamified visuals, a consistent character (young girl with brown bob, purple/green outfit, green frog companion), Holodeck OS landing page, and multi-device showcase section.',
                whatWorked: [
                    'Initial research and content extraction from docs started'
                ],
                whatDidnt: [
                    'Only Phase 1 partially started — research began but no implementation',
                    'Character design analysis not completed',
                    'No code written — Phases 2-7 completely untouched'
                ],
                outputs: [],
                nextSteps: [
                    'Complete character design analysis from reference images',
                    'Create full implementation plan with docs structure',
                    'Generate character turnaround sheet and style guide',
                    'Initialize Vite project',
                    'Build Holodeck OS landing page',
                    'Build documentation pages with visuals',
                    'Build multi-device showcase'
                ],
                tasks: [
                    { text: 'Extract all docs content from antigravity.google/docs', done: 'progress' },
                    { text: 'Analyze character design from reference images', done: false },
                    { text: 'Create implementation plan', done: false },
                    { text: 'Generate character turnaround sheet', done: false },
                    { text: 'Initialize Vite project', done: false },
                    { text: 'Build Holodeck OS landing page', done: false },
                    { text: 'Build documentation pages', done: false },
                    { text: 'Build multi-device showcase', done: false }
                ]
            }
        ]
    },
    {
        id: 'annotation-studio',
        name: 'Annotation Studio',
        icon: '✍️',
        color: '#14b8a6',
        workspacePath: `${AG_ROOT}/Utilities/Annotation Studio`,
        thumbnail: 'thumbnails/thumb_utility.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['JavaScript'],
        description: 'Image and document annotation utility application',
        previewFiles: [],
        threads: []
    },
    {
        id: 'utility',
        name: 'Dashboard Meta & Setup',
        icon: '🔧',
        color: '#64748b',
        workspacePath: `${AG_ROOT}/Utilities`,
        thumbnail: 'thumbnails/thumb_docs_3d.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Vanilla JS', 'Agent Management', 'CSS'],
        description: 'Agent Manager Dashboard tracking and configuration projects',
        previewFiles: [
            { label: 'Dashboard', path: `${AG_ROOT}/Utilities/agent-manager-dashboard/index.html` }
        ],
        threads: [
            {
                id: '118a7bd4',
                fullId: '118a7bd4-a6ba-4911-9f74-978664c4b1c4',
                title: 'Updating Agent Manager Dashboard',
                status: 'complete',
                intent: 'Update the dashboard with new data model, previewable links, metrics, and ensure responsive beautiful UI structure.',
                whatWorked: [
                    'Full re-structure of script.js to modular data components',
                    'Added responsive styling, view modes, and progress tracks'
                ],
                whatDidnt: [],
                outputs: [
                    { name: 'script.js', desc: 'Render engine + data' },
                    { name: 'styles.css', desc: 'Styling' }
                ],
                nextSteps: [
                    'Further integration of Vercel tracking',
                    'Feedback logic completion'
                ],
                tasks: [
                    { text: 'Add styling', done: true },
                    { text: 'Refactor data engine', done: true },
                    { text: 'Deploy', done: true }
                ]
            }
        ]
    },
    {
        id: 'game-engine',
        name: 'GameEngine',
        icon: '🎮',
        color: '#0f3460',
        workspacePath: `${AG_ROOT}/Utilities/GameEngine`,
        thumbnail: 'thumbnails/thumb_game_engine.png',
        vercel: { url: null, status: 'not-deployed' },
        tags: ['Node.js', 'Three.js', 'SpaceML', 'Spatial Computing'],
        description: 'Modular spatial computing engine — World, Senses, Foundation, SpaceML parser, Life system, and device integrations',
        previewFiles: [],
        threads: []
    }
];
