// This file contains the registry of all applications in the AntiGravity system.
window.AG_PROJECTS = [
    // ─── Case Studies ───
    {
        id: "noahos",
        name: "NoahOS Wiki",
        category: "Case Studies",
        description: "An advanced modular OS interface, AI workspace, and AntiGravity documentation wiki.",
        localPath: "Case Studies/NoahOS/index.html",
        subdomain: "noahos",
        vercelUrl: "https://noahos.vercel.app",
        status: "live",
        tech: ["HTML", "JS", "CSS", "Wiki"],
        color: "linear-gradient(135deg, #0e2041, #1e4585)"
    },
    {
        id: "aluzina",
        name: "Aluzina Explorer",
        category: "Case Studies",
        description: "Standalone HTML UI integrating the LovArt Scraper API.",
        localPath: "Case Studies/Aluzina/index.html",
        subdomain: "aluzina",
        vercelUrl: "https://aluzina.vercel.app",
        status: "development",
        tech: ["HTML", "JS", "API"],
        color: "linear-gradient(135deg, #4b1248, #F0C27B)"
    },
    {
        id: "garfield",
        name: "Garfield",
        category: "Case Studies",
        description: "Project Garfield architecture and static site.",
        localPath: "Case Studies/Garfield/index.html",
        subdomain: "garfield",
        vercelUrl: "https://garfield-ten.vercel.app",
        status: "configured",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #FF512F, #DD2476)"
    },

    // ─── Utilities ───
    {
        id: "media-engine",
        name: "Media Engine",
        category: "Utilities",
        description: "AI-powered content factory — marketing website with 3D characters, pricing, and competitive positioning.",
        localPath: "Utilities/contentengine/index.html",
        subdomain: "contentengine",
        vercelUrl: "https://media-engine-zeta.vercel.app",
        status: "live",
        tech: ["Vite", "AI Image Gen", "3D Characters"],
        color: "linear-gradient(135deg, #11998e, #38ef7d)"
    },
    {
        id: "swiperate",
        name: "SwipeRate",
        category: "Utilities",
        description: "XY/XYZ rating tool with swipe gestures, drag engine, and multi-user annotation support.",
        localPath: "Utilities/SwipeRate/index.html",
        subdomain: "swiperate",
        vercelUrl: "https://swiperate.vercel.app",
        status: "live",
        tech: ["HTML", "JS", "Drag Engine"],
        color: "linear-gradient(135deg, #fc4a1a, #f7b733)"
    },
    {
        id: "agent-manager",
        name: "Agent Manager Dashboard",
        category: "Utilities",
        description: "Track all AI agent conversations, workspace statuses, and project threads.",
        localPath: "Utilities/agent-manager-dashboard/index.html",
        subdomain: "agent-dashboard",
        vercelUrl: "https://agent-dashboard-ochre-eight.vercel.app",
        status: "live",
        tech: ["HTML", "JS", "CSS"],
        color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
        id: "mission-control",
        name: "Mission Control Center",
        category: "Utilities",
        description: "Full CMS platform — chat system, people/teams, feedback, file manager, and marketing website.",
        localPath: "Utilities/Mission Control Center/index.html",
        subdomain: "mission-control",
        vercelUrl: "https://mission-control-jmassions-projects.vercel.app",
        status: "configured",
        tech: ["HTML", "JS", "Chat System", "localStorage"],
        color: "linear-gradient(135deg, #2b5876, #4e4376)"
    },
    {
        id: "browser",
        name: "TabSpace — WebBrowser",
        category: "Utilities",
        description: "Multiplayer browser with CDP streaming, 3D sphere view, 8 view modes, and agent orchestration.",
        localPath: "Utilities/WebBrowser/index.html",
        subdomain: "browser",
        vercelUrl: "",
        status: "development",
        tech: ["Three.js", "WebSocket", "CDP", "Playwright"],
        color: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
    },
    {
        id: "streamdeck",
        name: "AI Autopilot — Stream Deck",
        category: "Utilities",
        description: "Stream Deck plugin with context detection, AI Style Lab, device shop, and Stripe billing.",
        localPath: "Utilities/Stream Deck Project/_project.streamdeck-ai/packages/website/index.html",
        subdomain: "streamdeck",
        vercelUrl: "",
        status: "development",
        tech: ["Stream Deck SDK", "Rollup", "TypeScript", "Stripe"],
        color: "linear-gradient(135deg, #000000, #434343)"
    },
    {
        id: "game-engine",
        name: "GameEngine",
        category: "Utilities",
        description: "Modular spatial computing engine with World, Senses, SpaceML, Foundation, and Life systems.",
        localPath: "Utilities/GameEngine/index.js",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["Node.js", "Three.js", "SpaceML"],
        color: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)"
    },

    // ─── Scraper ───
    {
        id: "lovart-explorer",
        name: "LovArt Explorer",
        category: "Scraper",
        description: "Deep-traversal art platform explorer with 3-category media separation. Deployed on Vercel.",
        localPath: "Scraper/LovArt/scraping-from-loveart/index.html",
        subdomain: "lovart",
        vercelUrl: "https://anti-gravity-lake.vercel.app",
        status: "live",
        tech: ["Vite", "React", "API Scraping"],
        color: "linear-gradient(135deg, #8A2387, #E94057, #F27121)"
    },
    {
        id: "higgsfield",
        name: "Higgsfield Scraper",
        category: "Scraper",
        description: "Data scraping scripts and visual output for the Higgsfield project.",
        localPath: "Scraper/Higgsfield/index.html",
        subdomain: "higgsfield",
        vercelUrl: "",
        status: "configured",
        tech: ["HTML", "JS"],
        color: "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)"
    },
    {
        id: "air-ui-study",
        name: "Air UI — Asset Library",
        category: "Scraper",
        description: "High-fidelity Air.inc DAM browser rebuilt from scratch — infinite scroll, filter rail, metadata panel, and full Lovart/Higgsfield provenance data.",
        localPath: "Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy/index.html",
        subdomain: "",
        vercelUrl: "https://ag.holodeckos.com/Scraper/LovartHiggsFieldAirOrganizer/AirUIStudy/",
        status: "live",
        tech: ["HTML", "Vanilla JS", "CSS", "Air API"],
        color: "linear-gradient(135deg, #1a1a2e, #16213e, #e91e8c)"
    },

    // ─── FranchiseOS ───
    {
        id: "franchiseos-hub",
        name: "FranchiseOS Hub",
        category: "FranchiseOS",
        description: "Central hub page linking all FranchiseOS franchise implementations.",
        localPath: "FranchiseOS/index.html",
        subdomain: "franchiseos",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #c94b4b, #4b134f)"
    },
    {
        id: "coplay",
        name: "CoPlay",
        category: "FranchiseOS",
        description: "FranchiseOS standard site implementation for CoPlay.",
        localPath: "FranchiseOS/CoPlay/index.html",
        subdomain: "coplay",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #1fa2ff, #12d8fa, #a6ffcb)"
    },
    {
        id: "skool",
        name: "Skool",
        category: "FranchiseOS",
        description: "FranchiseOS implementation for Skool environment.",
        localPath: "FranchiseOS/Skool/index.html",
        subdomain: "skool",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #5A3F37, #2C7744)"
    },
    {
        id: "petrock",
        name: "Petrock Hotel",
        category: "FranchiseOS",
        description: "FranchiseOS implementation for Petrock Hotel property.",
        localPath: "FranchiseOS/Petrock Hotel/index.html",
        subdomain: "petrock",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #3f2b96, #a8c0ff)"
    },
    {
        id: "barrys",
        name: "Barry's Tickets",
        category: "FranchiseOS",
        description: "FranchiseOS implementation for Barry's ticketing platform.",
        localPath: "FranchiseOS/Barry's Tickets/index.html",
        subdomain: "barrys",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #cb2d3e, #ef473a)"
    },
    {
        id: "cohost",
        name: "CoHost Company",
        category: "FranchiseOS",
        description: "FranchiseOS implementation for CoHost property management.",
        localPath: "FranchiseOS/CoHost Company/index.html",
        subdomain: "cohost",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #141E30, #243B55)"
    },
    {
        id: "kittybird",
        name: "KittyBird Blooms",
        category: "FranchiseOS",
        description: "FranchiseOS implementation for KittyBird Blooms florist.",
        localPath: "FranchiseOS/KittyBird Blooms/index.html",
        subdomain: "kittybird",
        vercelUrl: "",
        status: "not-started",
        tech: ["HTML", "CSS"],
        color: "linear-gradient(135deg, #ff6e7f, #bfe9ff)"
    },

    // ─── AgentWorld ───
    {
        id: "agentworld",
        name: "AgentWorld OS",
        category: "Utilities",
        description: "Multi-dimensional agent workspace — dockable panels, 3D solar system visualizations, mission control, device profiles, and tag-based OS folder system.",
        localPath: "AgentWorld/dist/index.html",
        subdomain: "agentworld",
        vercelUrl: "",
        status: "live",
        tech: ["React", "Three.js", "Zustand", "FlexLayout", "Vite"],
        color: "linear-gradient(135deg, #0f172a, #06b6d4)"
    },

    // ─── OS Solar System ───
    {
        id: "os-solar-system",
        name: "OS Solar System",
        category: "Utilities",
        description: "Cross-platform OS folder structure with device profiles, preferences, and control panels — the data backbone for AgentWorld.",
        localPath: "OS Solar System/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "live",
        tech: ["HTML", "JSON", "File System"],
        color: "linear-gradient(135deg, #0c0c1d, #f59e0b)"
    },

    // ─── Showcases & Prototypes ───
    {
        id: "visual-terminal",
        name: "Visual Terminal",
        category: "Showcases",
        description: "Image-first AI terminal — every response is a generated image with clickable hotspots for visual exploration. Powered by Gemini AI.",
        localPath: "playground/visual-terminal/index.html",
        subdomain: "",
        vercelUrl: "https://visual-terminal.vercel.app",
        status: "live",
        tech: ["React", "Vite", "Gemini AI", "Image Gen"],
        color: "linear-gradient(135deg, #0c0c14, #f5c542)"
    },
    {
        id: "holodeck-portal",
        name: "HolodeckOS Portal",
        category: "Showcases",
        description: "Three.js hero section with animated mannequin, neon portal, and scroll-through zoom effect.",
        localPath: "Scraper/Higgsfield/index.html",
        subdomain: "holodeckos",
        vercelUrl: "https://ag.holodeckos.com",
        status: "error",
        tech: ["Three.js", "WebGL", "Scroll Animation"],
        color: "linear-gradient(135deg, #0c0c1d, #1a1a4e, #06b6d4)"
    },
    {
        id: "immersive-gallery",
        name: "Immersive Gallery Concept",
        category: "Showcases",
        description: "Immersive 3D gallery prototype design.",
        localPath: "Demos/Immersive Gallery/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "CSS", "3D"],
        color: "linear-gradient(135deg, #FF0099, #493240)"
    },
    {
        id: "v4-3d-demo",
        name: "v4 Spatial Layout",
        category: "Showcases",
        description: "Exploration of spatial organization v4.1.",
        localPath: "Demos/v4.1-3d.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "3D"],
        color: "linear-gradient(135deg, #12c2e9, #c471ed)"
    },
    {
        id: "v5-3d-1-demo",
        name: "v5 Matrix Demo 1",
        category: "Showcases",
        description: "Exploration of spatial organization v5 config 1.",
        localPath: "Demos/v5-3d_1.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "3D"],
        color: "linear-gradient(135deg, #00C9FF, #92FE9D)"
    },
    {
        id: "v5-3d-5-demo",
        name: "v5 Matrix Demo 5",
        category: "Showcases",
        description: "Exploration of spatial organization v5 config 5.",
        localPath: "Demos/v5-3d_5.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "3D"],
        color: "linear-gradient(135deg, #f5af19, #f12711)"
    },
    {
        id: "alphaunicorn-website",
        name: "AlphaUnicorn Website",
        category: "Showcases",
        description: "Premium dark-mode single-page rebuild of the AlphaUnicorn.io brand site — VirtuOS product, venture portfolio, scroll animations, and marquee ticker.",
        localPath: "Scraper/siteground/AlphaUnicorn/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "JS", "CSS", "Scroll Animations"],
        color: "linear-gradient(135deg, #0d0d0d, #5b21b6, #c026d3)"
    },
    {
        id: "air-rebuild",
        name: "Air.inc Rebuild",
        category: "Showcases",
        description: "High-fidelity air.inc website recreation — 3D glassy logo animation, four-state theme system, scroll animations, and content.config.js for one-click branding swaps.",
        localPath: "playground/air-rebuild/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "JS", "Three.js", "CSS Themes"],
        color: "linear-gradient(135deg, #0a0a0a, #1c1c1c, #00c6ff)"
    },
    {
        id: "rive-showcase",
        name: "Rive Interactive Showcase",
        category: "Showcases",
        description: "Rive-native interactive demo — agent mission control dashboard and animated button system built entirely in Rive with programmatic state machine control.",
        localPath: "playground/rive-showcase/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "Rive", "JS", "State Machines"],
        color: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
    },
    {
        id: "void-room",
        name: "Void Room",
        category: "Showcases",
        description: "Immersive browser-based virtual room environment with device guide and spatial layout control.",
        localPath: "playground/void-room-package/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "JS", "CSS"],
        color: "linear-gradient(135deg, #000000, #0a0a0a, #1a0533)"
    },
    {
        id: "nexus-dashboard",
        name: "Nexus Dashboard v4",
        category: "Showcases",
        description: "Next-generation dashboard layout prototype — multi-panel design system with handoff rules and design tokens.",
        localPath: "playground/Root Dashboard/nexus-dashboard-v4.html",
        subdomain: "",
        vercelUrl: "",
        status: "development",
        tech: ["HTML", "CSS", "Design System"],
        color: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)"
    },

    // ─── Lessons ───
    {
        id: "lessons-dashboard",
        name: "AG Lessons",
        category: "Utilities",
        description: "Interactive knowledge dashboard — learn AI agent concepts stripped of jargon, with visual diagrams and progress tracking.",
        localPath: "lessons/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "live",
        tech: ["HTML", "JS", "CSS", "localStorage"],
        color: "linear-gradient(135deg, #667eea, #38ef7d)"
    },

    // ─── MCP / Infrastructure ───
    {
        id: "vercel-dashboard",
        name: "Vercel MCP Dashboard",
        category: "MCP",
        description: "Vercel deployment mapping and project-to-domain tracker.",
        localPath: "MCP/Vercel/index.html",
        subdomain: "",
        vercelUrl: "",
        status: "configured",
        tech: ["HTML", "JS", "Vercel SDK"],
        color: "linear-gradient(135deg, #232526, #414345)"
    }
];
