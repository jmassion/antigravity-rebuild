import { motion } from "framer-motion";
import { Database, Zap, Brain, Image, Box, Globe, Mic, Code2, User } from "lucide-react";

const PALETTE_NODES = [
  { type: "data", label: "Data Store", icon: Database, color: "hsl(var(--node-data))", ports: { in: ["event"], out: ["data"] } },
  { type: "event", label: "Event Trigger", icon: Zap, color: "hsl(var(--node-event))", ports: { in: [], out: ["event"] } },
  { type: "agent", label: "Builder Agent", icon: Brain, color: "hsl(var(--node-agent))", ports: { in: ["data", "event"], out: ["spatial"] } },
  { type: "media", label: "Media Asset", icon: Image, color: "hsl(var(--node-media))", ports: { in: ["data"], out: ["media"] } },
  { type: "spatial", label: "3D Card", icon: Box, color: "hsl(var(--node-spatial))", ports: { in: ["spatial"], out: [] } },
  { type: "connector", label: "API Connector", icon: Globe, color: "hsl(var(--node-data))", ports: { in: ["event"], out: ["data"] } },
  { type: "voice", label: "Voice Input", icon: Mic, color: "hsl(var(--node-agent))", ports: { in: [], out: ["event"] } },
  { type: "script", label: "HyperTalk Script", icon: Code2, color: "hsl(var(--node-event))", ports: { in: ["event", "data"], out: ["event", "data"] } },
  { type: "user", label: "User Presence", icon: User, color: "hsl(var(--presence-1))", ports: { in: [], out: ["event"] } },
];

export function NodePalette() {
  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "hsl(var(--sidebar-background))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
        width: 180,
        flexShrink: 0,
      }}
    >
      <div className="px-3 py-3 border-b border-sidebar-border">
        <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-widest">Node Palette</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-1 py-1">Drag to canvas</div>
        {PALETTE_NODES.map((node, i) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.type}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-grab hover:scale-[1.02] transition-all group"
              style={{
                background: `${node.color}10`,
                border: `1px solid ${node.color}25`,
              }}
              draggable
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${node.color}20` }}
              >
                <Icon size={11} style={{ color: node.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-foreground/85 truncate">{node.label}</div>
                <div className="text-[9px] text-muted-foreground font-mono capitalize">{node.type}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
