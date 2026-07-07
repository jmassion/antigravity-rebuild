import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, CheckCircle2, Loader2 } from "lucide-react";

type AgentState = "idle" | "thinking" | "working" | "done";

interface PendingConnection {
  fromId: string;
  fromPort: number;
  fromType: string;
  fromX: number;
  fromY: number;
  mouseX: number;
  mouseY: number;
}

export interface AgentNodeProps {
  id: string;
  label: string;
  agentType: "builder" | "data" | "review" | "narrator";
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  onDragStart?: (id: string, e: React.MouseEvent) => void;
  onOutputPortMouseDown?: (portIndex: number, portType: string, clientX: number, clientY: number, e: React.MouseEvent) => void;
  onInputPortMouseUp?: (portIndex: number, portType: string) => void;
  pending?: PendingConnection | null;
}

const AGENT_COLORS = {
  builder: "hsl(var(--node-event))",
  data: "hsl(var(--node-data))",
  review: "hsl(var(--node-media))",
  narrator: "hsl(var(--node-agent))",
};

const AGENT_THOUGHTS = {
  builder: ["Parsing component tree...", "Generating layout...", "Optimizing tokens...", "Building flow..."],
  data: ["Fetching schema...", "Transforming data...", "Mapping fields...", "Validating types..."],
  review: ["Checking a11y...", "Auditing contrast...", "Reviewing tokens...", "Flagging issues..."],
  narrator: ["Summarizing context...", "Generating docs...", "Building narrative...", "Explaining flow..."],
};

export function AgentNode({ id, label, agentType, x, y, inputs, outputs, onDragStart, onOutputPortMouseDown, onInputPortMouseUp, pending }: AgentNodeProps) {
  const [state, setState] = useState<AgentState>("thinking");
  const [thoughtIdx, setThoughtIdx] = useState(0);
  const color = AGENT_COLORS[agentType];
  const thoughts = AGENT_THOUGHTS[agentType];

  useEffect(() => {
    const cycle = setInterval(() => {
      setThoughtIdx((p) => (p + 1) % thoughts.length);
    }, 2000);
    // Cycle through states
    const stateTimer = setTimeout(() => setState("working"), 3000);
    const doneTimer = setTimeout(() => setState("done"), 7000);
    return () => {
      clearInterval(cycle);
      clearTimeout(stateTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const PORT_COLORS: Record<string, string> = {
    data: "hsl(var(--node-data))",
    event: "hsl(var(--node-event))",
    agent: "hsl(var(--node-agent))",
    media: "hsl(var(--node-media))",
    spatial: "hsl(var(--node-spatial))",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute cursor-grab select-none"
      style={{ left: x, top: y }}
      onMouseDown={(e) => onDragStart?.(id, e)}
    >
      {/* Glow ring when active */}
      {(state === "thinking" || state === "working") && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ boxShadow: `0 0 20px 4px ${color}40`, borderRadius: 12 }}
        />
      )}

      <div
        className="relative rounded-xl px-3 pt-2 pb-2 min-w-[120px]"
        style={{
          background: `linear-gradient(145deg, ${color}18, hsl(var(--card)))`,
          border: `1px solid ${color}50`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}25` }}
          >
            <Brain size={10} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase tracking-widest" style={{ color }}>
              {agentType} agent
            </div>
            <div className="text-[11px] font-semibold text-foreground/90 truncate">{label}</div>
          </div>
          <div className="flex-shrink-0">
            {state === "thinking" && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Loader2 size={10} style={{ color }} />
              </motion.div>
            )}
            {state === "working" && <Zap size={10} style={{ color }} />}
            {state === "done" && <CheckCircle2 size={10} style={{ color: "hsl(var(--node-spatial))" }} />}
            {state === "idle" && <div className="w-2 h-2 rounded-full bg-muted" />}
          </div>
        </div>

        {/* Thought stream */}
        <AnimatePresence mode="wait">
          {(state === "thinking" || state === "working") && (
            <motion.div
              key={thoughtIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-[9px] font-mono mb-1 truncate"
              style={{ color: `${color}99` }}
            >
              {thoughts[thoughtIdx]}
            </motion.div>
          )}
          {state === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] font-mono mb-1"
              style={{ color: "hsl(var(--node-spatial))" }}
            >
              Task complete ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output ports */}
        {outputs.map((port, i) => {
          const portColor = PORT_COLORS[port] || color;
          return (
            <motion.div
              key={`out-${i}`}
              className="absolute right-[-7px] w-3.5 h-3.5 rounded-full border-2 cursor-crosshair"
              style={{
                top: `${(i + 1) * (100 / (outputs.length + 1))}%`,
                background: portColor,
                borderColor: "hsl(var(--background))",
                boxShadow: `0 0 6px ${portColor}`,
                zIndex: 10,
                transform: "translateY(-50%)",
              }}
              whileHover={{ scale: 1.4 }}
              onMouseDown={(e) => { e.stopPropagation(); onOutputPortMouseDown?.(i, port, e.clientX, e.clientY, e); }}
            />
          );
        })}

        {/* Input ports */}
        {inputs.map((port, i) => {
          const portColor = PORT_COLORS[port] || color;
          const isCompatible = pending && pending.fromType === port;
          return (
            <motion.div
              key={`in-${i}`}
              className="absolute left-[-7px] w-3.5 h-3.5 rounded-full border-2"
              style={{
                top: `${(i + 1) * (100 / (inputs.length + 1))}%`,
                background: portColor,
                borderColor: "hsl(var(--background))",
                boxShadow: isCompatible ? `0 0 14px ${portColor}` : `0 0 4px ${portColor}40`,
                zIndex: 10,
                transform: "translateY(-50%)",
                cursor: pending ? (isCompatible ? "cell" : "not-allowed") : "default",
                outline: isCompatible ? `2px solid ${portColor}60` : "none",
              }}
              animate={{ scale: isCompatible ? 1.5 : 1 }}
              onMouseUp={() => onInputPortMouseUp?.(i, port)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
