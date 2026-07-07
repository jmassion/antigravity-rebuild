import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Code2, BookOpen, Zap } from "lucide-react";
import { NavBar } from "@/components/NavBar";

type ConnectorCategory = "AI" | "Data" | "Design" | "Voice" | "Payments" | "Communication" | "3D" | "Spatial";

interface Connector {
  id: string;
  name: string;
  category: ConnectorCategory;
  desc: string;
  color: string;
  icon: string;
  ports: { name: string; type: string; dir: "in" | "out" }[];
  snippet: string;
}

const CONNECTORS: Connector[] = [
  {
    id: "openai", name: "OpenAI", category: "AI", desc: "GPT-4o, DALL·E, Whisper, and Embeddings — all as typed node ports.", color: "hsl(var(--node-agent))", icon: "⬡",
    ports: [{ name: "prompt", type: "data", dir: "in" }, { name: "response", type: "data", dir: "out" }, { name: "stream", type: "event", dir: "out" }],
    snippet: `connect OpenAI\n  model "gpt-4o"\n  input from Field "Prompt"\n  stream to Card "Response"`,
  },
  {
    id: "elevenlabs", name: "ElevenLabs", category: "Voice", desc: "Real-time voice synthesis with persona selection and spatial audio routing.", color: "hsl(var(--node-media))", icon: "🔊",
    ports: [{ name: "text", type: "data", dir: "in" }, { name: "voice_id", type: "data", dir: "in" }, { name: "audio", type: "media", dir: "out" }],
    snippet: `connect ElevenLabs\n  voice "Rachel"\n  input from agent Narrator\n  output to spatial Card "Speaker"`,
  },
  {
    id: "stripe", name: "Stripe", category: "Payments", desc: "Full payment flows, subscriptions, and webhook events as typed node ports.", color: "hsl(var(--node-event))", icon: "💳",
    ports: [{ name: "amount", type: "data", dir: "in" }, { name: "customer", type: "data", dir: "in" }, { name: "success", type: "event", dir: "out" }, { name: "failure", type: "event", dir: "out" }],
    snippet: `connect Stripe\n  mode "subscription"\n  onSuccess navigate to Stack "Dashboard"\n  onFailure shake Card "PaymentForm"`,
  },
  {
    id: "supabase", name: "Supabase", category: "Data", desc: "Real-time database, auth, storage, and edge functions — all as node ports.", color: "hsl(var(--node-data))", icon: "⚡",
    ports: [{ name: "query", type: "data", dir: "in" }, { name: "rows", type: "data", dir: "out" }, { name: "realtime", type: "event", dir: "out" }],
    snippet: `connect Supabase\n  table "profiles"\n  filter by auth.user.id\n  realtime to agent DataWatcher`,
  },
  {
    id: "figma", name: "Figma", category: "Design", desc: "Import Figma components, tokens, and frames directly into HyperCard worlds.", color: "hsl(var(--node-media))", icon: "✦",
    ports: [{ name: "file_url", type: "data", dir: "in" }, { name: "cards", type: "spatial", dir: "out" }, { name: "tokens", type: "data", dir: "out" }],
    snippet: `connect Figma\n  file "https://figma.com/file/..."\n  importAs Cards\n  syncTokens to Layer "Design"`,
  },
  {
    id: "notion", name: "Notion", category: "Data", desc: "Import Notion pages, databases, and blocks as stacks and cards with live sync.", color: "hsl(var(--node-data))", icon: "📄",
    ports: [{ name: "page_id", type: "data", dir: "in" }, { name: "stack", type: "spatial", dir: "out" }, { name: "updated", type: "event", dir: "out" }],
    snippet: `connect Notion\n  page "My Knowledge Base"\n  importAs Stack "KB"\n  syncOn realtime`,
  },
  {
    id: "threejs", name: "Three.js", category: "3D", desc: "Direct Three.js scene access — custom meshes, shaders, and post-processing.", color: "hsl(var(--node-spatial))", icon: "🔺",
    ports: [{ name: "scene", type: "spatial", dir: "in" }, { name: "mesh", type: "spatial", dir: "out" }, { name: "frame", type: "event", dir: "out" }],
    snippet: `connect Three\n  scene world.canvas\n  addMesh type "TorusKnot"\n  animate onFrame { spin(0.01) }`,
  },
  {
    id: "slack", name: "Slack", category: "Communication", desc: "Slack messages as event nodes — trigger card mutations from Slack commands.", color: "hsl(var(--node-event))", icon: "💬",
    ports: [{ name: "channel", type: "data", dir: "in" }, { name: "message", type: "data", dir: "out" }, { name: "mention", type: "event", dir: "out" }],
    snippet: `connect Slack\n  channel "#hypercard"\n  onMention run HyperTalk script\n  broadcast to agent Narrator`,
  },
];

const CATEGORIES: ConnectorCategory[] = ["AI", "Data", "Design", "Voice", "Payments", "Communication", "3D", "Spatial"];

const PORT_COLORS: Record<string, string> = {
  data: "hsl(var(--node-data))",
  event: "hsl(var(--node-event))",
  agent: "hsl(var(--node-agent))",
  spatial: "hsl(var(--node-spatial))",
  media: "hsl(var(--node-media))",
};

export default function Connectors() {
  const [activeCategory, setActiveCategory] = useState<ConnectorCategory | "All">("All");
  const [selected, setSelected] = useState<Connector | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = CONNECTORS.filter(
    (c) => activeCategory === "All" || c.category === activeCategory
  );

  const handleAdd = (c: Connector, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addedIds.has(c.id)) return;
    setAddingId(c.id);
    setTimeout(() => {
      setAddingId(null);
      setAddedIds((prev) => new Set([...prev, c.id]));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-12">
        {/* Header */}
        <div className="px-6 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 canvas-dots opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Integrations</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Every Service is a </span>
              <span className="text-gradient">Node</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect AI, databases, design tools, voice, payments, and 3D — each as a typed connector node.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20 flex gap-6">
          {/* Sidebar categories */}
          <div className="hidden md:flex flex-col gap-1 w-40 flex-shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-2">Categories</div>
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeCategory === cat ? "hsl(var(--primary) / 0.1)" : "transparent",
                  color: activeCategory === cat ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: activeCategory === cat ? "1px solid hsl(var(--primary) / 0.25)" : "1px solid transparent",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1">
            {/* Mobile category chips */}
            <div className="flex md:hidden flex-wrap gap-2 mb-6">
              {(["All", ...CATEGORIES] as const).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: activeCategory === cat ? "hsl(var(--primary) / 0.12)" : "hsl(var(--card))",
                    color: activeCategory === cat ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    border: activeCategory === cat ? "1px solid hsl(var(--primary) / 0.3)" : "1px solid hsl(var(--border))",
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((c, i) => {
                const isAdding = addingId === c.id;
                const isAdded = addedIds.has(c.id);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(c)}
                    className="rounded-xl p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    style={{
                      background: "hsl(var(--card))",
                      border: `1px solid ${selected?.id === c.id ? c.color + "50" : "hsl(var(--border))"}`,
                      boxShadow: selected?.id === c.id ? `0 0 20px ${c.color}20` : "none",
                    }}
                  >
                    {/* Node-style header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                          style={{ background: c.color + "15", border: `1px solid ${c.color}30` }}>
                          {c.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{c.name}</div>
                          <div className="text-[9px] text-muted-foreground">{c.category}</div>
                        </div>
                      </div>
                      <motion.button
                        onClick={(e) => handleAdd(c, e)}
                        whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: isAdded ? "hsl(var(--node-spatial) / 0.15)" : c.color + "15",
                          border: `1px solid ${isAdded ? "hsl(var(--node-spatial) / 0.4)" : c.color + "40"}`,
                          color: isAdded ? "hsl(var(--node-spatial))" : c.color,
                        }}
                      >
                        {isAdding ? (
                          <Zap size={10} className="animate-pulse" />
                        ) : isAdded ? (
                          <span className="text-[9px]">✓</span>
                        ) : (
                          <Plus size={10} />
                        )}
                      </motion.button>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">{c.desc}</p>

                    {/* Ports preview */}
                    <div className="flex flex-wrap gap-1">
                      {c.ports.slice(0, 3).map((port) => (
                        <span key={port.name} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: PORT_COLORS[port.type] + "12",
                            color: PORT_COLORS[port.type],
                            border: `1px solid ${PORT_COLORS[port.type]}25`,
                          }}>
                          {port.dir === "in" ? "→" : "←"} {port.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 flex flex-col"
            style={{
              background: "hsl(var(--card) / 0.97)",
              backdropFilter: "blur(24px)",
              borderLeft: `1px solid ${selected.color}30`,
              boxShadow: `-24px 0 80px ${selected.color}15`,
            }}
          >
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selected.color + "15", border: `1px solid ${selected.color}30` }}>
                  {selected.icon}
                </div>
                <div>
                  <div className="font-bold text-sm">{selected.name}</div>
                  <div className="text-[10px] text-muted-foreground">{selected.category}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{selected.desc}</p>

              {/* Ports */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={11} className="text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Node Ports</span>
                </div>
                <div className="space-y-1.5">
                  {selected.ports.map((port) => (
                    <div key={port.name} className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: PORT_COLORS[port.type] }} />
                      <span className="text-xs font-mono">{port.name}</span>
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: PORT_COLORS[port.type] + "15", color: PORT_COLORS[port.type] }}>
                        {port.type}
                      </span>
                      <span className="text-[9px] text-muted-foreground">{port.dir === "in" ? "→ in" : "out →"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code snippet */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Code2 size={11} className="text-muted-foreground" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">HyperTalk ∞ Usage</span>
                </div>
                <pre className="rounded-xl p-4 text-[11px] font-mono leading-relaxed overflow-x-auto"
                  style={{
                    background: "hsl(var(--background))",
                    border: `1px solid ${selected.color}25`,
                    color: selected.color,
                  }}>
                  {selected.snippet}
                </pre>
              </div>

              {/* Add to graph */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setAddedIds((prev) => new Set([...prev, selected.id]));
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: addedIds.has(selected.id)
                    ? "hsl(var(--node-spatial) / 0.15)"
                    : selected.color + "20",
                  color: addedIds.has(selected.id) ? "hsl(var(--node-spatial))" : selected.color,
                  border: `1px solid ${addedIds.has(selected.id) ? "hsl(var(--node-spatial) / 0.4)" : selected.color + "40"}`,
                }}
              >
                {addedIds.has(selected.id) ? (
                  <><span>✓</span> Added to Graph</>
                ) : (
                  <><Plus size={14} /> Add to Graph</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
