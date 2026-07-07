import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Hexagon, Layers, Network, Sparkles, Terminal, ArrowRight, Code2, Play, Zap, Box, Search, Command, ChevronRight, ExternalLink } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { NodeGraphScene } from "@/components/three/NodeGraphScene";

const DOC_TREE = [
  {
    section: "Getting Started", items: [
      { id: "gs-intro", title: "Introduction", icon: Hexagon },
      { id: "gs-quickstart", title: "Quick Start", icon: Zap },
      { id: "gs-concepts", title: "Core Concepts", icon: Layers },
    ]
  },
  {
    section: "Concepts", items: [
      { id: "c-cards", title: "Cards & Stacks", icon: Layers },
      { id: "c-nodes", title: "Node Graph", icon: Network },
      { id: "c-agents", title: "Agents", icon: Sparkles },
      { id: "c-hypertalk", title: "HyperTalk ∞", icon: Terminal },
      { id: "c-worlds", title: "Worlds", icon: Box },
    ]
  },
  {
    section: "API Reference", items: [
      { id: "api-cards", title: "Card API", icon: Code2 },
      { id: "api-nodes", title: "Node API", icon: Network },
      { id: "api-agents", title: "Agent API", icon: Sparkles },
    ]
  },
  {
    section: "Connectors", items: [
      { id: "conn-stripe", title: "Stripe", icon: Code2 },
      { id: "conn-openai", title: "OpenAI", icon: Sparkles },
      { id: "conn-figma", title: "Figma", icon: Code2 },
    ]
  },
  {
    section: "Deployment", items: [
      { id: "dep-publish", title: "Publishing", icon: ArrowRight },
      { id: "dep-marketplace", title: "Marketplace", icon: Box },
    ]
  },
];

type DocEntry = { id: string; title: string; icon: typeof Hexagon };

const DOC_CONTENT: Record<string, { title: string; body: string; snippet?: string; visual?: "card" | "node" | "agent" | "world" }> = {
  "gs-intro": {
    title: "Introduction to HyperCard ∞",
    body: "HyperCard ∞ is a persistent, multiplayer, voice-malleable 3D spatial operating system for thought, design, software, and collaboration. Everything is a Card. Every card is a Node. Every node is Live.",
    visual: "card",
  },
  "gs-quickstart": {
    title: "Quick Start",
    body: "Create your first world in three steps: Enter the Workspace, drag a Card from the palette, and wire it to a Node. Then use voice or HyperTalk ∞ to bring it to life.",
    snippet: 'on load of Card "Welcome"\n  say "Welcome to HyperCard ∞"\n  animate with "fade-in"\nend load',
  },
  "gs-concepts": {
    title: "Core Concepts",
    body: "Cards are the atoms. Stacks are the molecules. Nodes are the connections. Agents are the intelligence. Worlds are the universe. HyperTalk ∞ is the voice of everything.",
    visual: "node",
  },
  "c-cards": {
    title: "Cards & Stacks",
    body: "Cards are the fundamental unit of HyperCard ∞. Every piece of content, UI, data, or logic lives in a Card. Stacks are ordered collections of Cards with shared rules, tokens, and transitions.",
    visual: "card",
    snippet: 'create Card "UserProfile"\n  set title to "Alex Chen"\n  set layout to "profile"\n  connect to Stack "TeamDirectory"',
  },
  "c-nodes": {
    title: "Node Graph",
    body: "Every Card exposes typed ports. Connect output ports to input ports to create data flows. Port types include Data, Event, Agent, Spatial, Voice, and Media. Incompatible types are rejected at connection time.",
    visual: "node",
    snippet: 'node AuthFlow\n  input: email:string, password:string\n  output: user:UserObject, error:string\n  on connect → validate → authenticate',
  },
  "c-agents": {
    title: "Agents",
    body: "Agents are first-class citizens with 3D presence. Builder agents architect and build. Data agents process and transform. Review agents quality-check and refine. Narrator agents explain and present.",
    visual: "agent",
    snippet: 'ask Agent "Builder" to\n  "Create a signup flow with email,\n   password, and social auth buttons"\nwith style "minimal"\nand place in Stack "Auth"',
  },
  "c-hypertalk": {
    title: "HyperTalk ∞",
    body: "HyperTalk ∞ is the scripting language of HyperCard ∞. It compiles to WebAssembly, runs in a secure sandbox, and stays in perfect bidirectional sync with the visual node graph. Write plain English or code — both are first-class.",
    snippet: 'on click of Button "Submit"\n  if Field "Email" is empty then\n    shake Card "LoginForm"\n    say "Please enter your email"\n  else\n    navigate to Stack "Dashboard"\n      with transition "portal"\n  end if\nend click',
  },
  "c-worlds": {
    title: "Worlds",
    body: "Worlds are persistent 3D spaces that contain Stacks, Nodes, and Agents. They support MMO-scale multiplayer via spatial sharding, CRDT-based sync, and WebRTC presence. Each World is also a deployable application.",
    visual: "world",
  },
  "api-cards": {
    title: "Card API",
    body: "The Card API provides methods for creating, reading, updating, and deleting Cards programmatically.",
    snippet: 'Card.create({ title, layout, stack })\nCard.get(id)\nCard.update(id, { title, data })\nCard.delete(id)\nCard.animate(id, "shake" | "fade" | "portal")',
  },
  "api-nodes": {
    title: "Node API",
    body: "Connect, disconnect, and query the node graph using the Node API.",
    snippet: 'Node.connect(fromId, portName, toId, portName)\nNode.disconnect(connectionId)\nNode.query({ type, tag })\nNode.watch(id, callback)',
  },
  "api-agents": {
    title: "Agent API",
    body: "Spawn, prompt, and listen to agents programmatically.",
    snippet: 'Agent.spawn("Builder", { context })\nAgent.prompt(id, "Build a payment form")\nAgent.on(id, "response", callback)\nAgent.stop(id)',
  },
  "conn-stripe": {
    title: "Stripe Connector",
    body: "The Stripe connector exposes typed ports for payments, subscriptions, webhooks, and customer management.",
    snippet: 'connect to Connector "Stripe"\n  with key from Secret "STRIPE_KEY"\ncharge amount: Field "Total"\n  currency: "usd"\n  customer: currentUser.id',
  },
  "conn-openai": {
    title: "OpenAI Connector",
    body: "The OpenAI connector provides GPT-4o, DALL-E, and Whisper as typed node ports.",
    snippet: 'ask Connector "OpenAI"\n  model: "gpt-4o"\n  prompt: Field "UserInput"\n  stream: true\n  into: Card "ResponseCard"',
  },
  "conn-figma": {
    title: "Figma Connector",
    body: "Import Figma files as HyperCard stacks instantly. Components become nodes, auto-layout maps to stack rules.",
    snippet: 'import from Connector "Figma"\n  file: "My Design System"\n  as: Stack "DesignTokens"\n  sync: live',
  },
  "dep-publish": {
    title: "Publishing",
    body: "Any World can be published as a PWA, desktop app (via Tauri), or mobile app from the same codebase. Publishing takes one click from the Workspace toolbar.",
    snippet: 'publish World "MyApp"\n  as: ["PWA", "Desktop", "iOS", "Android"]\n  domain: "myapp.hypercard.world"\n  visibility: "public"',
  },
  "dep-marketplace": {
    title: "Marketplace",
    body: "Share your creations with the world. List Cards, Stacks, Nodes, Connectors, Agents, or whole Worlds. Earn 70% of all sales. Analytics are visualized in 3D.",
  },
};

// Mini visuals for concept cards
function MiniCardVisual() {
  return (
    <div className="flex gap-2 items-end justify-center h-16">
      {["SignupForm", "Dashboard", "Profile"].map((name, i) => (
        <motion.div key={name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
          className="rounded-lg px-3 py-2 text-[9px] font-medium"
          style={{
            background: "hsl(var(--card))", border: "1px solid hsl(var(--node-event) / 0.4)",
            color: "hsl(var(--node-event))", transform: `translateY(${i * -6}px) rotate(${(i - 1) * -3}deg)`
          }}>
          {name}
        </motion.div>
      ))}
    </div>
  );
}

function MiniNodeVisual() {
  return (
    <div className="relative h-16 flex items-center justify-center gap-3">
      {[{ label: "Input", c: "hsl(var(--node-event))" }, { label: "Logic", c: "hsl(var(--node-data))" }, { label: "Output", c: "hsl(var(--node-spatial))" }].map((n, i) => (
        <div key={n.label} className="flex items-center gap-1.5">
          <div className="px-2 py-1 rounded-md text-[9px] font-medium"
            style={{ background: n.c + "15", border: `1px solid ${n.c}50`, color: n.c }}>{n.label}</div>
          {i < 2 && <div className="w-4 h-px" style={{ background: n.c + "60" }} />}
        </div>
      ))}
    </div>
  );
}

function MiniAgentVisual() {
  const orbs = ["hsl(var(--node-event))", "hsl(var(--node-data))", "hsl(var(--node-agent))", "hsl(var(--node-media))"];
  return (
    <div className="flex items-center justify-center gap-3 h-16">
      {orbs.map((c, i) => (
        <motion.div key={i} className="rounded-full"
          animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
          style={{ width: 20, height: 20, background: c, boxShadow: `0 0 8px ${c}` }} />
      ))}
    </div>
  );
}

function MiniWorldVisual() {
  return (
    <div className="flex items-center justify-center h-16">
      <motion.div className="rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        style={{ width: 40, height: 40, border: "2px dashed hsl(var(--node-spatial) / 0.6)", padding: 6 }}>
        <div className="rounded-full w-full h-full" style={{ background: "hsl(var(--node-spatial) / 0.25)" }} />
      </motion.div>
    </div>
  );
}

// Command palette search
function CommandPalette({ entries, onSelect, onClose }: {
  entries: DocEntry[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const results = q ? entries.filter((e) => e.title.toLowerCase().includes(q.toLowerCase())) : entries.slice(0, 8);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      style={{ background: "hsl(var(--background) / 0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -10 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 24px 80px hsl(var(--primary) / 0.2)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={14} className="text-muted-foreground" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>Esc</kbd>
        </div>
        <div className="max-h-72 overflow-auto py-1">
          {results.map((e) => {
            const Icon = e.icon;
            return (
              <button key={e.id} onClick={() => { onSelect(e.id); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-left">
                <Icon size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{e.title}</span>
                <ChevronRight size={12} className="ml-auto text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Docs() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState("gs-intro");
  const [cmdOpen, setCmdOpen] = useState(false);
  const allEntries = DOC_TREE.flatMap((s) => s.items);
  const content = DOC_CONTENT[activeId] || DOC_CONTENT["gs-intro"];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <div className="flex flex-1 pt-12">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-12 h-[calc(100vh-3rem)] overflow-auto"
          style={{ borderRight: "1px solid hsl(var(--border))", background: "hsl(var(--card) / 0.5)" }}>
          {/* Search hint */}
          <button onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 mx-3 mt-4 mb-2 px-3 py-2 rounded-lg text-xs text-muted-foreground transition-colors hover:bg-accent"
            style={{ border: "1px solid hsl(var(--border))" }}>
            <Search size={11} />
            <span>Search docs</span>
            <kbd className="ml-auto text-[10px] px-1 rounded font-mono" style={{ background: "hsl(var(--background))" }}>⌘K</kbd>
          </button>

          <nav className="px-3 pb-8 space-y-4">
            {DOC_TREE.map((section) => (
              <div key={section.section}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 mb-1">{section.section}</div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeId === item.id;
                  return (
                    <button key={item.id} onClick={() => setActiveId(item.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: active ? "hsl(var(--primary) / 0.1)" : "transparent",
                        color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.75)",
                        fontWeight: active ? 600 : 400,
                      }}>
                      <Icon size={12} />
                      {item.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-3xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div key={activeId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6">
                <span>Docs</span>
                <ChevronRight size={10} />
                <span style={{ color: "hsl(var(--primary))" }}>{content.title}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-4">{content.title}</h1>

              {/* Concept card with mini visual */}
              {content.visual && (
                <div className="rounded-2xl mb-6 overflow-hidden glass"
                  style={{ border: "1px solid hsl(var(--primary) / 0.2)" }}>
                  {content.visual === "node" ? (
                    <div style={{ height: 160 }}>
                      <NodeGraphScene />
                    </div>
                  ) : (
                    <div className="p-5">
                      {content.visual === "card" && <MiniCardVisual />}
                      {content.visual === "agent" && <MiniAgentVisual />}
                      {content.visual === "world" && <MiniWorldVisual />}
                    </div>
                  )}
                </div>
              )}

              <p className="text-base text-muted-foreground leading-relaxed mb-8">{content.body}</p>

              {/* Code snippet with "Try it" button */}
              {content.snippet && (
                <div className="rounded-2xl overflow-hidden mb-8"
                  style={{ border: "1px solid hsl(var(--node-event) / 0.3)" }}>
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-destructive/60" />
                        <div className="w-2 h-2 rounded-full bg-node-media/60" />
                        <div className="w-2 h-2 rounded-full bg-node-spatial/60" />
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">example.ht∞</span>
                    </div>
                    <button onClick={() => navigate("/hypertalk")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "hsl(var(--node-event) / 0.1)", color: "hsl(var(--node-event))", border: "1px solid hsl(var(--node-event) / 0.25)" }}>
                      <Play size={9} /> Run in HyperTalk
                    </button>
                  </div>
                  <pre className="p-4 text-xs leading-6 font-mono overflow-x-auto" style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground) / 0.85)" }}>
                    {content.snippet}
                  </pre>
                </div>
              )}

              {/* Navigation between pages */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {(() => {
                  const flat = allEntries;
                  const idx = flat.findIndex((e) => e.id === activeId);
                  const prev = flat[idx - 1];
                  const next = flat[idx + 1];
                  return (
                    <>
                      {prev && (
                        <button onClick={() => setActiveId(prev.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-accent"
                          style={{ border: "1px solid hsl(var(--border))" }}>
                          <ChevronRight size={11} className="rotate-180" /> {prev.title}
                        </button>
                      )}
                      {next && (
                        <button onClick={() => setActiveId(next.id)}
                          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-accent"
                          style={{ border: "1px solid hsl(var(--border))" }}>
                          {next.title} <ChevronRight size={11} />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette
            entries={allEntries}
            onSelect={(id) => setActiveId(id)}
            onClose={() => setCmdOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
