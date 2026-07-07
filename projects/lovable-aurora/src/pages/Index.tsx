import { motion, useScroll, useTransform } from "framer-motion";
import { useState, Suspense, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { WorldCanvas } from "@/components/three/WorldCanvas";
import { NodeGraph } from "@/components/NodeGraph";
import { PresenceBar, PresenceCursors } from "@/components/PresenceIndicator";
import { AgentOrbitSystem } from "@/components/sections/AgentOrbitSystem";
import { CardStackShowcase } from "@/components/sections/CardStackShowcase";
import { VoiceTerminal } from "@/components/sections/VoiceTerminal";
import { MigrationSection } from "@/components/sections/MigrationSection";
import { MMODiagram } from "@/components/sections/MMODiagram";
import { TokenVisualizer } from "@/components/sections/TokenVisualizer";
import { PublishingSection } from "@/components/sections/PublishingSection";
import {
  Layers, Zap, Globe, Mic, GitBranch, Users, Box, Code2,
  ArrowRight, ChevronRight, Network, Cpu, Share2, Volume2,
  Sparkles, Radio, Database, Workflow, Hexagon, Terminal,
  Github, MessageSquare, Twitter, Check, X as XIcon
} from "lucide-react";

const LAYERS = [
  { id: "L0", title: "Design Tokens", subtitle: "Reactive Atomic System", description: "Spatial, semantic, and component tokens as live graph nodes — propagating mutations across all connected instances in real time.", icon: Hexagon, color: "hsl(var(--node-media))", tags: ["Color", "Typography", "Motion", "Haptics"] },
  { id: "L1", title: "Rust / WASM Core", subtitle: "Near-Native Runtime", description: "Scene graph, physics, state machines, and user scripts all run in sandboxed WASM — deterministic, fast, portable across every platform.", icon: Cpu, color: "hsl(var(--node-event))", tags: ["WASM", "Tauri", "CRDT", "Physics"] },
  { id: "L2", title: "3D Spatial Canvas", subtitle: "React Three Fiber World", description: "Cards in 3D space, node graphs, wireframing tools, UX flowcharts with animated bezier cables — all in one persistent 3D world.", icon: Box, color: "hsl(var(--node-spatial))", tags: ["R3F", "Three.js", "Cards", "Portals"] },
  { id: "L3", title: "MMO Multiplayer", subtitle: "Unlimited Concurrent Users", description: "Spatial sharding for MMO-scale, CRDT sync for zero conflicts, WebRTC mesh + SFU relay, and 3D presence avatars for everyone.", icon: Users, color: "hsl(var(--presence-2))", tags: ["Yjs", "WebRTC", "LiveKit", "Sharding"] },
  { id: "L4", title: "Voice Malleability", subtitle: "Every Action Addressable", description: "Voice as a first-class input: spatial, design, data, agent, and code commands — each Stack gets a persona that understands its context.", icon: Mic, color: "hsl(var(--node-agent))", tags: ["ElevenLabs", "STT", "NLP", "Personas"] },
  { id: "L5", title: "HyperTalk ∞", subtitle: "Natural Language Scripting", description: "The spiritual successor to HyperTalk — compiles to WASM, bidirectional node graph sync, AI autocomplete, plain-language mode.", icon: Terminal, color: "hsl(var(--node-data))", tags: ["WASM", "NLP", "Bidirectional", "Sandbox"] },
  { id: "L6", title: "Multi-Agent System", subtitle: "Agents as First-Class Citizens", description: "Builder, Data, Review, and Narrator agents each have a 3D presence — connected by typed ports, visible in real time as they work.", icon: Sparkles, color: "hsl(var(--node-agent))", tags: ["Agents", "LLMs", "Orchestration", "Streaming"] },
  { id: "L7", title: "Universal I/O", subtitle: "Connect Everything", description: "Airtable, Figma, Stripe, Slack, OpenAI, WebXR — every service is a connector node. Import from Notion, Miro, Rive, Spline instantly.", icon: Share2, color: "hsl(var(--node-data))", tags: ["APIs", "Migration", "Auth", "Storage"] },
  { id: "L8", title: "Platform & Marketplace", subtitle: "Build. Publish. Monetize.", description: "Any Stack becomes a PWA, desktop app, or mobile app. 70/30 marketplace split. Analytics visualized in 3D. Git-like versioning.", icon: Globe, color: "hsl(var(--node-spatial))", tags: ["PWA", "Tauri", "Marketplace", "Deploy"] },
];

const PHASES = [
  { phase: 1, title: "Foundation", months: "Months 1–3", description: "R3F canvas, card/stack system, atomic tokens, auth + multiplayer, node graph", color: "hsl(var(--node-event))" },
  { phase: 2, title: "Voice + Agents", months: "Months 4–6", description: "ElevenLabs STT, semantic command parser, Builder + Data agents, HyperTalk ∞ editor", color: "hsl(var(--node-agent))" },
  { phase: 3, title: "Rust/WASM Core", months: "Months 7–9", description: "State machine migration, offline CRDT sync, MMO-scale spatial sharding", color: "hsl(var(--node-data))" },
  { phase: 4, title: "Integrations", months: "Months 10–12", description: "Universal connector nodes, migration importers, marketplace, publishing pipeline", color: "hsl(var(--node-spatial))" },
  { phase: 5, title: "Spatial / XR", months: "Months 13–18", description: "WebXR for Vision Pro & Quest, hand-tracked 3D wireframing, spatial audio OS mode", color: "hsl(var(--node-media))" },
];

const STATS = [
  { value: "~1ms", numericEnd: 1, label: "Sync Latency", sub: "WebRTC CRDT delta" },
  { value: "∞", numericEnd: null, label: "Concurrent Users", sub: "Spatial sharding" },
  { value: "9", numericEnd: 9, label: "System Layers", sub: "L0 → L8" },
  { value: "70%", numericEnd: 70, label: "Creator Revenue", sub: "Marketplace split" },
];

const COMPARISON_ROWS = [
  { dim: "Speed", adv: "Rust/WASM core = near-native performance in a browser", color: "hsl(var(--node-data))" },
  { dim: "Scale", adv: "MMO spatial sharding = unlimited concurrent users", color: "hsl(var(--node-event))" },
  { dim: "Access", adv: "Every platform from one codebase: web, desktop, mobile, XR", color: "hsl(var(--node-spatial))" },
  { dim: "Collaboration", adv: "CRDT-based multiplayer = zero conflicts, always live", color: "hsl(var(--presence-2))" },
  { dim: "Voice", adv: "Every single action addressable by natural language", color: "hsl(var(--node-agent))" },
  { dim: "Intelligence", adv: "Agents are first-class citizens, not afterthoughts", color: "hsl(var(--node-agent))" },
  { dim: "Openness", adv: "Every object is a node — connect anything to anything", color: "hsl(var(--node-data))" },
  { dim: "Democracy", adv: "HyperTalk ∞ makes programming accessible to everyone, again", color: "hsl(var(--node-media))" },
];

// Count-up hook
function useCountUp(end: number | null, inView: boolean, duration = 1.5) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView || end === null) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end]);
  return count;
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(stat.numericEnd, inView);
  const displayValue = stat.numericEnd === null ? "∞" : stat.value.replace(String(stat.numericEnd), String(count));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl p-4 text-center relative overflow-hidden"
      style={{
        border: inView ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
        boxShadow: inView ? "0 0 20px hsl(var(--primary) / 0.15)" : "none",
        transition: "border-color 0.5s ease, box-shadow 0.5s ease",
      }}
    >
      {inView && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: 2 }}
          style={{ border: "1px solid hsl(var(--primary) / 0.6)", borderRadius: "inherit" }}
        />
      )}
      <div className="text-2xl font-bold text-gradient mb-0.5">{displayValue}</div>
      <div className="text-xs font-medium text-foreground/80 mb-0.5">{stat.label}</div>
      <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
    </motion.div>
  );
}

function LayerCard({ layer, index }: { layer: typeof LAYERS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = layer.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl p-5 cursor-pointer transition-all duration-300 group"
      style={{
        background: hovered ? `linear-gradient(145deg, ${layer.color}12, hsl(var(--card)))` : "hsl(var(--card))",
        border: `1px solid ${hovered ? layer.color + "50" : "hsl(var(--border))"}`,
        boxShadow: hovered ? `0 0 24px 0 ${layer.color}20` : "none",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: layer.color + "18", border: `1px solid ${layer.color}30` }}>
          <Icon size={18} style={{ color: layer.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono" style={{ color: layer.color + "cc" }}>{layer.id}</span>
            <span className="text-xs text-muted-foreground">{layer.subtitle}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2">{layer.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{layer.description}</p>
          <div className="flex flex-wrap gap-1">
            {layer.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: layer.color + "14", color: layer.color + "cc", border: `1px solid ${layer.color}20` }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SCROLL-DRIVEN NARRATIVE HERO ────────────────────────────────────────────
const NARRATIVE_STEPS = [
  {
    id: "step0",
    headline: "HyperCard ∞",
    sub: "A persistent, multiplayer, voice-malleable 3D spatial OS for thought, design, software, and collaboration.",
    visual: "hero",
    color: "hsl(var(--primary))",
  },
  {
    id: "step1",
    headline: "Everything is a Card",
    sub: "Every idea, document, component, API, and agent is a Card. Cards live in stacks, stacks live in worlds.",
    visual: "card",
    color: "hsl(var(--node-event))",
  },
  {
    id: "step2",
    headline: "Everything is a Node",
    sub: "Cards sprout typed ports — data, event, agent, spatial, media. Connect anything to anything, visually.",
    visual: "node",
    color: "hsl(var(--node-data))",
  },
  {
    id: "step3",
    headline: "Everything is Live",
    sub: "Multiplayer presence is built in. See your collaborators move, edit, and speak in real time.",
    visual: "live",
    color: "hsl(var(--presence-2))",
  },
  {
    id: "step4",
    headline: "Everything is Malleable",
    sub: "Voice-command every action. HyperTalk ∞ compiles to WASM and runs everything you can say.",
    visual: "voice",
    color: "hsl(var(--node-agent))",
  },
];

function ScrollNarrativeHero({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  // Each step occupies 20% of the scroll
  const step0Opacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
  const step1Opacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const step2Opacity = useTransform(scrollYProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0]);
  const step3Opacity = useTransform(scrollYProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0]);
  const step4Opacity = useTransform(scrollYProgress, [0.75, 0.8, 0.95, 1], [0, 1, 1, 0]);

  const step0Y = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const step1Y = useTransform(scrollYProgress, [0.15, 0.2, 0.4], [20, 0, -40]);
  const step2Y = useTransform(scrollYProgress, [0.35, 0.4, 0.6], [20, 0, -40]);
  const step3Y = useTransform(scrollYProgress, [0.55, 0.6, 0.8], [20, 0, -40]);
  const step4Y = useTransform(scrollYProgress, [0.75, 0.8, 1.0], [20, 0, -40]);

  const opacities = [step0Opacity, step1Opacity, step2Opacity, step3Opacity, step4Opacity];
  const yTransforms = [step0Y, step1Y, step2Y, step3Y, step4Y];

  // Progress dots
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} style={{ height: "500vh" }} className="relative">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden" style={{ zIndex: 0 }}>
        {/* 3D background */}
        <div className="absolute inset-0 canvas-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" style={{ zIndex: 2 }} />
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <Suspense fallback={null}><WorldCanvas /></Suspense>
        </div>
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          <PresenceCursors />
        </div>

        {/* Progress bar */}
        <div className="absolute top-14 inset-x-0 h-0.5 z-20" style={{ background: "hsl(var(--border) / 0.3)" }}>
          <motion.div className="h-full" style={{ width: progressWidth, background: "hsl(var(--primary) / 0.6)" }} />
        </div>

        {/* Step overlays */}
        {NARRATIVE_STEPS.map((step, i) => (
          <motion.div
            key={step.id}
            style={{ opacity: opacities[i], y: yTransforms[i], zIndex: 4 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
          >
            <div className="text-center max-w-4xl mx-auto">
              {/* Step badge */}
              {i > 0 && (
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6 glass"
                  style={{ border: `1px solid ${step.color}40` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.color }} />
                  <span style={{ color: step.color }}>Step {i} of 4</span>
                </motion.div>
              )}

              {/* i === 0 = main hero */}
              {i === 0 && (
                <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6 glass" style={{ border: "1px solid hsl(var(--primary) / 0.3)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary">Phase 1 — Foundation Building</span>
                  <ChevronRight size={12} className="text-muted-foreground" />
                </motion.div>
              )}

              <h1 className="font-bold tracking-tight leading-none mb-6" style={{ fontSize: i === 0 ? "clamp(3rem, 8vw, 6rem)" : "clamp(2.5rem, 6vw, 4.5rem)" }}>
                {i === 0 ? (
                  <>
                    <span className="block text-foreground">HyperCard</span>
                    <span className="block text-gradient">∞</span>
                  </>
                ) : (
                  <span className="block" style={{ color: step.color }}>{step.headline}</span>
                )}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                {step.sub}
              </p>

              {/* Visuals per step */}
              {i === 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12 pointer-events-auto">
                  <button onClick={() => navigate("/workspace")} className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all glow-primary">
                    <Box size={16} /> Enter the World <ArrowRight size={14} />
                  </button>
                  <button onClick={() => navigate("/nodes")} className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-semibold text-sm hover:border-primary/40 transition-all">
                    <Network size={16} /> Node Editor
                  </button>
                </div>
              )}

              {/* Step 1: Glassmorphism card */}
              {i === 1 && (
                <div className="flex justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl p-6 glass text-left"
                    style={{ width: 260, border: `1px solid ${step.color}40`, boxShadow: `0 0 40px ${step.color}20` }}
                  >
                    <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: step.color }}>SignupForm · Card</div>
                    <div className="space-y-2">
                      <div className="h-6 rounded-lg" style={{ background: `${step.color}15`, border: `1px solid ${step.color}20` }} />
                      <div className="h-6 rounded-lg" style={{ background: `${step.color}10`, border: `1px solid ${step.color}15` }} />
                      <div className="h-7 rounded-lg" style={{ background: `${step.color}20`, border: `1px solid ${step.color}40` }} />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Step 2: Card with SVG ports */}
              {i === 2 && (
                <div className="flex justify-center pointer-events-none">
                  <svg width="320" height="120" viewBox="0 0 320 120">
                    <rect x="100" y="20" width="120" height="80" rx="10" fill={`${step.color}10`} stroke={`${step.color}50`} strokeWidth="1.5" />
                    <text x="160" y="65" textAnchor="middle" fill={step.color} fontSize="11" fontFamily="monospace">SignupForm</text>
                    {/* Port circles */}
                    <circle cx="100" cy="60" r="5" fill={step.color} opacity="0.8" />
                    <circle cx="220" cy="45" r="5" fill="hsl(var(--node-agent))" opacity="0.8" />
                    <circle cx="220" cy="75" r="5" fill="hsl(var(--node-spatial))" opacity="0.8" />
                    {/* Cables */}
                    <path d="M 95 60 C 60 60, 40 40, 20 40" stroke={step.color} strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
                    <path d="M 225 45 C 260 45, 280 35, 300 35" stroke="hsl(var(--node-agent))" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
                    <path d="M 225 75 C 260 75, 280 85, 300 85" stroke="hsl(var(--node-spatial))" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 3" />
                  </svg>
                </div>
              )}

              {/* Step 3: Presence cursors */}
              {i === 3 && (
                <div className="flex justify-center gap-8 pointer-events-none">
                  {[
                    { name: "Aria", color: "hsl(var(--presence-1))" },
                    { name: "Leon", color: "hsl(var(--presence-2))" },
                    { name: "Nova", color: "hsl(var(--presence-3))" },
                  ].map((p, j) => (
                    <motion.div key={p.name} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: j * 0.2 }} className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${p.color}20`, border: `2px solid ${p.color}60`, color: p.color }}>
                        {p.name[0]}
                      </div>
                      <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${p.color}15`, color: p.color }}>{p.name}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Step 4: Voice waveform */}
              {i === 4 && (
                <div className="flex justify-center pointer-events-none">
                  <motion.div className="flex items-end gap-0.5 h-16">
                    {Array.from({ length: 32 }, (_, j) => (
                      <motion.div
                        key={j}
                        className="w-2 rounded-full"
                        animate={{ height: [`${20 + Math.sin(j * 0.5) * 50}%`, `${50 + Math.cos(j * 0.7) * 40}%`, `${20 + Math.sin(j * 0.5) * 50}%`] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.05 }}
                        style={{ background: step.color, opacity: 0.7 + Math.sin(j * 0.3) * 0.3 }}
                      />
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Stats — only on step 0 */}
              {i === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-4">
                  {STATS.map((stat, si) => (
                    <div key={stat.label} className="glass rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gradient mb-0.5">{stat.value}</div>
                      <div className="text-xs font-medium text-foreground/80 mb-0.5">{stat.label}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Scroll indicator — visible only at start */}
        <motion.div
          style={{ opacity: step0Opacity, zIndex: 10 }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<"canvas" | "nodes" | "voice">("canvas");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavBar />

      {/* ─── SCROLL NARRATIVE HERO ─── */}
      <ScrollNarrativeHero navigate={navigate} />

      {/* ─── PHILOSOPHY CHIPS ─── */}
      <section className="py-16 px-6 border-y border-border/50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Layers, text: "Everything is a Card", color: "hsl(var(--node-event))" },
              { icon: Network, text: "Everything is a Node", color: "hsl(var(--node-data))" },
              { icon: Radio, text: "Everything is Live", color: "hsl(var(--node-agent))" },
              { icon: Volume2, text: "Everything is Malleable", color: "hsl(var(--node-media))" },
              { icon: Workflow, text: "Atomic Design Throughout", color: "hsl(var(--node-spatial))" },
            ].map(({ icon: Icon, text, color }, i) => (
              <motion.div key={text} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass" style={{ border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
                <span className="text-sm font-medium text-foreground/90">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE DEMO PANEL ─── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">The Living </span>
              <span className="text-gradient">Interface</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three modes, one world — a 3D spatial canvas, a live node graph with animated data flows, and voice-controlled mutations.
            </p>
          </motion.div>

          <div className="flex justify-center gap-1 mb-6">
            {(["canvas", "nodes", "voice"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                style={{
                  background: activeTab === tab ? "hsl(var(--primary) / 0.15)" : "transparent",
                  color: activeTab === tab ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: activeTab === tab ? "1px solid hsl(var(--primary) / 0.3)" : "1px solid transparent",
                }}>
                {tab === "canvas" ? "3D Canvas" : tab === "nodes" ? "Node Graph" : "Voice Control"}
              </button>
            ))}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
            className="relative rounded-2xl overflow-hidden glass" style={{ border: "1px solid hsl(var(--border))", height: 480 }}>
            <div className="absolute top-0 inset-x-0 h-10 glass-strong border-b border-border/50 flex items-center px-4 gap-3 z-10">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-node-media opacity-60" />
                <div className="w-2.5 h-2.5 rounded-full bg-node-spatial opacity-60" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="text-[11px] text-muted-foreground font-mono">
                  {activeTab === "canvas" && "world://main.space/canvas"}
                  {activeTab === "nodes" && "world://main.space/nodes"}
                  {activeTab === "voice" && "voice://main.space/control"}
                </div>
              </div>
              <PresenceBar />
            </div>

            {activeTab === "canvas" && (
              <div className="absolute inset-0 pt-10 canvas-dots">
                <Suspense fallback={null}><WorldCanvas /></Suspense>
                <PresenceCursors />
              </div>
            )}

            {activeTab === "nodes" && (
              <div className="absolute inset-0 pt-10 canvas-grid">
                <div className="relative w-full h-full">
                  <NodeGraph animated />
                  <div className="absolute bottom-4 left-4 glass rounded-lg p-3 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Port Types</div>
                    {[
                      { type: "Data", color: "hsl(var(--node-data))" },
                      { type: "Event", color: "hsl(var(--node-event))" },
                      { type: "Agent", color: "hsl(var(--node-agent))" },
                      { type: "Spatial", color: "hsl(var(--node-spatial))" },
                    ].map(({ type, color }) => (
                      <div key={type} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-[11px] text-muted-foreground">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="absolute inset-0 pt-10 flex flex-col items-center justify-center gap-6 px-8 canvas-dots">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "hsl(var(--node-agent) / 0.15)", border: "2px solid hsl(var(--node-agent) / 0.4)", boxShadow: "0 0 40px hsl(var(--node-agent) / 0.3)" }}>
                  <Mic size={32} style={{ color: "hsl(var(--node-agent))" }} />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Example voice commands</p>
                  <div className="space-y-2 max-w-md">
                    {['"Move this card to the top stack"', '"Apply glassmorphism to all cards in this stack"', '"Connect this card to the Stripe API"', '"Generate a user flow for checkout"', '"Turn this wireframe into a React component"'].map((cmd, i) => (
                      <motion.div key={cmd} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                        className="glass rounded-lg px-4 py-2 text-sm text-left font-mono"
                        style={{ color: "hsl(var(--node-agent))", border: "1px solid hsl(var(--node-agent) / 0.2)" }}>
                        {cmd}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── LAYERS ─── */}
      <section id="layers" className="py-20 px-6 bg-background-mid/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Architecture</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">9 Layers</span><span className="text-foreground">, One World</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every layer is independently powerful. Together they form an unstoppable spatial medium.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LAYERS.map((layer, i) => <LayerCard key={layer.id} layer={layer} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── HYPERTALK CODE SAMPLE ─── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-xs uppercase tracking-widest text-node-event mb-3">Layer 5</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">HyperTalk <span className="text-gradient">∞</span></h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">A natural language scripting layer that compiles to WASM. Write in plain English or code — the node graph stays in perfect sync with both.</p>
              <ul className="space-y-3">
                {[
                  { icon: Terminal, text: "Compiles to WASM for sandboxed execution" },
                  { icon: GitBranch, text: "Bidirectional: code ↔ node graph, always in sync" },
                  { icon: Sparkles, text: "AI autocomplete trained on the full API surface" },
                  { icon: Volume2, text: "Natural language mode: just describe what you want" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon size={14} className="text-node-event flex-shrink-0" />{text}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(var(--node-event) / 0.3)" }}>
              <div className="glass-strong px-4 py-2.5 flex items-center gap-3 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-destructive/60" />
                  <div className="w-2 h-2 rounded-full bg-node-media/60" />
                  <div className="w-2 h-2 rounded-full bg-node-spatial/60" />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">hypertalk.ht∞</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--node-event) / 0.15)", color: "hsl(var(--node-event))" }}>WASM compiled</span>
              </div>
              <pre className="p-6 text-sm leading-7 font-mono overflow-x-auto" style={{ background: "hsl(var(--card))" }}>
                <code>
                  <span style={{ color: "hsl(var(--node-agent))" }}>on</span><span style={{ color: "hsl(var(--foreground))" }}> click </span><span style={{ color: "hsl(var(--node-agent))" }}>of</span><span style={{ color: "hsl(var(--node-data))" }}> Button</span><span style={{ color: "hsl(var(--node-media))" }}> "Submit"</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-agent))" }}>  if</span><span style={{ color: "hsl(var(--node-data))" }}> Field</span><span style={{ color: "hsl(var(--node-media))" }}> "Email"</span><span style={{ color: "hsl(var(--node-event))" }}> is empty</span>{" "}<span style={{ color: "hsl(var(--node-agent))" }}>then</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-spatial))" }}>    shake</span><span style={{ color: "hsl(var(--node-data))" }}> Card</span><span style={{ color: "hsl(var(--node-media))" }}> "SignupForm"</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-spatial))" }}>    say</span><span style={{ color: "hsl(var(--node-media))" }}> "Please enter your email"</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-agent))" }}>  else</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-spatial))" }}>    navigate to</span><span style={{ color: "hsl(var(--node-data))" }}> Stack</span><span style={{ color: "hsl(var(--node-media))" }}> "Onboarding"</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-spatial))" }}>      with transition</span><span style={{ color: "hsl(var(--node-media))" }}> "portal"</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-agent))" }}>  end if</span>{"\n"}
                  <span style={{ color: "hsl(var(--node-agent))" }}>end click</span>
                </code>
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── ROADMAP ─── */}
      <section id="roadmap" className="py-20 px-6 bg-background-mid/50">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Roadmap</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Building the </span><span className="text-gradient">Inevitable</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">5 phases, 18 months — from 3D canvas foundation to full spatial OS.</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--border)) 10%, hsl(var(--border)) 90%, transparent)" }} />
            <div className="space-y-8">
              {PHASES.map((phase, i) => (
                <motion.div key={phase.phase} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`md:w-[45%] ${i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}>
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background"
                    style={{ background: phase.color, top: `${i * 20 + 4}%`, boxShadow: `0 0 12px ${phase.color}` }} />
                  <div className="glass rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]" style={{ border: `1px solid ${phase.color}30` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: phase.color + "20", color: phase.color }}>{phase.phase}</div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{phase.title}</div>
                        <div className="text-[11px] text-muted-foreground">{phase.months}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{phase.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE STATS (count-up) ─── */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section id="philosophy" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">What Makes This </span><span className="text-gradient">Unstoppable</span>
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden glass" style={{ border: "1px solid hsl(var(--border))" }}>
            <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-background-surface px-6 py-3 border-b border-border">
              <div>Dimension</div>
              <div className="text-center">Others</div>
              <div className="text-center" style={{ color: "hsl(var(--primary))" }}>HyperCard ∞</div>
            </div>
            {COMPARISON_ROWS.map(({ dim, adv, color }, i) => (
              <motion.div key={dim} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="grid grid-cols-3 px-6 py-4 border-b border-border/50 last:border-0 group"
                style={{ transition: "background 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color}08`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div className="text-sm font-medium" style={{ color }}>{dim}</div>
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--destructive) / 0.1)" }}>
                    <XIcon size={10} className="text-destructive" />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                    <Check size={10} style={{ color }} />
                  </div>
                  <span className="text-xs text-muted-foreground hidden lg:block text-left max-w-[200px]">{adv.split("=")[0].trim()}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── 8 SHOWCASE SECTIONS ─── */}
      <AgentOrbitSystem />
      <CardStackShowcase />
      <VoiceTerminal />
      <MMODiagram />
      <MigrationSection />
      <TokenVisualizer />
      <PublishingSection />

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 canvas-grid opacity-20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Space. Time. Data.</span>{" "}
              <span className="block text-gradient">Agents. Humans.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Not a design tool. Not a database. Not a no-code builder. Not a 3D editor. Not a collaboration platform.<br />
              <span className="text-foreground font-medium">All of them simultaneously.</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate("/workspace")} className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all animate-pulse-glow">
                <Zap size={18} /> Begin Phase 1 <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/nodes")} className="flex items-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-semibold text-base hover:border-primary/40 transition-all">
                <Network size={18} /> Node Editor
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── RICH FOOTER ─── */}
      <footer className="border-t border-border pt-16 pb-8 px-6" style={{ background: "hsl(var(--card) / 0.5)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Col 1: Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Hexagon size={16} className="text-primary-foreground" />
                </div>
                <span className="text-base font-bold">HyperCard <span className="text-gradient">∞</span></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                A spatial operating system for thought, design, software, and collaboration.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px]" style={{ background: "hsl(var(--node-event) / 0.1)", border: "1px solid hsl(var(--node-event) / 0.3)", color: "hsl(var(--node-event))" }}>
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--node-event))" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
                Phase 1 — Building
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Product</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Workspace", href: "/workspace" },
                  { label: "Node Editor", href: "/nodes" },
                  { label: "HyperTalk", href: "/hypertalk" },
                  { label: "Worlds", href: "/worlds" },
                  { label: "Marketplace", href: "/marketplace" },
                  { label: "Studio", href: "/studio" },
                  { label: "Connectors", href: "/connectors" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Docs */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Docs</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Getting Started", href: "/docs" },
                  { label: "Concepts", href: "/docs" },
                  { label: "API Reference", href: "/docs" },
                  { label: "HyperTalk ∞", href: "/docs" },
                  { label: "Connectors", href: "/docs" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Community */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Community</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "GitHub", icon: Github, href: "#" },
                  { label: "Discord", icon: MessageSquare, href: "#" },
                  { label: "X / Twitter", icon: Twitter, href: "#" },
                ].map(({ label, icon: Icon, href }) => (
                  <li key={label}>
                    <a href={href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Icon size={13} /> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}>
            <p className="text-xs text-muted-foreground">© 2025 HyperCard ∞. Built on the foundation of Bill Atkinson's original vision.</p>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}>Phase 1 — Foundation</span>
              <span className="text-xs text-muted-foreground">Built with HyperCard ∞</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
