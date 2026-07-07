import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Hexagon, Zap, ArrowRight, Network, Layers, BarChart2, Mic, ShoppingCart, BookOpen, Cpu, Box, Sparkles, Send, RefreshCw } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const TEMPLATES = [
  { id: "blank", name: "Blank World", icon: Box, desc: "Start from scratch with a clean 3D canvas.", nodes: 0, color: "hsl(var(--muted-foreground))", preview: "⬜" },
  { id: "saas", name: "SaaS App", icon: Zap, desc: "Auth, billing, dashboard, settings — all wired.", nodes: 28, color: "hsl(var(--node-event))", preview: "🚀" },
  { id: "portfolio", name: "Portfolio", icon: Layers, desc: "3D portfolio with animated project cards.", nodes: 14, color: "hsl(var(--node-media))", preview: "🎨" },
  { id: "dashboard", name: "Data Dashboard", icon: BarChart2, desc: "Live data cards, charts, and filter nodes.", nodes: 21, color: "hsl(var(--node-data))", preview: "📊" },
  { id: "story", name: "Storytelling", icon: BookOpen, desc: "Cards as chapters, spatial timeline, voice narration.", nodes: 11, color: "hsl(var(--node-agent))", preview: "📖" },
  { id: "science", name: "Science Lab", icon: Cpu, desc: "Data pipelines, simulation cards, 3D charts.", nodes: 19, color: "hsl(var(--node-spatial))", preview: "🔬" },
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingCart, desc: "Products as cards, Stripe connector, CRM.", nodes: 32, color: "hsl(var(--node-media))", preview: "🛍️" },
  { id: "learning", name: "Learning Platform", icon: Sparkles, desc: "3D textbooks, agent tutors, live whiteboards.", nodes: 24, color: "hsl(var(--presence-2))", preview: "🎓" },
];

const RECENT_WORLDS = [
  { name: "Design OS", users: 142, color: "hsl(var(--node-event))", edited: "2m ago", emoji: "🎨" },
  { name: "Dev Nexus", users: 87, color: "hsl(var(--node-data))", edited: "18m ago", emoji: "💻" },
  { name: "Commerce Hub", users: 319, color: "hsl(var(--node-media))", edited: "1h ago", emoji: "🛍️" },
  { name: "Narrative Atlas", users: 234, color: "hsl(var(--node-agent))", edited: "3h ago", emoji: "📖" },
  { name: "Quantum Lab", users: 56, color: "hsl(var(--node-spatial))", edited: "1d ago", emoji: "🔬" },
  { name: "XR Campus", users: 73, color: "hsl(var(--presence-2))", edited: "2d ago", emoji: "🎓" },
];

const PROMPT_SUGGESTIONS = [
  "A dashboard that tracks my SaaS metrics with live charts and alerts",
  "A portfolio world showcasing 3D project cards with case studies",
  "A checkout flow connected to Stripe with animated confirmation",
  "A team wiki where each page is a card connected to its authors",
];

// Animated mini canvas inside each template card
function TemplatePreviewMini({ color, emoji }: { color: string; emoji: string }) {
  return (
    <div className="relative h-24 rounded-xl overflow-hidden flex items-center justify-center"
      style={{ background: `radial-gradient(circle at 40% 40%, ${color}20, ${color}05)`, border: `1px solid ${color}25` }}>
      <motion.div animate={{ scale: [1, 1.06, 1], rotate: [0, 2, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="text-3xl select-none">{emoji}</motion.div>
      {/* Decorative dots */}
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
          style={{
            width: 4, height: 4, background: color,
            left: `${20 + i * 30}%`, top: `${20 + i * 20}%`,
          }} />
      ))}
    </div>
  );
}

// From-prompt AI builder section
function FromPrompt() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamedNodes, setStreamedNodes] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getGeneratedNodes = (p: string): string[] => {
    if (p.toLowerCase().includes("checkout") || p.toLowerCase().includes("stripe")) {
      return ["PaymentForm card", "Stripe connector", "Charge node", "Success card", "Error handler", "Confirmation stack"];
    }
    if (p.toLowerCase().includes("dashboard") || p.toLowerCase().includes("analytics")) {
      return ["MetricsCard", "Revenue chart node", "User count card", "Alerts node", "Filter connector", "DataReview agent"];
    }
    return ["Input card", "Logic node", "Agent connector", "Output card", "State manager", "Transition FX"];
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setStreamedNodes([]);
    setDone(false);
    const nodes = getGeneratedNodes(prompt);
    let i = 0;
    streamRef.current = setInterval(() => {
      if (i < nodes.length) {
        setStreamedNodes((prev) => [...prev, nodes[i]]);
        i++;
      } else {
        clearInterval(streamRef.current!);
        setGenerating(false);
        setDone(true);
      }
    }, 400);
  };

  useEffect(() => () => { if (streamRef.current) clearInterval(streamRef.current); }, []);

  return (
    <div className="rounded-2xl p-5 glass" style={{ border: "1px solid hsl(var(--primary) / 0.2)" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
          <Sparkles size={13} className="text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold">Build from Prompt</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-1"
          style={{ background: "hsl(var(--node-agent) / 0.12)", color: "hsl(var(--node-agent))", border: "1px solid hsl(var(--node-agent) / 0.25)" }}>
          AI
        </span>
      </div>
      <div className="relative mb-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
          placeholder="Describe what you want to build…"
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-border focus:outline-none focus:border-primary/50 transition-colors resize-none placeholder:text-muted-foreground"
        />
        <button onClick={handleGenerate} disabled={generating || !prompt.trim()}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: generating ? "hsl(var(--muted))" : "hsl(var(--primary) / 0.15)",
            color: generating ? "hsl(var(--muted-foreground))" : "hsl(var(--primary))",
            border: `1px solid ${generating ? "transparent" : "hsl(var(--primary) / 0.3)"}`,
          }}>
          {generating ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />}
          {generating ? "Building…" : "Build"}
        </button>
      </div>

      {/* Suggestions */}
      {!generating && !done && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PROMPT_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => setPrompt(s)}
              className="text-[10px] px-2 py-1 rounded-full transition-colors hover:bg-accent truncate max-w-full"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              {s.length > 40 ? s.slice(0, 40) + "…" : s}
            </button>
          ))}
        </div>
      )}

      {/* Streaming node output */}
      <AnimatePresence>
        {(generating || done) && streamedNodes.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Network size={9} /> Generating nodes
              {generating && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))" }} />}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {streamedNodes.map((n, i) => (
                <motion.span key={n} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="text-xs px-2 py-0.5 rounded-lg"
                  style={{ background: "hsl(var(--node-data) / 0.12)", color: "hsl(var(--node-data))", border: "1px solid hsl(var(--node-data) / 0.25)" }}>
                  {n}
                </motion.span>
              ))}
            </div>
            {done && (
              <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold gradient-primary text-primary-foreground">
                Open in Workspace <ArrowRight size={13} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Studio() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <div className="flex-1 pt-12">
        {/* Header */}
        <div className="px-6 py-10 relative overflow-hidden">
          <div className="absolute inset-0 canvas-grid opacity-15 pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Creation Studio</div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-foreground">Start </span>
                <span className="text-gradient">Building</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Pick a template, describe your vision, or open a recent world.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Template grid */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Layers size={14} className="text-muted-foreground" /> Starter Templates
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TEMPLATES.map((t) => {
                    const Icon = t.icon;
                    const selected = selectedTemplate === t.id;
                    return (
                      <motion.div key={t.id}
                        whileHover={{ y: -2 }}
                        onClick={() => setSelectedTemplate(selected ? null : t.id)}
                        className="rounded-xl p-3 cursor-pointer transition-all"
                        style={{
                          background: selected ? `${t.color}10` : "hsl(var(--card))",
                          border: selected ? `1px solid ${t.color}50` : "1px solid hsl(var(--border))",
                          boxShadow: selected ? `0 4px 20px ${t.color}20` : "none",
                        }}>
                        <TemplatePreviewMini color={t.color} emoji={t.preview} />
                        <div className="mt-3">
                          <div className="flex items-center gap-1 mb-1">
                            <Icon size={11} style={{ color: t.color }} />
                            <span className="text-xs font-semibold">{t.name}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{t.desc}</p>
                          {t.nodes > 0 && (
                            <div className="mt-2 text-[9px]" style={{ color: t.color }}>
                              <Network size={8} className="inline mr-1" />{t.nodes} nodes included
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {selectedTemplate && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="mt-3">
                      {(() => {
                        const t = TEMPLATES.find((x) => x.id === selectedTemplate)!;
                        return (
                          <button onClick={() => navigate("/workspace")}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all gradient-primary text-primary-foreground">
                            Start Building with "{t.name}" <ArrowRight size={14} />
                          </button>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* From Prompt */}
              <FromPrompt />
            </div>

            {/* RIGHT: Recent worlds */}
            <div>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Box size={14} className="text-muted-foreground" /> Recent Worlds
              </h2>
              <div className="space-y-2">
                {RECENT_WORLDS.map((w, i) => (
                  <motion.button key={w.name}
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 2 }}
                    onClick={() => navigate("/workspace")}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-accent group"
                    style={{ border: "1px solid hsl(var(--border))" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                      style={{ background: w.color + "20", border: `1px solid ${w.color}30` }}>{w.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{w.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{w.users} users</span>
                        <span>·</span>
                        <span>{w.edited}</span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </motion.button>
                ))}
              </div>

              {/* Quick actions */}
              <div className="mt-6 space-y-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Actions</h2>
                {[
                  { label: "Node Editor", path: "/nodes", icon: Network, color: "hsl(var(--node-data))" },
                  { label: "HyperTalk IDE", path: "/hypertalk", icon: Zap, color: "hsl(var(--node-event))" },
                  { label: "Browse Marketplace", path: "/marketplace", icon: Layers, color: "hsl(var(--node-agent))" },
                  { label: "Read Docs", path: "/docs", icon: BookOpen, color: "hsl(var(--node-spatial))" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <button key={a.label} onClick={() => navigate(a.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-accent group"
                      style={{ border: "1px solid hsl(var(--border))" }}>
                      <Icon size={13} style={{ color: a.color }} />
                      <span>{a.label}</span>
                      <ArrowRight size={11} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
