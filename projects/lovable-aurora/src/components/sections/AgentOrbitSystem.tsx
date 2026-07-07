import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AgentType = { id: string; name: string; type: "builder" | "data" | "review" | "narrator"; color: string; angle: number; task: string; thoughts: string[] };

const AGENTS: AgentType[] = [
  {
    id: "builder", name: "Builder", type: "builder", color: "hsl(var(--node-event))", angle: 0,
    task: "Generating auth flow from prompt",
    thoughts: ["Parsing intent...", "Designing components...", "Building flow...", "Compiling WASM..."],
  },
  {
    id: "data", name: "Data", type: "data", color: "hsl(var(--node-data))", angle: 90,
    task: "Connecting Supabase schema",
    thoughts: ["Fetching schema...", "Mapping types...", "Validating fields...", "Syncing delta..."],
  },
  {
    id: "review", name: "Review", type: "review", color: "hsl(var(--node-media))", angle: 180,
    task: "Auditing accessibility tokens",
    thoughts: ["Checking contrast...", "WCAG audit...", "Flagging issues...", "Reporting..."],
  },
  {
    id: "narrator", name: "Narrator", type: "narrator", color: "hsl(var(--node-agent))", angle: 270,
    task: "Summarizing workspace to user",
    thoughts: ["Reading context...", "Summarizing...", "Generating docs...", "Publishing..."],
  },
];

export function AgentOrbitSystem() {
  const [thoughtIndices, setThoughtIndices] = useState<Record<string, number>>({});
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setThoughtIndices((prev) => {
        const next: Record<string, number> = {};
        AGENTS.forEach((a) => {
          next[a.id] = ((prev[a.id] ?? 0) + 1) % a.thoughts.length;
        });
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const ORBIT_R = 120;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 canvas-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="text-xs uppercase tracking-widest text-node-agent mb-3">Layer 6</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Multi-Agent </span>
            <span className="text-gradient">Intelligence</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Four specialized agents orbit the core, each with 3D presence and real-time thought streams.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Orbit diagram */}
          <div className="relative flex items-center justify-center" style={{ width: 340, height: 340, flexShrink: 0 }}>
            {/* Orbit rings */}
            {[ORBIT_R].map((r) => (
              <motion.div
                key={r}
                className="absolute rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                style={{
                  width: r * 2,
                  height: r * 2,
                  border: "1px solid hsl(var(--border) / 0.4)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: ORBIT_R * 2 + 60,
                height: ORBIT_R * 2 + 60,
                border: "1px dashed hsl(var(--border) / 0.2)",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Central core */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary)/0.4), hsl(var(--primary)/0.1))",
                border: "1px solid hsl(var(--primary)/0.5)",
                boxShadow: "0 0 32px hsl(var(--primary)/0.4)",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%) rotate(0deg)",
              }}
            >
              <div className="text-lg font-bold text-gradient">∞</div>
            </motion.div>

            {/* Agent orbs */}
            {AGENTS.map((agent, i) => {
              const angleRad = (agent.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * ORBIT_R;
              const y = Math.sin(angleRad) * ORBIT_R;
              const isActive = activeAgent === agent.id;

              return (
                <motion.div
                  key={agent.id}
                  className="absolute cursor-pointer"
                  animate={{
                    rotate: [agent.angle, agent.angle + 360],
                  }}
                  transition={{ duration: 24 + i * 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    top: "50%", left: "50%",
                    width: 0, height: 0,
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute",
                      left: ORBIT_R,
                      top: 0,
                      transform: "translate(-50%, -50%)",
                    }}
                    animate={{ rotate: -(agent.angle + 360) }}
                    transition={{ duration: 24 + i * 4, repeat: Infinity, ease: "linear" }}
                    onClick={() => setActiveAgent(isActive ? null : agent.id)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center relative"
                      style={{
                        background: `radial-gradient(circle, ${agent.color}40, ${agent.color}15)`,
                        border: `1px solid ${agent.color}60`,
                        boxShadow: `0 0 ${isActive ? 24 : 12}px ${agent.color}${isActive ? "60" : "30"}`,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: agent.color }}>
                        {agent.name[0]}
                      </span>
                      {/* Pulsing ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                        style={{ border: `1px solid ${agent.color}` }}
                      />
                    </motion.div>
                    {/* Label */}
                    <div
                      className="absolute text-[9px] font-semibold whitespace-nowrap"
                      style={{
                        color: agent.color,
                        top: -16,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      {agent.name}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Agent cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {AGENTS.map((agent) => {
              const thoughtIdx = thoughtIndices[agent.id] ?? 0;
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-xl p-4"
                  style={{
                    background: `linear-gradient(145deg, ${agent.color}12, hsl(var(--card)))`,
                    border: `1px solid ${agent.color}30`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${agent.color}25`, color: agent.color }}
                    >
                      {agent.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{agent.name} Agent</div>
                      <div className="text-[10px] capitalize" style={{ color: `${agent.color}99` }}>{agent.type} specialist</div>
                    </div>
                    <motion.div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ background: agent.color }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">{agent.task}</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={thoughtIdx}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="text-[10px] font-mono px-2 py-1 rounded"
                      style={{
                        background: `${agent.color}10`,
                        color: `${agent.color}cc`,
                        border: `1px solid ${agent.color}20`,
                      }}
                    >
                      ▸ {agent.thoughts[thoughtIdx]}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
