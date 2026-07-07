import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork } from "lucide-react";

interface TokenNode {
  id: string;
  name: string;
  value: string;
  layer: "spatial" | "semantic" | "component";
  color: string;
  hue: number;
  sat: number;
  lig: number;
  children?: string[];
}

const INITIAL_TOKENS: TokenNode[] = [
  // Spatial
  { id: "s-hue", name: "--spatial-hue", value: "252", layer: "spatial", color: "hsl(var(--primary))", hue: 252, sat: 100, lig: 68, children: ["sem-primary", "sem-accent"] },
  { id: "s-sat", name: "--spatial-sat", value: "80%", layer: "spatial", color: "hsl(var(--node-data))", hue: 185, sat: 100, lig: 55, children: ["sem-node-agent"] },
  // Semantic
  { id: "sem-primary", name: "--primary", value: "252 100% 68%", layer: "semantic", color: "hsl(var(--primary))", hue: 252, sat: 100, lig: 68, children: ["comp-btn", "comp-ring"] },
  { id: "sem-accent", name: "--accent", value: "185 100% 55%", layer: "semantic", color: "hsl(var(--accent))", hue: 185, sat: 100, lig: 55, children: ["comp-badge"] },
  { id: "sem-node-agent", name: "--node-agent", value: "310 100% 65%", layer: "semantic", color: "hsl(var(--node-agent))", hue: 310, sat: 100, lig: 65, children: ["comp-agent-orb"] },
  // Component
  { id: "comp-btn", name: "Button.bg", value: "gradient-primary", layer: "component", color: "hsl(var(--primary))", hue: 252, sat: 100, lig: 68 },
  { id: "comp-ring", name: "Input.ring", value: "--primary", layer: "component", color: "hsl(var(--primary))", hue: 252, sat: 100, lig: 68 },
  { id: "comp-badge", name: "Badge.bg", value: "--accent/15", layer: "component", color: "hsl(var(--accent))", hue: 185, sat: 100, lig: 55 },
  { id: "comp-agent-orb", name: "AgentOrb.glow", value: "--node-agent", layer: "component", color: "hsl(var(--node-agent))", hue: 310, sat: 100, lig: 65 },
];

const LAYER_X: Record<string, number> = { spatial: 0, semantic: 1, component: 2 };
const LAYER_COLORS = {
  spatial: "hsl(var(--node-media))",
  semantic: "hsl(var(--node-event))",
  component: "hsl(var(--node-spatial))",
};

export function TokenVisualizer() {
  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [selected, setSelected] = useState<string | null>("s-hue");

  const selectedToken = tokens.find((t) => t.id === selected);
  const connected = selectedToken?.children ?? [];

  const byLayer = (layer: TokenNode["layer"]) => tokens.filter((t) => t.layer === layer);

  const updateHue = (id: string, hue: number) => {
    setTokens((prev) => prev.map((t) => {
      if (t.id === id) return { ...t, hue, value: `${hue} ${t.sat}% ${t.lig}%`, color: `hsl(${hue} ${t.sat}% ${t.lig}%)` };
      if (t.layer !== "spatial" && prev.find((p) => p.id === id)?.children?.includes(t.id)) {
        return { ...t, hue, color: `hsl(${hue} ${t.sat}% ${t.lig}%)` };
      }
      return t;
    }));
  };

  return (
    <section className="py-24 px-6 bg-background-mid/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-node-media mb-3">Layer 0</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Reactive Token </span>
            <span className="text-gradient">Propagation</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tokens are live graph nodes. Mutate a spatial token and every connected semantic and component token updates instantly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token tree */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-3">
              <span className="text-[11px] font-mono text-muted-foreground">token-graph://design-system</span>
            </div>
            <div className="p-6">
              {/* Column headers */}
              <div className="grid grid-cols-3 mb-4">
                {(["spatial", "semantic", "component"] as const).map((layer) => (
                  <div key={layer} className="text-center">
                    <span
                      className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: LAYER_COLORS[layer], background: `${LAYER_COLORS[layer]}15`, border: `1px solid ${LAYER_COLORS[layer]}25` }}
                    >
                      {layer}
                    </span>
                  </div>
                ))}
              </div>

              {/* Token grid */}
              <div className="grid grid-cols-3 gap-3 relative">
                {(["spatial", "semantic", "component"] as const).map((layer) => (
                  <div key={layer} className="space-y-2">
                    {byLayer(layer).map((token) => {
                      const isSelected = selected === token.id;
                      const isConnected = connected.includes(token.id);
                      const parentSelected = selectedToken?.children?.includes(token.id);

                      return (
                        <motion.button
                          key={token.id}
                          onClick={() => setSelected(isSelected ? null : token.id)}
                          whileHover={{ scale: 1.02 }}
                          className="w-full text-left rounded-lg p-2.5 transition-all"
                          style={{
                            background: isSelected ? `${token.color}20`
                              : isConnected ? `${token.color}10`
                                : "hsl(var(--background))",
                            border: `1px solid ${isSelected || isConnected ? token.color + "50" : "hsl(var(--border))"}`,
                            boxShadow: isSelected ? `0 0 12px ${token.color}30` : "none",
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: token.color }} />
                            <span className="text-[9px] font-mono truncate" style={{ color: token.color }}>
                              {token.name.split("--")[1] || token.name}
                            </span>
                          </div>
                          <div className="text-[9px] text-muted-foreground truncate font-mono">{token.value}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inspector */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {selectedToken && (
                <motion.div
                  key={selectedToken.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl p-4"
                  style={{ background: "hsl(var(--card))", border: `1px solid ${selectedToken.color}30` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-md" style={{ background: selectedToken.color }} />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{selectedToken.name}</div>
                      <div className="text-[10px] capitalize" style={{ color: LAYER_COLORS[selectedToken.layer] }}>{selectedToken.layer} token</div>
                    </div>
                  </div>

                  {selectedToken.layer === "spatial" && (
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1.5">Hue — {selectedToken.hue}°</div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={selectedToken.hue}
                        onChange={(e) => updateHue(selectedToken.id, parseInt(e.target.value))}
                        className="w-full h-2 rounded-full cursor-pointer appearance-none"
                        style={{
                          background: `linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))`,
                        }}
                      />
                      <div className="text-[10px] text-muted-foreground mt-2">
                        Affects: <span style={{ color: selectedToken.color }}>{selectedToken.children?.length || 0} tokens</span>
                      </div>
                    </div>
                  )}

                  {selectedToken.children && selectedToken.children.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Connected Tokens</div>
                      {selectedToken.children.map((childId) => {
                        const child = tokens.find((t) => t.id === childId);
                        if (!child) return null;
                        return (
                          <div key={childId} className="flex items-center gap-2 py-1">
                            <div className="w-2 h-2 rounded-sm" style={{ background: child.color }} />
                            <span className="text-[10px] font-mono text-muted-foreground">{child.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fork button */}
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: "hsl(var(--node-event)/0.12)", color: "hsl(var(--node-event))", border: "1px solid hsl(var(--node-event)/0.25)" }}
            >
              <GitFork size={13} />
              Fork Token Set
            </button>

            {/* Layer stats */}
            {(["spatial", "semantic", "component"] as const).map((layer) => (
              <div key={layer} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-sm" style={{ background: LAYER_COLORS[layer] }} />
                <span className="text-[10px] text-muted-foreground capitalize flex-1">{layer}</span>
                <span className="text-[10px] font-mono" style={{ color: LAYER_COLORS[layer] }}>
                  {byLayer(layer).length} tokens
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
