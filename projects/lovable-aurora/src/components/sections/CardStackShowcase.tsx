import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type StackMode = "fan" | "orbit" | "timeline" | "grid";

const CARDS = [
  { id: 1, title: "User Profile", type: "data", color: "hsl(var(--node-data))" },
  { id: 2, title: "Auth Flow", type: "event", color: "hsl(var(--node-event))" },
  { id: 3, title: "3D Viewport", type: "spatial", color: "hsl(var(--node-spatial))" },
  { id: 4, title: "AI Builder", type: "agent", color: "hsl(var(--node-agent))" },
  { id: 5, title: "Media Card", type: "media", color: "hsl(var(--node-media))" },
];

function getCardTransform(mode: StackMode, i: number, total: number) {
  switch (mode) {
    case "fan": {
      const spread = 30;
      const angle = ((i - (total - 1) / 2) / (total - 1)) * spread;
      return { x: (i - 2) * 18, y: Math.abs(i - 2) * 12, rotate: angle, scale: 1 - Math.abs(i - 2) * 0.04, zIndex: total - Math.abs(i - 2) };
    }
    case "orbit": {
      const angle = (i / total) * 360;
      const r = 80;
      const rad = (angle * Math.PI) / 180;
      return { x: Math.cos(rad) * r, y: Math.sin(rad) * r * 0.4, rotate: angle * 0.3, scale: 0.85 + (Math.cos(rad) * 0.15), zIndex: Math.round(Math.cos(rad) * 10) + 10 };
    }
    case "timeline": {
      return { x: (i - 2) * 30, y: -i * 8, rotate: 0, scale: 1 - i * 0.04, zIndex: total - i };
    }
    case "grid": {
      const col = i % 3;
      const row = Math.floor(i / 3);
      return { x: (col - 1) * 90, y: (row - 0.3) * 60, rotate: 0, scale: 0.82, zIndex: 1 };
    }
  }
}

function CardItem({ card, mode, index, total }: { card: typeof CARDS[0]; mode: StackMode; index: number; total: number }) {
  const t = getCardTransform(mode, index, total);
  return (
    <motion.div
      layout
      animate={{ x: t.x, y: t.y, rotate: t.rotate, scale: t.scale, zIndex: t.zIndex }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="absolute rounded-xl cursor-pointer"
      style={{
        width: 130,
        height: 80,
        background: `linear-gradient(145deg, ${card.color}18, hsl(var(--card)))`,
        border: `1px solid ${card.color}40`,
        boxShadow: `0 4px 24px ${card.color}20`,
        left: "50%",
        top: "50%",
        marginLeft: -65,
        marginTop: -40,
      }}
      whileHover={{ scale: (t.scale || 1) * 1.08 }}
    >
      <div className="p-2.5 h-full flex flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: card.color }} />
          <span className="text-[9px] uppercase tracking-widest font-mono" style={{ color: card.color }}>{card.type}</span>
        </div>
        <div className="text-xs font-semibold text-foreground/85">{card.title}</div>
      </div>
    </motion.div>
  );
}

export function CardStackShowcase() {
  const [mode, setMode] = useState<StackMode>("fan");

  const MODES: { id: StackMode; label: string; desc: string }[] = [
    { id: "fan", label: "Fan", desc: "Arc spread for browsing" },
    { id: "orbit", label: "Orbit", desc: "Circular spatial layout" },
    { id: "timeline", label: "Timeline", desc: "Z-depth temporal order" },
    { id: "grid", label: "Grid", desc: "Flat overview mode" },
  ];

  return (
    <section className="py-24 px-6 bg-background-mid/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-node-spatial mb-3">Layer 2</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Card Stack </span>
            <span className="text-gradient">System</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Cards exist as 3D planes in space — fan them, orbit them, arrange by timeline, or unfold to a grid.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Mode switcher */}
          <div className="space-y-3">
            {MODES.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setMode(m.id)}
                whileHover={{ x: 4 }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all"
                style={{
                  background: mode === m.id ? "hsl(var(--node-spatial)/0.12)" : "hsl(var(--card))",
                  border: `1px solid ${mode === m.id ? "hsl(var(--node-spatial)/0.4)" : "hsl(var(--border))"}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: mode === m.id ? "hsl(var(--node-spatial)/0.2)" : "hsl(var(--muted))",
                      color: mode === m.id ? "hsl(var(--node-spatial))" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {m.label[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{m.label} Mode</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                  {mode === m.id && (
                    <motion.div
                      layoutId="mode-indicator"
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: "hsl(var(--node-spatial))" }}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* 3D card viewport */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              height: 320,
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            {/* Background dots */}
            <div className="absolute inset-0 canvas-dots opacity-30" />

            {/* Mode label */}
            <div className="absolute top-4 left-4 z-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest"
                  style={{
                    background: "hsl(var(--node-spatial)/0.15)",
                    border: "1px solid hsl(var(--node-spatial)/0.3)",
                    color: "hsl(var(--node-spatial))",
                  }}
                >
                  {mode} mode
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Card count */}
            <div className="absolute top-4 right-4 z-20 text-[10px] text-muted-foreground">
              {CARDS.length} cards
            </div>

            {/* Cards */}
            <div className="relative w-full h-full">
              {CARDS.map((card, i) => (
                <CardItem key={card.id} card={card} mode={mode} index={i} total={CARDS.length} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
