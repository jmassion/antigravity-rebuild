import { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Box, Palette, Zap, ChevronDown } from "lucide-react";

const TOKENS = [
  { name: "--primary", label: "Primary", value: "252 100% 68%", group: "Semantic" },
  { name: "--accent", label: "Accent", value: "185 100% 55%", group: "Semantic" },
  { name: "--node-agent", label: "Agent Color", value: "310 100% 65%", group: "Node" },
  { name: "--node-data", label: "Data Color", value: "185 100% 55%", group: "Node" },
  { name: "--node-spatial", label: "Spatial Color", value: "140 80% 50%", group: "Node" },
  { name: "--radius", label: "Radius", value: "0.75rem", group: "Shape" },
];

const COMPONENT_PROPS = [
  { label: "Width", value: "320px", type: "text" },
  { label: "Height", value: "240px", type: "text" },
  { label: "Opacity", value: "1.0", type: "text" },
  { label: "Elevation", value: "3", type: "text" },
  { label: "Stack Index", value: "0", type: "text" },
];

function TokenRow({ token }: { token: typeof TOKENS[0] }) {
  const isColor = token.value.includes("%") && !token.value.includes("rem");
  const [h, s, l] = isColor ? token.value.split(" ").map(parseFloat) : [0, 0, 0];

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
      {isColor && (
        <div
          className="w-4 h-4 rounded-md flex-shrink-0 border border-white/10"
          style={{ background: `hsl(${h} ${s}% ${l}%)` }}
        />
      )}
      <span className="text-[10px] font-mono text-muted-foreground flex-1 truncate">{token.label}</span>
      <span className="text-[10px] font-mono" style={{ color: isColor ? `hsl(${h} ${s}% ${l}%)` : "hsl(var(--foreground)/0.6)" }}>
        {isColor ? `${Math.round(h)}°` : token.value}
      </span>
    </div>
  );
}

export function PropertiesPanel({ collapsed }: { collapsed: boolean }) {
  const [activeSection, setActiveSection] = useState<"tokens" | "component" | "effects">("tokens");

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "hsl(var(--sidebar-background))",
        borderLeft: "1px solid hsl(var(--sidebar-border))",
        width: collapsed ? 0 : 220,
        overflow: "hidden",
        transition: "width 0.2s ease",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex gap-1">
          {(["tokens", "component", "effects"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className="flex-1 text-[10px] py-1 rounded-md capitalize transition-all"
              style={{
                background: activeSection === s ? "hsl(var(--primary)/0.15)" : "transparent",
                color: activeSection === s ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
            >
              {s === "tokens" ? <Palette size={10} className="mx-auto" /> :
                s === "component" ? <Box size={10} className="mx-auto" /> :
                  <Zap size={10} className="mx-auto" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeSection === "tokens" && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
              <Sliders size={9} /> Design Tokens
            </div>
            {["Semantic", "Node", "Shape"].map((group) => (
              <div key={group} className="mb-3">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-1 flex items-center gap-1">
                  <ChevronDown size={8} /> {group}
                </div>
                {TOKENS.filter((t) => t.group === group).map((t) => (
                  <TokenRow key={t.name} token={t} />
                ))}
              </div>
            ))}
          </div>
        )}

        {activeSection === "component" && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
              <Box size={9} /> Login Card
            </div>
            <div className="rounded-lg p-2 mb-3" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] text-node-event mb-1 font-mono">card</div>
              <div className="text-xs text-foreground/80">Login Card</div>
              <div className="text-[10px] text-muted-foreground">Auth Stack → Dashboard</div>
            </div>
            {COMPONENT_PROPS.map((prop) => (
              <div key={prop.label} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                <span className="text-[10px] text-muted-foreground flex-1">{prop.label}</span>
                <span className="text-[10px] font-mono text-foreground/70">{prop.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeSection === "effects" && (
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Effects</div>
            {[
              { label: "Glass Blur", value: 12, max: 40, color: "hsl(var(--node-data))" },
              { label: "Glow Radius", value: 24, max: 80, color: "hsl(var(--primary))" },
              { label: "Shadow Depth", value: 3, max: 10, color: "hsl(var(--node-agent))" },
            ].map((e) => (
              <div key={e.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{e.label}</span>
                  <span className="text-[10px] font-mono" style={{ color: e.color }}>{e.value}</span>
                </div>
                <div className="h-1 rounded-full bg-card overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ width: `${(e.value / e.max) * 100}%`, background: e.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
