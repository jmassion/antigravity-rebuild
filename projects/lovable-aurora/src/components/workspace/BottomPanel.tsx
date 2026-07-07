import { useState } from "react";
import { NodeGraph } from "@/components/NodeGraph";
import { ChevronUp, ChevronDown, Network, Terminal, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BottomPanel() {
  const [expanded, setExpanded] = useState(true);
  const [tab, setTab] = useState<"graph" | "console" | "history">("graph");

  const TABS = [
    { id: "graph", icon: Network, label: "Node Graph" },
    { id: "console", icon: Terminal, label: "Console" },
    { id: "history", icon: GitBranch, label: "History" },
  ] as const;

  return (
    <div
      className="flex flex-col border-t border-sidebar-border"
      style={{
        background: "hsl(var(--sidebar-background))",
        height: expanded ? 220 : 36,
        transition: "height 0.2s ease",
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div className="flex items-center px-3 h-9 border-b border-sidebar-border gap-3 flex-shrink-0">
        <div className="flex gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-all"
                style={{
                  background: tab === t.id ? "hsl(var(--primary)/0.15)" : "transparent",
                  color: tab === t.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                }}
              >
                <Icon size={9} />
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {expanded
            ? <ChevronDown size={12} className="text-muted-foreground" />
            : <ChevronUp size={12} className="text-muted-foreground" />
          }
        </button>
      </div>

      {/* Panel content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden relative"
          >
            {tab === "graph" && (
              <div className="absolute inset-0">
                <NodeGraph animated={false} />
              </div>
            )}
            {tab === "console" && (
              <div className="p-3 font-mono text-[10px] space-y-1 overflow-y-auto h-full">
                {[
                  { level: "info", msg: "World initialized — 2 spaces, 6 cards", time: "12:34:01" },
                  { level: "agent", msg: "Builder Agent: generating auth flow from prompt...", time: "12:34:03" },
                  { level: "data", msg: "Data Agent: connected to Supabase endpoint /users", time: "12:34:05" },
                  { level: "info", msg: "Token mutation: --primary updated to 252 100% 68%", time: "12:34:07" },
                  { level: "agent", msg: "Review Agent: 2 accessibility warnings in LoginCard", time: "12:34:09" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground">{log.time}</span>
                    <span style={{
                      color: log.level === "agent" ? "hsl(var(--node-agent))" :
                        log.level === "data" ? "hsl(var(--node-data))" : "hsl(var(--muted-foreground))"
                    }}>
                      [{log.level}]
                    </span>
                    <span className="text-foreground/70">{log.msg}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "history" && (
              <div className="p-3 space-y-1.5 overflow-y-auto h-full">
                {[
                  { action: "Token updated", detail: "--primary → 252 100% 68%", ago: "2s" },
                  { action: "Card moved", detail: "LoginCard → Auth Stack [0]", ago: "12s" },
                  { action: "Agent task", detail: "Builder: auth flow generated", ago: "28s" },
                  { action: "Connection added", detail: "Form → Supabase Auth", ago: "45s" },
                  { action: "Card created", detail: "New card: Settings", ago: "1m" },
                ].map((h, i) => (
                  <div key={i} className="flex items-start gap-2 py-1 border-b border-border/20 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-foreground/80">{h.action}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{h.detail}</div>
                    </div>
                    <span className="text-[9px] text-muted-foreground/50 flex-shrink-0">{h.ago}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
