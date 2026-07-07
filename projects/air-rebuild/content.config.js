/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  CONTENT CONFIG — Edit this file to swap ALL site content    ║
 * ║  Everything from text to colors to the 3D logo lives here.  ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 *  🔄 TO SWAP THE 3D LOGO:
 *     1. Replace the "logoText" value below, OR
 *     2. Set "logoModelUrl" to a .glb/.gltf file path for a custom 3D model
 *     3. The CSS-based text logo in the nav uses "brandName"
 *
 *  🎨 TO CHANGE THEMES:
 *     Edit the "themes" object — each key is a theme with full color control
 *
 *  📝 TO CHANGE COPY:
 *     Edit hero, sections, features, clients, footer, etc. below
 */

const CONTENT = {

  // ─── BRAND ─────────────────────────────────────────────────
  brand: {
    name: "Air",                          // Shows in nav & footer
    logoText: "Air",                      // The 3D animated text in the hero
    logoModelUrl: null,                   // Set to a .glb URL to use a 3D model instead of text
    logoFont: "'Pacifico', cursive",      // Google Font for the script logo
    tagline: "Creative Operations platform",
    metaDescription: "Organize. Approve. Multiply. Air is the place where creative teams organize their work.",
  },

  // ─── NAVIGATION ────────────────────────────────────────────
  nav: {
    ctaText: "Start for free",
    ctaUrl: "#signup",
    menuItems: [
      { label: "Features", url: "#features", hasDropdown: true },
      { label: "Solutions", url: "#solutions", hasDropdown: true },
      { label: "Pricing", url: "#pricing" },
      { label: "Resources", url: "#resources" },
      { label: "About", url: "#about" },
    ],
    secondaryLinks: [
      { label: "Login", url: "#login" },
      { label: "Book a demo", url: "#demo" },
    ],
  },

  // ─── HERO ──────────────────────────────────────────────────
  hero: {
    headingLine1: "Human creativity.",
    headingLine2: "AI scale.",                // Renders in italic/cursive
    ctaText: "Get some Air",
    ctaUrl: "#demo",
  },

  // ─── SOCIAL PROOF / CLIENT LOGOS ───────────────────────────
  socialProof: {
    headline: "Supporting creative ops for *real* creatives",
    clients: [
      "Google", "Warby Parker", "RCA", "Perplexity",
      "Broncos", "Sweetgreen", "Harvey", "James Beard Foundation"
    ],
  },

  // ─── BIG TYPOGRAPHY SECTIONS (scroll-triggered) ────────────
  bigSections: [
    {
      title: "MAKE IT\nONCE. RUN IT\nEVERYWHERE.",
      subtitle: "Take any approved asset and multiply it. Resize, reformat, adapt for any channel.",
    },
  ],

  // ─── PILLAR SECTIONS (Organize / Approve / Multiply) ──────
  pillars: [
    {
      title: "Organize",
      description: "Bring all your creative into one place. The AI-native platform auto-tags, structures, and makes everything instantly findable.",
      gradient: "linear-gradient(180deg, #c9b8f0 0%, #f0d4c0 100%)",
    },
    {
      title: "Approve",
      description: "Review, give feedback right on the work, stack versions, and move forward. Air remembers what's current and what's approved.",
      gradient: "linear-gradient(180deg, #b8d4f0 0%, #f0c0d4 100%)",
    },
    {
      title: "Multiply",
      description: "Turn one approved asset into hundreds of deliverables in minutes. Resize, reformat, adapt, and create variants for every channel.",
      gradient: "linear-gradient(180deg, #f0d4b8 0%, #c0d4f0 100%)",
    },
  ],

  // ─── FEATURE CARDS ─────────────────────────────────────────
  features: [
    {
      icon: "🔍",
      title: "Conversational Search",
      description: "Find anything. Even if you don't know what it's called. Search by color, object, face, or however you remember it.",
    },
    {
      icon: "🎨",
      title: "Canvas",
      description: "Make it once. Run it everywhere. Take any approved asset and multiply it across channels.",
    },
    {
      icon: "✅",
      title: "Reviews & Approvals",
      description: "Pin comments directly to images or video timelines, track status in a Kanban board.",
    },
    {
      icon: "🧠",
      title: "Creative Intelligence",
      description: "Every asset becomes searchable the moment it lands. Air auto-generates tags, summaries, and chapters.",
    },
    {
      icon: "📁",
      title: "Libraries",
      description: "Organize your creative into flexible, access-controlled spaces by brand, campaign, or whatever works.",
    },
    {
      icon: "💻",
      title: "Desktop Sync",
      description: "Sync Air to your computer for instant access to assets. Open files in your creative tools.",
    },
    {
      icon: "📤",
      title: "Content Collection",
      description: "Collect photos, videos, and files from photographers, partners, or clients with a simple upload form.",
    },
  ],

  // ─── AI MODELS SECTION ─────────────────────────────────────
  aiSection: {
    heading: "One plan. Every model.",
    subheading: "Whatever the work calls for, it's in.",
    description: "Access 50+ models without extra subscriptions. Use them in Air Canvas to multiply your creative across every channel.",
    ctaText: "Try Canvas",
    ctaUrl: "#signup",
  },

  // ─── CTA / DEMO SECTION ───────────────────────────────────
  ctaSection: {
    heading: "Air unblocks creativity at scale.",
    description: "Organize your work, approve what matters, and multiply it across every channel. All in one place.",
    ctaText: "Book a demo",
    ctaUrl: "#demo",
  },

  // ─── FOOTER ────────────────────────────────────────────────
  footer: {
    links: [
      { label: "Pricing", url: "#pricing" },
      { label: "Resources", url: "#resources" },
      { label: "About", url: "#about" },
      { label: "Careers", url: "#careers" },
      { label: "Terms", url: "#terms" },
      { label: "Status", url: "#status" },
      { label: "Help Center", url: "#help" },
    ],
    copyright: "Air Inc. ©2026 All rights reserved",
  },

  // ─── THEMES ────────────────────────────────────────────────
  // Each theme controls the full gradient + UI colors.
  // The sky gradient is the main visual — it transitions between themes.
  themes: {
    sunrise: {
      label: "Sunrise",
      icon: "✦",
      sky: "linear-gradient(180deg, #a78bfa 0%, #c4b5fd 25%, #ddd6fe 40%, #fde68a 70%, #fed7aa 100%)",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.8)",
      navBg: "rgba(255,255,255,0.08)",
      cardBg: "rgba(255,255,255,0.12)",
      accent: "#a78bfa",
    },
    sun: {
      label: "Sun",
      icon: "☀",
      sky: "linear-gradient(180deg, #fbbf24 0%, #fde68a 30%, #fffbeb 60%, #fef3c7 100%)",
      textPrimary: "#1c1917",
      textSecondary: "rgba(28,25,23,0.7)",
      navBg: "rgba(0,0,0,0.06)",
      cardBg: "rgba(0,0,0,0.06)",
      accent: "#d97706",
    },
    sunset: {
      label: "Sunset",
      icon: "✧",
      sky: "linear-gradient(180deg, #7c3aed 0%, #c026d3 25%, #f472b6 50%, #fb923c 75%, #fbbf24 100%)",
      textPrimary: "#ffffff",
      textSecondary: "rgba(255,255,255,0.8)",
      navBg: "rgba(255,255,255,0.08)",
      cardBg: "rgba(255,255,255,0.12)",
      accent: "#c026d3",
    },
    moon: {
      label: "Moon",
      icon: "☽",
      sky: "linear-gradient(180deg, #0f0a1e 0%, #1e1145 30%, #2d1b69 50%, #1a1145 75%, #0f0a1e 100%)",
      textPrimary: "#e2e8f0",
      textSecondary: "rgba(226,232,240,0.6)",
      navBg: "rgba(255,255,255,0.05)",
      cardBg: "rgba(255,255,255,0.06)",
      accent: "#8b5cf6",
    },
  },

  // ─── 3D SCENE CONFIG ───────────────────────────────────────
  // Controls for the Three.js 3D logo scene
  scene3d: {
    cloudCount: 12,                       // Number of floating clouds
    cloudOpacity: 0.85,                   // 0-1
    logoScale: 1.0,                       // Scale multiplier for the 3D text
    logoColor: "#ffffff",                 // Base color (glass tint)
    logoOpacity: 0.4,                     // Glass transparency
    logoRoughness: 0.05,                  // Surface roughness (0 = mirror)
    logoMetalness: 0.1,                   // Metallic look
    rotationSpeed: 0.002,                 // Auto-rotation speed
    parallaxIntensity: 0.15,              // Mouse parallax strength
    scrollRotationIntensity: 0.3,         // How much scrolling rotates the logo
  },
};

// Export for use in modules
if (typeof module !== 'undefined') module.exports = CONTENT;
