import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOOLS = [
  {
    name: "Notion", emoji: "📝", color: "hsl(var(--foreground))",
    imports: ["Block tree", "Databases", "Relations", "Properties"],
    desc: "Full block hierarchy with nested pages, databases, and bidirectional relations.",
  },
  {
    name: "Figma", emoji: "🎨", color: "hsl(var(--node-agent))",
    imports: ["Components", "Token system", "Auto-layout", "Variants"],
    desc: "All components become live atomic nodes. Token names map 1:1 to HyperCard tokens.",
  },
  {
    name: "Miro", emoji: "🗺️", color: "hsl(var(--node-media))",
    imports: ["Spatial layout", "Sticky notes", "Connectors", "Frames"],
    desc: "Boards become 3D Worlds. Spatial positions preserved. Connectors become node edges.",
  },
  {
    name: "Rive", emoji: "⚡", color: "hsl(var(--node-event))",
    imports: ["State machines", "Artboards", "Inputs", "Animations"],
    desc: "State machines map 1:1 to HyperCard state nodes. Animations preserved at 60fps.",
  },
  {
    name: "Spline", emoji: "🌐", color: "hsl(var(--node-spatial))",
    imports: ["3D scenes", "Objects", "Events", "Materials"],
    desc: "3D scenes become embedded World portals. Materials translate to token-driven materials.",
  },
];

function MigrationCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const start = () => {
    if (running || done) return;
    setRunning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setRunning(false);
          setDone(true);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 80);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl p-4 cursor-pointer group transition-all"
      style={{
        background: `linear-gradient(145deg, ${tool.color}08, hsl(var(--card)))`,
        border: `1px solid ${tool.color}${done ? "50" : "25"}`,
      }}
      onClick={start}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${tool.color}15` }}
        >
          {tool.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{tool.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{tool.desc}</div>
        </div>
        {done && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "hsl(var(--node-spatial)/0.15)", color: "hsl(var(--node-spatial))", border: "1px solid hsl(var(--node-spatial)/0.3)" }}
          >
            ✓ Imported
          </motion.div>
        )}
      </div>

      {/* Import types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tool.imports.map((imp) => (
          <span key={imp} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: `${tool.color}12`, color: `${tool.color}cc`, border: `1px solid ${tool.color}20` }}>
            {imp}
          </span>
        ))}
      </div>

      {/* Arrow + progress */}
      <div className="flex items-center gap-2">
        <div className="text-[10px] text-muted-foreground">{tool.name}</div>
        <div className="flex-1 relative h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            style={{ background: done ? "hsl(var(--node-spatial))" : tool.color }}
          />
        </div>
        <div className="text-[10px] font-mono" style={{ color: done ? "hsl(var(--node-spatial))" : tool.color, minWidth: 28, textAlign: "right" }}>
          {done ? "100%" : running ? `${Math.round(progress)}%` : "→"}
        </div>
        <div className="text-[10px] text-muted-foreground">HyperCard ∞</div>
      </div>

      {!running && !done && (
        <div className="text-[10px] text-muted-foreground/50 mt-2 text-center">Click to simulate import</div>
      )}
    </motion.div>
  );
}

export function MigrationSection() {
  return (
    <section className="py-24 px-6 bg-background-mid/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-node-data mb-3">Layer 7</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Bring Your </span>
            <span className="text-gradient">Existing World</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            One-click migration from every major tool. Your spatial context, relationships, and state machines — all preserved.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, i) => (
            <MigrationCard key={tool.name} tool={tool} index={i} />
          ))}
          {/* Teaser card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-4 flex items-center justify-center"
            style={{ border: "1px dashed hsl(var(--border))", minHeight: 120 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">+</div>
              <div className="text-xs text-muted-foreground">More connectors<br />coming in Phase 4</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
