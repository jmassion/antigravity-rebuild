import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

const COMMANDS = [
  {
    text: "Apply glassmorphism to all cards in this stack",
    parsed: [
      { label: "ACTION", value: "apply-style", color: "hsl(var(--node-event))" },
      { label: "TARGET", value: "card-stack", color: "hsl(var(--node-data))" },
      { label: "MODIFIER", value: "glassmorphism", color: "hsl(var(--node-agent))" },
    ],
    result: "6 cards updated · 3 tokens mutated",
  },
  {
    text: "Move the login card to the top of the auth stack",
    parsed: [
      { label: "ACTION", value: "move", color: "hsl(var(--node-event))" },
      { label: "TARGET", value: "login-card", color: "hsl(var(--node-data))" },
      { label: "DESTINATION", value: "auth-stack[0]", color: "hsl(var(--node-spatial))" },
    ],
    result: "Card repositioned · Stack reindexed",
  },
  {
    text: "Connect this card to the Stripe payment API",
    parsed: [
      { label: "ACTION", value: "connect", color: "hsl(var(--node-event))" },
      { label: "TARGET", value: "active-card", color: "hsl(var(--node-data))" },
      { label: "SERVICE", value: "stripe-api", color: "hsl(var(--node-media))" },
    ],
    result: "Connector node added · 3 ports wired",
  },
  {
    text: "Generate a user flow for e-commerce checkout",
    parsed: [
      { label: "ACTION", value: "generate", color: "hsl(var(--node-agent))" },
      { label: "TYPE", value: "user-flow", color: "hsl(var(--node-data))" },
      { label: "CONTEXT", value: "ecommerce-checkout", color: "hsl(var(--node-spatial))" },
    ],
    result: "Builder Agent: 8 cards created · Flow linked",
  },
];

export function VoiceTerminal() {
  const [listening, setListening] = useState(false);
  const [cmdIndex, setCmdIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "parsed" | "done">("idle");
  const [history, setHistory] = useState<typeof COMMANDS>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cmd = COMMANDS[cmdIndex % COMMANDS.length];

  const runCommand = () => {
    if (phase !== "idle") return;
    setListening(true);
    setPhase("typing");
    setTypedText("");

    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setTypedText(cmd.text.slice(0, i));
      if (i >= cmd.text.length) {
        clearInterval(typeInterval);
        setListening(false);
        timerRef.current = setTimeout(() => {
          setPhase("parsed");
          timerRef.current = setTimeout(() => {
            setPhase("done");
            setHistory((prev) => [cmd, ...prev].slice(0, 4));
            timerRef.current = setTimeout(() => {
              setPhase("idle");
              setTypedText("");
              setCmdIndex((p) => p + 1);
            }, 2500);
          }, 1200);
        }, 400);
      }
    }, 32);
    return () => clearInterval(typeInterval);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // Waveform bars
  const bars = Array.from({ length: 28 }, (_, i) => i);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-node-agent mb-3">Layer 4</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Voice </span>
            <span className="text-gradient">Malleability</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every action in the platform is addressable by natural language. Watch the semantic parser at work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Terminal */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid hsl(var(--node-agent)/0.3)", background: "hsl(var(--card))" }}
          >
            {/* Chrome */}
            <div
              className="px-4 py-2.5 flex items-center gap-3 border-b border-border/50"
              style={{ background: "hsl(var(--card)/0.8)" }}
            >
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive/60" />
                <div className="w-2 h-2 rounded-full bg-node-media/60" />
                <div className="w-2 h-2 rounded-full bg-node-spatial/60" />
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">voice://main.space/control</span>
              <motion.div
                className="ml-auto flex items-center gap-1 text-[10px]"
                animate={{ opacity: listening ? 1 : 0.4 }}
                style={{ color: "hsl(var(--node-agent))" }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  animate={listening ? { scale: [1, 1.5, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  style={{ background: "hsl(var(--node-agent))" }}
                />
                {listening ? "LISTENING" : "STANDBY"}
              </motion.div>
            </div>

            {/* Waveform */}
            <div className="flex items-center justify-center gap-0.5 px-6 py-5" style={{ height: 72 }}>
              {bars.map((i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  animate={listening ? {
                    height: [4, Math.random() * 36 + 8, 4],
                  } : { height: 4 }}
                  transition={listening ? {
                    duration: 0.3 + (i % 5) * 0.1,
                    repeat: Infinity,
                    delay: i * 0.02,
                  } : {}}
                  style={{ background: `hsl(var(--node-agent) / ${listening ? 0.8 : 0.2})` }}
                />
              ))}
            </div>

            {/* Input area */}
            <div className="px-4 pb-4">
              <div
                className="rounded-lg px-3 py-2.5 font-mono text-sm min-h-[48px] flex items-center relative"
                style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--node-agent)/0.25)" }}
              >
                {typedText ? (
                  <span style={{ color: "hsl(var(--node-agent))" }}>
                    {typedText}
                    {phase === "typing" && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="ml-0.5 inline-block w-0.5 h-4 bg-current align-middle"
                      />
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    {phase === "idle" ? "Click the mic to begin..." : ""}
                  </span>
                )}
              </div>

              {/* Parsed tokens */}
              <AnimatePresence>
                {(phase === "parsed" || phase === "done") && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap gap-1.5 mt-2"
                  >
                    {cmd.parsed.map((token) => (
                      <span
                        key={token.label}
                        className="text-[10px] px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: `${token.color}15`,
                          color: token.color,
                          border: `1px solid ${token.color}30`,
                        }}
                      >
                        [{token.label}: {token.value}]
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 text-[11px] px-3 py-1.5 rounded-lg"
                    style={{
                      background: "hsl(var(--node-spatial)/0.12)",
                      color: "hsl(var(--node-spatial))",
                      border: "1px solid hsl(var(--node-spatial)/0.3)",
                    }}
                  >
                    ✓ {cmd.result}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mic button */}
              <button
                onClick={runCommand}
                disabled={phase !== "idle"}
                className="mt-3 w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all"
                style={{
                  background: phase === "idle" ? "hsl(var(--node-agent)/0.15)" : "hsl(var(--muted))",
                  color: phase === "idle" ? "hsl(var(--node-agent))" : "hsl(var(--muted-foreground))",
                  border: `1px solid ${phase === "idle" ? "hsl(var(--node-agent)/0.3)" : "hsl(var(--border))"}`,
                }}
              >
                {phase === "idle" ? <Mic size={13} /> : <MicOff size={13} />}
                {phase === "idle" ? "Activate Voice" : phase === "typing" ? "Listening..." : "Processing..."}
              </button>
            </div>
          </div>

          {/* Command history */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Command History</div>
            {history.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8 opacity-50">
                Run a command to see history
              </div>
            )}
            <AnimatePresence>
              {history.map((h, i) => (
                <motion.div
                  key={`${h.text}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl p-3"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    opacity: 1 - i * 0.15,
                  }}
                >
                  <div className="text-xs text-foreground/80 mb-2 font-mono">"{h.text}"</div>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {h.parsed.map((t) => (
                      <span key={t.label} className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: `${t.color}12`, color: t.color }}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{h.result}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
