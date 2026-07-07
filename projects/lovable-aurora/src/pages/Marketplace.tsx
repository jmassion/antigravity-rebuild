import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Download, Play, X, Check, Filter, ChevronLeft, ChevronRight, Network, Box } from "lucide-react";
import { NavBar } from "@/components/NavBar";

const TAGS = ["All", "Nodes", "Templates", "Agents", "Worlds", "Connectors"];

type ItemType = "node" | "template" | "agent" | "connector" | "world";

interface MarketItem {
  id: string; name: string; desc: string; type: ItemType;
  creator: string; installs: number; rating: number; color: string;
  featured?: boolean; price: "free" | "paid";
  createdAt: string; updatedAt: string;
  initials: string;
}

const ITEMS: MarketItem[] = [
  { id: "m1", name: "Auth Flow Template", desc: "Complete login/signup/reset flow with animated cards, validation, and Supabase connector.", type: "template", creator: "hypercard", installs: 4201, rating: 4.9, color: "hsl(var(--node-event))", featured: true, price: "free", createdAt: "Jan 2025", updatedAt: "2d ago", initials: "HC" },
  { id: "m2", name: "GPT-4o Agent Node", desc: "Drop-in agent node powered by OpenAI GPT-4o. Typed inputs and streaming output ports.", type: "agent", creator: "openai-nodes", installs: 8923, rating: 4.8, color: "hsl(var(--node-agent))", featured: true, price: "free", createdAt: "Dec 2024", updatedAt: "1d ago", initials: "ON" },
  { id: "m3", name: "3D Dashboard World", desc: "Spatial analytics dashboard world with live data cards, chart nodes, and filter connectors.", type: "world", creator: "spatialworks", installs: 1337, rating: 4.7, color: "hsl(var(--node-spatial))", featured: true, price: "paid", createdAt: "Feb 2025", updatedAt: "5d ago", initials: "SW" },
  { id: "m4", name: "Stripe Connector", desc: "Full Stripe connector node — payments, subscriptions, webhooks, customer cards.", type: "connector", creator: "finstack", installs: 3102, rating: 4.6, color: "hsl(var(--node-media))", price: "free", createdAt: "Nov 2024", updatedAt: "1w ago", initials: "FS" },
  { id: "m5", name: "Notion Import Node", desc: "Imports Notion pages as HyperCard stacks. Block-to-card mapping with live sync.", type: "connector", creator: "importlab", installs: 2890, rating: 4.5, color: "hsl(var(--node-data))", price: "free", createdAt: "Oct 2024", updatedAt: "3d ago", initials: "IL" },
  { id: "m6", name: "Builder Agent v2", desc: "Second-gen Builder Agent with architectural planning, code review, and iterative refinement.", type: "agent", creator: "hypercard", installs: 5001, rating: 4.9, color: "hsl(var(--node-agent))", price: "free", createdAt: "Jan 2025", updatedAt: "6h ago", initials: "HC" },
  { id: "m7", name: "Portfolio Template", desc: "A stunning 3D portfolio world with animated project cards, case study flows, and contact form.", type: "template", creator: "designkits", installs: 7210, rating: 4.7, color: "hsl(var(--node-event))", price: "paid", createdAt: "Sep 2024", updatedAt: "2w ago", initials: "DK" },
  { id: "m8", name: "Voice Command Macro", desc: "Expand your voice vocabulary: 50+ pre-built commands for spatial design tasks.", type: "node", creator: "voicelab", installs: 1820, rating: 4.4, color: "hsl(var(--node-agent))", price: "free", createdAt: "Nov 2024", updatedAt: "4d ago", initials: "VL" },
  { id: "m9", name: "Physics World Node", desc: "Adds Rapier physics to any world — cards bounce, stack, and collide in real time.", type: "node", creator: "physlab", installs: 940, rating: 4.3, color: "hsl(var(--node-spatial))", price: "paid", createdAt: "Dec 2024", updatedAt: "1w ago", initials: "PL" },
  { id: "m10", name: "Figma Importer", desc: "One-click Figma → HyperCard. Components become nodes, auto-layout maps to stack rules.", type: "connector", creator: "importlab", installs: 6300, rating: 4.8, color: "hsl(var(--node-data))", price: "free", createdAt: "Aug 2024", updatedAt: "3d ago", initials: "IL" },
  { id: "m11", name: "SaaS Boilerplate World", desc: "Full SaaS world template: auth, billing, dashboard, settings — all wired and ready.", type: "world", creator: "saaskit", installs: 2100, rating: 4.6, color: "hsl(var(--node-spatial))", price: "paid", createdAt: "Jan 2025", updatedAt: "1d ago", initials: "SK" },
  { id: "m12", name: "Data Review Agent", desc: "An agent that reviews data nodes for anomalies, generates reports, and flags outliers.", type: "agent", creator: "dataflow", installs: 1540, rating: 4.5, color: "hsl(var(--node-agent))", price: "free", createdAt: "Oct 2024", updatedAt: "5h ago", initials: "DF" },
];

const TYPE_COLORS: Record<ItemType, string> = {
  node: "hsl(var(--node-data))", template: "hsl(var(--node-event))",
  agent: "hsl(var(--node-agent))", connector: "hsl(var(--node-media))", world: "hsl(var(--node-spatial))",
};

const INSTALL_STAGES = ["Installing…", "Wiring Ports…", "Ready ✓"];
const INSTALL_COLORS = ["hsl(var(--node-data))", "hsl(var(--node-spatial))", "hsl(var(--node-agent))"];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={10} style={{ fill: s <= Math.floor(rating) ? "hsl(var(--node-media))" : "transparent", color: "hsl(var(--node-media))" }} />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

function ItemCard({ item, onPreview }: { item: MarketItem; onPreview: (item: MarketItem) => void }) {
  const [installStage, setInstallStage] = useState(-1);
  const [hovered, setHovered] = useState(false);

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (installStage >= 0) return;
    setInstallStage(0);
    setTimeout(() => setInstallStage(1), 900);
    setTimeout(() => setInstallStage(2), 1800);
  };

  const stageColor = installStage >= 0 ? INSTALL_COLORS[Math.min(installStage, 2)] : item.color;
  const stageLabel = installStage >= 0 ? INSTALL_STAGES[Math.min(installStage, 2)] : "Install";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200"
      style={{
        background: "hsl(var(--card))",
        border: hovered ? `1px solid ${item.color}50` : "1px solid hsl(var(--border))",
        boxShadow: hovered ? `0 4px 20px ${item.color}15` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider"
          style={{ background: `${TYPE_COLORS[item.type]}15`, color: TYPE_COLORS[item.type] }}>{item.type}</span>
        <span className="text-[10px] text-muted-foreground">{item.price === "paid" ? "💎 Paid" : "✓ Free"}</span>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
      </div>

      {/* Creator info — expands on hover */}
      <AnimatePresence>
        {hovered ? (
          <motion.div key="expanded" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="flex items-center gap-2 py-1 border-t border-dashed" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ background: item.color + "25", color: item.color }}>{item.initials}</div>
              <div>
                <div className="text-[10px] font-medium">{item.creator}</div>
                <div className="text-[9px] text-muted-foreground">Created {item.createdAt} · Updated {item.updatedAt}</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="collapsed" className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: item.color + "20", color: item.color }}>{item.initials[0]}</div>
            <span className="text-[10px] text-muted-foreground">{item.creator}</span>
            <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
              <Download size={9} /> {item.installs.toLocaleString()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <RatingStars rating={item.rating} />

      <div className="flex gap-2 mt-1">
        <button onClick={(e) => { e.stopPropagation(); onPreview(item); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors"
          style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
          <Play size={10} /> Preview
        </button>
        <motion.button onClick={handleInstall} whileTap={{ scale: 0.96 }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all overflow-hidden relative"
          style={{
            background: `${stageColor}15`,
            border: `1px solid ${stageColor}40`,
            color: stageColor,
          }}>
          {installStage >= 0 && installStage < 2 && (
            <motion.div className="absolute inset-0 origin-left"
              initial={{ scaleX: 0 }} animate={{ scaleX: installStage === 0 ? 0.4 : 0.85 }}
              transition={{ duration: 0.8 }}
              style={{ background: stageColor + "20" }} />
          )}
          <span className="relative z-10 flex items-center gap-1">
            {installStage === 2 ? <><Check size={10} /> {stageLabel}</> : <><Download size={10} /> {stageLabel}</>}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// Featured carousel
function FeaturedCarousel({ items }: { items: MarketItem[] }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % items.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length]);

  const item = items[idx];
  return (
    <div className="relative rounded-2xl overflow-hidden mb-10"
      style={{ background: `linear-gradient(135deg, ${item.color}12, hsl(var(--card)))`, border: `1px solid ${item.color}30` }}>
      <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: `${item.color}20` }}>
        <Star size={13} style={{ color: "hsl(var(--node-media))", fill: "hsl(var(--node-media))" }} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Featured</span>
        <div className="flex gap-1.5 ml-auto">
          <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronLeft size={13} className="text-muted-foreground" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % items.length)}
            className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronRight size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className="p-5 flex flex-col md:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: item.color + "20", border: `1px solid ${item.color}40` }}>
            <div className="text-2xl">{item.type === "agent" ? "🤖" : item.type === "world" ? "🌐" : item.type === "connector" ? "🔌" : item.type === "template" ? "📄" : "⬡"}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase"
                style={{ background: `${TYPE_COLORS[item.type]}20`, color: TYPE_COLORS[item.type] }}>{item.type}</span>
              <span className="text-[10px] text-muted-foreground">{item.price === "paid" ? "💎 Paid" : "✓ Free"}</span>
            </div>
            <h3 className="text-base font-bold mb-1">{item.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed max-w-lg">{item.desc}</p>
            <div className="flex items-center gap-4">
              <RatingStars rating={item.rating} />
              <span className="text-xs text-muted-foreground">{item.installs.toLocaleString()} installs</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 pb-3">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="rounded-full transition-all" style={{ width: i === idx ? 16 : 6, height: 6, background: i === idx ? item.color : "hsl(var(--border))" }} />
        ))}
      </div>
    </div>
  );
}

// Category sidebar tree
const CATEGORY_TREE = [
  { name: "All Items", type: null, count: 12 },
  { name: "Nodes", type: "node", count: 2, children: [{ name: "Physics", count: 1 }, { name: "Voice", count: 1 }] },
  { name: "Templates", type: "template", count: 2, children: [{ name: "Auth", count: 1 }, { name: "Portfolio", count: 1 }] },
  { name: "Agents", type: "agent", count: 3, children: [{ name: "GPT-4o", count: 1 }, { name: "Builder", count: 1 }, { name: "Data", count: 1 }] },
  { name: "Connectors", type: "connector", count: 3, children: [{ name: "Payments", count: 1 }, { name: "Design", count: 2 }] },
  { name: "Worlds", type: "world", count: 2, children: [{ name: "Dashboard", count: 1 }, { name: "SaaS", count: 1 }] },
];

function CategoryTree({ activeTag, onSelect }: { activeTag: string; onSelect: (t: string) => void }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  return (
    <div className="space-y-0.5">
      {CATEGORY_TREE.map((cat) => {
        const isActive = activeTag === (cat.name === "All Items" ? "All" : cat.name);
        const isExp = expanded.includes(cat.name);
        return (
          <div key={cat.name}>
            <button
              onClick={() => {
                onSelect(cat.name === "All Items" ? "All" : cat.name);
                if (cat.children) setExpanded((e) => isExp ? e.filter((x) => x !== cat.name) : [...e, cat.name]);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: isActive ? "hsl(var(--primary) / 0.1)" : "transparent",
                color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.8)",
              }}>
              {cat.children && (
                <ChevronRight size={10} className="flex-shrink-0 transition-transform" style={{ transform: isExp ? "rotate(90deg)" : "rotate(0)" }} />
              )}
              <span className="flex-1 text-left">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground">{cat.count}</span>
            </button>
            <AnimatePresence>
              {isExp && cat.children && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pl-5">
                  {cat.children.map((child) => (
                    <div key={child.name} className="flex items-center gap-2 px-3 py-1 text-[11px] text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="flex-1">{child.name}</span>
                      <span className="text-[10px]">{child.count}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// Live preview modal with node graph
function PreviewModal({ item, onClose }: { item: MarketItem; onClose: () => void }) {
  const mockNodes = [
    { label: "Input", x: 10, y: 40, color: "hsl(var(--node-event))" },
    { label: item.name.split(" ")[0], x: 120, y: 25, color: item.color },
    { label: "Output", x: 240, y: 40, color: "hsl(var(--node-data))" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "hsl(var(--background) / 0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        className="rounded-2xl w-full max-w-lg overflow-hidden"
        style={{ background: "hsl(var(--card))", border: `1px solid ${item.color}40`, boxShadow: `0 24px 80px ${item.color}20` }}
        onClick={(e) => e.stopPropagation()}>

        {/* Chrome */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-medium" style={{ color: item.color }}>{item.type}</span>
            <span className="text-sm font-bold">{item.name}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent">
            <X size={14} />
          </button>
        </div>

        {/* 3-panel mini layout */}
        <div className="grid grid-cols-3" style={{ borderBottom: "1px solid hsl(var(--border))", height: 160 }}>
          {/* Node graph */}
          <div className="p-3 canvas-dots relative col-span-2 overflow-hidden">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1"><Network size={8} /> Graph</div>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 28 }}>
              <path d={`M 80 60 C 120 60, 120 45, 170 45`} fill="none" stroke={item.color} strokeWidth="1.5" strokeOpacity="0.5" />
              <path d={`M 190 45 C 220 45, 220 60, 260 60`} fill="none" stroke="hsl(var(--node-data))" strokeWidth="1.5" strokeOpacity="0.5" />
            </svg>
            <div className="relative flex items-center gap-4 pt-4">
              {mockNodes.map((n) => (
                <div key={n.label} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
                  style={{ background: `${n.color}15`, border: `1px solid ${n.color}40`, color: n.color }}>{n.label}</div>
              ))}
            </div>
          </div>
          {/* Live demo */}
          <div className="p-3 flex flex-col items-center justify-center gap-2">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Box size={8} /> Demo</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: item.color + "20", border: `1px solid ${item.color}40` }}>
              <div className="text-lg">{item.type === "agent" ? "🤖" : item.type === "world" ? "🌐" : item.type === "connector" ? "🔌" : item.type === "template" ? "📄" : "⬡"}</div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center">Live in workspace</div>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
          <div className="flex items-center gap-3 mb-4">
            <RatingStars rating={item.rating} />
            <span className="text-xs text-muted-foreground">{item.installs.toLocaleString()} installs</span>
            <span className="ml-auto text-xs">{item.price === "paid" ? "💎 Paid" : "✓ Free"}</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 gradient-primary text-primary-foreground"
              onClick={onClose}>
              <Download size={14} /> Install to World
            </button>
            <button className="py-2.5 px-4 rounded-xl text-sm transition-colors hover:bg-accent"
              style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
              onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [preview, setPreview] = useState<MarketItem | null>(null);

  const filtered = ITEMS.filter((item) => {
    const tagMap: Record<string, ItemType[]> = {
      "Nodes": ["node"], "Templates": ["template"], "Agents": ["agent"],
      "Worlds": ["world"], "Connectors": ["connector"],
    };
    const matchTag = activeTag === "All" || (tagMap[activeTag]?.includes(item.type)) || item.type === activeTag.toLowerCase().replace(/s$/, "");
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const featured = ITEMS.filter((i) => i.featured);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-12">
        {/* Hero */}
        <div className="px-6 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 canvas-grid opacity-20 pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Marketplace</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Build Faster with </span>
              <span className="text-gradient">Components</span>
            </h1>
            <p className="text-muted-foreground mb-6 text-sm">
              Browse {ITEMS.length}+ nodes, templates, agents, and connectors built by the HyperCard community.
            </p>
            <div className="relative max-w-md mx-auto mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components, agents, connectors…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-card border border-border focus:outline-none focus:border-primary/50 transition-colors" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {TAGS.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: activeTag === tag ? "hsl(var(--primary) / 0.12)" : "hsl(var(--card))",
                    color: activeTag === tag ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    border: activeTag === tag ? "1px solid hsl(var(--primary) / 0.3)" : "1px solid hsl(var(--border))",
                  }}>{tag}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-20 flex gap-6">
          {/* Category sidebar */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-16 rounded-xl p-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Categories</div>
              <CategoryTree activeTag={activeTag} onSelect={setActiveTag} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Featured carousel */}
            {activeTag === "All" && !search && <FeaturedCarousel items={featured} />}

            {/* Grid */}
            <div className="flex items-center gap-2 mb-4">
              <Filter size={13} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold">{filtered.length} results</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onPreview={setPreview} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {preview && <PreviewModal item={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}
