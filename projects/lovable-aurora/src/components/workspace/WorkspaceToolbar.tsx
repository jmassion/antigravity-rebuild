import { useState } from "react";
import { motion } from "framer-motion";
import { MousePointer2, Pencil, GitBranch, Mic, Code2 } from "lucide-react";

const MODES = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V", color: "hsl(var(--node-event))" },
  { id: "draw", icon: Pencil, label: "Draw", shortcut: "D", color: "hsl(var(--node-media))" },
  { id: "connect", icon: GitBranch, label: "Connect", shortcut: "C", color: "hsl(var(--node-data))" },
  { id: "voice", icon: Mic, label: "Voice", shortcut: "Space", color: "hsl(var(--node-agent))" },
  { id: "code", icon: Code2, label: "Code", shortcut: "K", color: "hsl(var(--node-spatial))" },
];

export function WorkspaceToolbar() {
  const [active, setActive] = useState("select");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 rounded-2xl glass-strong"
      style={{ border: "1px solid hsl(var(--border))", boxShadow: "var(--shadow-lg)" }}
    >
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = active === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => setActive(mode.id)}
            title={`${mode.label} (${mode.shortcut})`}
            className="relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all"
            style={{
              background: isActive ? `${mode.color}20` : "transparent",
              border: isActive ? `1px solid ${mode.color}50` : "1px solid transparent",
            }}
          >
            <Icon size={16} style={{ color: isActive ? mode.color : "hsl(var(--muted-foreground))" }} />
            {isActive && (
              <motion.div
                layoutId="toolbar-indicator"
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ boxShadow: `0 0 12px 0 ${mode.color}40` }}
              />
            )}
            {mode.id === "voice" && isActive && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ background: mode.color }}
              />
            )}
          </button>
        );
      })}
    </motion.div>
  );
}
