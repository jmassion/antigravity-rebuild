import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Globe, Lock, Star, ArrowRight, X, Plus, ChevronRight, Check } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const WORLDS = [
  { id: "w1", name: "Design OS", category: "Design", desc: "A spatial operating system for product design teams. Cards, components, tokens, and flows — all live.", users: 142, color: "hsl(var(--node-event))", tags: ["Design", "Tokens", "Figma"], featured: true, x: 22, y: 18, related: ["w2", "w3"] },
  { id: "w2", name: "Dev Nexus", category: "Engineering", desc: "Full-stack development world with node-graph IDE, agent pair-programmers, and live WASM execution.", users: 87, color: "hsl(var(--node-data))", tags: ["Code", "Agents", "WASM"], featured: true, x: 58, y: 12, related: ["w1", "w4"] },
  { id: "w3", name: "Narrative Atlas", category: "Creative", desc: "A storytelling world for writers and worldbuilders. Cards as chapters, spatial timelines, voice narration.", users: 234, color: "hsl(var(--node-agent))", tags: ["Stories", "Voice", "3D"], featured: false, x: 78, y: 30, related: ["w1", "w7"] },
  { id: "w4", name: "Quantum Lab", category: "Science", desc: "Scientific visualization world. Data pipelines feed live 3D charts, graphs, and simulation cards.", users: 56, color: "hsl(var(--node-spatial))", tags: ["Data", "Viz", "Science"], featured: false, x: 12, y: 55, related: ["w8"] },
  { id: "w5", name: "Commerce Hub", category: "Business", desc: "End-to-end e-commerce world. Products as cards, Stripe connector, agent-powered customer service.", users: 319, color: "hsl(var(--node-media))", tags: ["Stripe", "Commerce", "CRM"], featured: true, x: 45, y: 58, related: ["w2"] },
  { id: "w6", name: "XR Campus", category: "Education", desc: "Spatial learning environment with 3D textbooks, agent tutors, and collaborative whiteboard worlds.", users: 73, color: "hsl(var(--presence-2))", tags: ["XR", "Education", "WebXR"], featured: false, x: 70, y: 65, related: ["w3"] },
  { id: "w7", name: "Sonic World", category: "Music", desc: "Music production world. Audio cards, live waveform visualization, ElevenLabs voice synthesis.", users: 48, color: "hsl(var(--node-event))", tags: ["Audio", "ElevenLabs", "DAW"], featured: false, x: 30, y: 80, related: ["w3"] },
  { id: "w8", name: "Bio Mesh", category: "Science", desc: "Bioinformatics visualization. Gene sequences as spatial cards, protein networks as node graphs.", users: 22, color: "hsl(var(--node-data))", tags: ["Biology", "Network", "Data"], featured: false, x: 82, y: 82, related: ["w4"] },
];

const FILTERS = ["All", "Public", "Featured", "Design", "Engineering", "Creative", "Science", "Business"];

const TEMPLATES = ["Blank World", "SaaS App", "Portfolio", "Science Lab"];
const AGENTS = ["Builder", "Data", "Review", "Narrator"];
const CATEGORY_OPTIONS = ["Design", "Engineering", "Creative", "Science", "Business", "Education", "Music", "Research"];
const COLORS = [
  "hsl(var(--node-event))", "hsl(var(--node-data))", "hsl(var(--node-agent))",
  "hsl(var(--node-spatial))", "hsl(var(--node-media))", "hsl(var(--presence-2))",
];

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, delay: Math.random() * 3,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, background: "hsl(var(--foreground) / 0.4)" }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 + s.delay, delay: s.delay }}
        />
      ))}
    </div>
  );
}

// Animated portal ring in detail panel
function PortalPreview({ color, onEnter }: { color: string; onEnter: () => void }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    delay: i * 0.2,
  }));

  return (
    <div className="relative flex items-center justify-center" style={{ height: 150 }}>
      {/* Rotating outer ring */}
      <motion.div className="absolute rounded-full border-2"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        style={{ width: 110, height: 110, borderColor: color, borderStyle: "dashed", opacity: 0.5 }} />
      {/* Inner counter-rotating ring */}
      <motion.div className="absolute rounded-full border"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        style={{ width: 76, height: 76, borderColor: color, opacity: 0.7 }} />
      {/* Pulsing glow disc */}
      <motion.div className="absolute rounded-full"
        animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ width: 38, height: 38, background: color, filter: "blur(6px)" }} />
      {/* Orbiting particles */}
      {particles.map((p, i) => (
        <motion.div key={i} className="absolute w-2 h-2 rounded-full"
          animate={{ rotate: [p.angle, p.angle + 360] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.2, ease: "linear", delay: p.delay }}
          style={{ width: 110, height: 110, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
          <div className="w-1.5 h-1.5 rounded-full -mt-0.5" style={{ background: color, opacity: 0.8, boxShadow: `0 0 4px ${color}` }} />
        </motion.div>
      ))}
      <Globe size={16} className="relative z-10" style={{ color }} />
      {/* Enter portal button */}
      <button onClick={onEnter}
        className="absolute bottom-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{ background: `${color}20`, color, border: `1px solid ${color}50` }}>
        Enter Portal <ArrowRight size={11} />
      </button>
    </div>
  );
}

// World creation wizard
function CreateWorldModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Design");
  const [color, setColor] = useState(COLORS[0]);
  const [template, setTemplate] = useState("Blank World");
  const [agents, setAgents] = useState<string[]>(["Builder"]);
  const [visibility, setVisibility] = useState("Public");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createStep, setCreateStep] = useState(0);

  const CREATE_STEPS = ["Initializing world…", "Wiring agent connections…", "Building starter cards…", "World ready ✦"];

  const toggleAgent = (a: string) =>
    setAgents((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);

  const handleCreate = () => {
    setCreating(true);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setCreateStep(s);
      if (s >= CREATE_STEPS.length) {
        clearInterval(interval);
        setCreated(true);
      }
    }, 700);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsl(var(--background) / 0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 24px 80px hsl(var(--primary) / 0.2)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
          <div>
            <h2 className="text-sm font-bold">Create World</h2>
            {!creating && <p className="text-[11px] text-muted-foreground">Step {step} of 4</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          {/* Step indicator */}
          {!creating && (
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 h-1 rounded-full transition-all"
                  style={{ background: s <= step ? "hsl(var(--primary))" : "hsl(var(--border))" }} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Name + Category + Color */}
            {step === 1 && !creating && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <div className="text-xs font-medium mb-1.5">World Name</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome World"
                    className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">Category</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_OPTIONS.map((c) => (
                      <button key={c} onClick={() => setCategory(c)}
                        className="px-2.5 py-1 rounded-full text-xs transition-all"
                        style={{
                          background: category === c ? "hsl(var(--primary) / 0.12)" : "hsl(var(--background))",
                          color: category === c ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                          border: category === c ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                        }}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1.5">Color</div>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button key={c} onClick={() => setColor(c)}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                          background: c,
                          outline: color === c ? `2px solid ${c}` : "none",
                          outlineOffset: 2,
                        }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Template */}
            {step === 2 && !creating && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                <div className="text-xs font-medium mb-3">Choose a starting template</div>
                {TEMPLATES.map((t) => (
                  <button key={t} onClick={() => setTemplate(t)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: template === t ? "hsl(var(--primary) / 0.08)" : "hsl(var(--background))",
                      border: template === t ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                    }}>
                    <div className="text-base">{["⬜", "🚀", "🎨", "🔬"][TEMPLATES.indexOf(t)]}</div>
                    <div>
                      <div className="text-sm font-medium">{t}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {["Start from scratch", "Auth, billing, dashboard", "Portfolio cards & flows", "Data viz & simulation"][TEMPLATES.indexOf(t)]}
                      </div>
                    </div>
                    {template === t && <Check size={14} className="ml-auto" style={{ color: "hsl(var(--primary))" }} />}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 3: Agents */}
            {step === 3 && !creating && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
                <div className="text-xs font-medium mb-3">Select starting agents</div>
                {AGENTS.map((a, i) => {
                  const agentColors = ["hsl(var(--node-event))", "hsl(var(--node-data))", "hsl(var(--node-agent))", "hsl(var(--node-media))"];
                  const selected = agents.includes(a);
                  return (
                    <button key={a} onClick={() => toggleAgent(a)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? `${agentColors[i]}10` : "hsl(var(--background))",
                        border: selected ? `1px solid ${agentColors[i]}50` : "1px solid hsl(var(--border))",
                      }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{ background: agentColors[i] + "20", color: agentColors[i] }}>{a[0]}</div>
                      <div>
                        <div className="text-sm font-medium">{a} Agent</div>
                        <div className="text-[10px] text-muted-foreground">
                          {["Builds and architects", "Processes and analyzes", "Reviews and improves", "Narrates and explains"][i]}
                        </div>
                      </div>
                      {selected && <Check size={13} className="ml-auto" style={{ color: agentColors[i] }} />}
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Step 4: Visibility */}
            {step === 4 && !creating && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div className="text-xs font-medium mb-3">Publishing settings</div>
                {["Public", "Private", "Featured"].map((v) => (
                  <button key={v} onClick={() => setVisibility(v)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: visibility === v ? "hsl(var(--primary) / 0.08)" : "hsl(var(--background))",
                      border: visibility === v ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                    }}>
                    <div className="text-base">{v === "Public" ? <Globe size={16} /> : v === "Private" ? <Lock size={16} /> : <Star size={16} />}</div>
                    <div>
                      <div className="text-sm font-medium">{v}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {v === "Public" ? "Anyone can discover and join" : v === "Private" ? "Only invited users" : "Highlighted in the worlds browser"}
                      </div>
                    </div>
                    {visibility === v && <Check size={14} className="ml-auto" style={{ color: "hsl(var(--primary))" }} />}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Creating progress */}
            {creating && !created && (
              <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-2">
                <div className="text-sm font-semibold text-center mb-4">Creating your world…</div>
                {CREATE_STEPS.map((s, i) => (
                  <motion.div key={s} className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: createStep > i ? 1 : 0.25, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: createStep > i ? "hsl(var(--node-spatial) / 0.2)" : "hsl(var(--border))", border: `1px solid ${createStep > i ? "hsl(var(--node-spatial) / 0.5)" : "hsl(var(--border))"}` }}>
                      {createStep > i ? <Check size={10} style={{ color: "hsl(var(--node-spatial))" }} /> :
                        createStep === i + 1 ? <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--primary))" }} /> : null}
                    </div>
                    <span className="text-sm" style={{ color: createStep > i ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{s}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Created */}
            {created && (
              <motion.div key="created" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: color + "20", border: `2px solid ${color}`, boxShadow: `0 0 24px ${color}40` }}>
                  <Globe size={24} style={{ color }} />
                </div>
                <div className="text-base font-bold mb-1">{name || "Untitled World"}</div>
                <div className="text-xs text-muted-foreground mb-4">{category} · {visibility}</div>
                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 gradient-primary text-primary-foreground">
                  Enter World <ArrowRight size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        {!creating && (
          <div className="flex items-center gap-2 px-5 pb-5">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2 rounded-lg text-sm transition-all"
                style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                Back
              </button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 gradient-primary text-primary-foreground"
                disabled={step === 1 && !name}>
                Next <ChevronRight size={13} />
              </button>
            ) : (
              <button onClick={handleCreate}
                className="flex-1 py-2 rounded-lg text-sm font-semibold gradient-primary text-primary-foreground flex items-center justify-center gap-1">
                Create World <Plus size={13} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Worlds() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof WORLDS[0] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const init: Record<string, number> = {};
    WORLDS.forEach((w) => (init[w.id] = w.users));
    setCounts(init);
    const interval = setInterval(() => {
      setCounts((prev) => {
        const next = { ...prev };
        const id = WORLDS[Math.floor(Math.random() * WORLDS.length)].id;
        const delta = Math.random() > 0.4 ? 1 : -1;
        next[id] = Math.max(1, prev[id] + delta);
        return next;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const filtered = WORLDS.filter((w) => {
    if (filter === "All") return true;
    if (filter === "Featured") return w.featured;
    if (filter === "Public") return true;
    return w.category === filter;
  });

  // SVG connection lines between related worlds
  const getWorldPos = (id: string) => {
    const w = WORLDS.find((x) => x.id === id);
    return w ? { x: w.x, y: w.y } : null;
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <NavBar />
      <div className="flex-1 relative overflow-hidden pt-12">
        <StarField />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 70%)" }} />

        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.3 }}>
          {WORLDS.flatMap((w) =>
            w.related.map((relId) => {
              const from = getWorldPos(w.id);
              const to = getWorldPos(relId);
              if (!from || !to || w.id > relId) return null;
              return (
                <line key={`${w.id}-${relId}`}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={w.color} strokeWidth="1"
                  strokeDasharray="4 6"
                  style={{ animation: `dash 3s linear infinite` }}
                />
              );
            })
          )}
        </svg>

        {/* Header */}
        <div className="relative z-10 text-center pt-8 pb-4 px-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Spatial Browser</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-foreground">Explore </span>
              <span className="text-gradient">Worlds</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {Object.values(counts).reduce((a, b) => a + b, 0).toLocaleString()} users across {WORLDS.length} active worlds
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: filter === f ? "hsl(var(--primary) / 0.15)" : "hsl(var(--card) / 0.6)",
                  color: filter === f ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: filter === f ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border) / 0.5)",
                  backdropFilter: "blur(8px)",
                }}>
                {f}
              </button>
            ))}
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all gradient-primary text-primary-foreground">
              <Plus size={11} /> Create World
            </button>
          </div>
        </div>

        {/* World bubbles */}
        <div className="relative z-10 flex-1" style={{ height: "calc(100% - 160px)" }}>
          {filtered.map((world, i) => {
            const isHovered = hovered === world.id;
            const count = counts[world.id] ?? world.users;
            return (
              <motion.div key={world.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                className="absolute cursor-pointer"
                style={{ left: `${world.x}%`, top: `${world.y}%`, transform: "translate(-50%, -50%)" }}
                onMouseEnter={() => setHovered(world.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(world)}>
                {/* Outer glow */}
                <motion.div animate={{ scale: isHovered ? 1.3 : 1, opacity: isHovered ? 0.5 : 0.2 }}
                  className="absolute inset-0 rounded-full -m-3"
                  style={{ background: world.color, filter: "blur(8px)" }} />

                {/* Bubble */}
                <motion.div animate={{ scale: isHovered ? 1.15 : 1 }}
                  className="relative rounded-full flex flex-col items-center justify-center text-center transition-shadow"
                  style={{
                    width: world.featured ? 90 : 68,
                    height: world.featured ? 90 : 68,
                    background: `radial-gradient(circle at 35% 35%, ${world.color}30, ${world.color}10)`,
                    border: `1.5px solid ${world.color}60`,
                    boxShadow: isHovered ? `0 0 32px ${world.color}60` : `0 0 12px ${world.color}30`,
                  }}>
                  <Globe size={world.featured ? 18 : 14} style={{ color: world.color }} />
                  <div className="text-[9px] font-semibold mt-0.5 px-1 leading-tight" style={{ color: world.color }}>
                    {world.name.split(" ")[0]}
                  </div>
                </motion.div>

                {/* User count badge */}
                <motion.div className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] font-mono"
                  style={{ background: "hsl(var(--background) / 0.9)", border: `1px solid ${world.color}40`, color: world.color, backdropFilter: "blur(8px)" }}>
                  <Users size={7} />
                  <motion.span key={count} initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }}>{count}</motion.span>
                </motion.div>

                {/* Hover tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 rounded-xl p-3 w-48 pointer-events-none"
                      style={{ background: "hsl(var(--card) / 0.95)", border: `1px solid ${world.color}40`, backdropFilter: "blur(16px)", boxShadow: `0 8px 32px ${world.color}30` }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: world.color }}>{world.name}</div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed">{world.desc}</div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {world.tags.map((t) => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${world.color}15`, color: world.color }}>{t}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* World detail panel */}
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className="absolute right-0 top-12 bottom-0 w-80 z-30 flex flex-col"
              style={{ background: "hsl(var(--card) / 0.95)", backdropFilter: "blur(24px)", borderLeft: `1px solid ${selected.color}30` }}>
              <div className="p-5 flex-1 overflow-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: selected.color }}>{selected.category}</div>
                    <h2 className="text-lg font-bold">{selected.name}</h2>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Animated portal preview */}
                <div className="rounded-xl mb-4 overflow-hidden"
                  style={{ border: `1px solid ${selected.color}25`, background: `radial-gradient(circle at 50% 50%, ${selected.color}10, transparent)` }}>
                  <PortalPreview color={selected.color} onEnter={() => navigate("/workspace")} />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selected.desc}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Users size={13} style={{ color: selected.color }} />
                  <motion.span key={counts[selected.id]} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                    className="text-sm font-semibold" style={{ color: selected.color }}>
                    {counts[selected.id] ?? selected.users}
                  </motion.span>
                  <span className="text-xs text-muted-foreground">active users</span>
                  {selected.featured && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "hsl(var(--node-media) / 0.15)", color: "hsl(var(--node-media))" }}>
                      <Star size={8} /> Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selected.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: `${selected.color}12`, color: selected.color, border: `1px solid ${selected.color}25` }}>{t}</span>
                  ))}
                </div>

                <button onClick={() => navigate("/workspace")}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: `${selected.color}20`, color: selected.color, border: `1px solid ${selected.color}40` }}>
                  Enter World <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create world modal */}
      <AnimatePresence>
        {showCreate && <CreateWorldModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>

      <style>{`@keyframes dash { to { stroke-dashoffset: -20; } }`}</style>
    </div>
  );
}
