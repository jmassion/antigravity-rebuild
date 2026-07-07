import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RefreshCw, Zap, Terminal, Network, Eye, Circle, StopCircle, ChevronRight, Keyboard } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { NodeGraphScene } from "@/components/three/NodeGraphScene";

// ─── MULTI-SCRIPT DATA ───────────────────────────────────────────────────────

const SCRIPTS = {
  "signup.ht∞": {
    lines: [
      { id: "l1", code: 'on click of Button "Submit"', type: "keyword", node: "input-event", indent: 0 },
      { id: "l2", code: '  if Field "Email" is empty then', type: "condition", node: "auth-guard", indent: 1 },
      { id: "l3", code: '    shake Card "SignupForm"', type: "spatial", node: "card-anim", indent: 2 },
      { id: "l4", code: '    say "Please enter your email"', type: "voice", node: "narrator", indent: 2 },
      { id: "l5", code: "  else", type: "keyword", node: null, indent: 1 },
      { id: "l6", code: '    navigate to Stack "Onboarding"', type: "spatial", node: "navigator", indent: 2 },
      { id: "l7", code: '      with transition "portal"', type: "modifier", node: "transition", indent: 3 },
      { id: "l8", code: "  end if", type: "keyword", node: null, indent: 1 },
      { id: "l9", code: "end click", type: "keyword", node: null, indent: 0 },
    ],
    nodes: [
      { id: "input-event", label: "Click Event", x: 20, y: 30, color: "hsl(var(--node-event))" },
      { id: "auth-guard", label: "Field Check", x: 160, y: 20, color: "hsl(var(--node-data))" },
      { id: "card-anim", label: "Card.shake()", x: 310, y: 10, color: "hsl(var(--node-spatial))" },
      { id: "narrator", label: "Narrator", x: 310, y: 80, color: "hsl(var(--node-agent))" },
      { id: "navigator", label: "Navigate", x: 160, y: 130, color: "hsl(var(--node-spatial))" },
      { id: "transition", label: "Portal FX", x: 310, y: 140, color: "hsl(var(--node-media))" },
    ],
    edges: [
      { from: "input-event", to: "auth-guard" },
      { from: "auth-guard", to: "card-anim" },
      { from: "auth-guard", to: "narrator" },
      { from: "auth-guard", to: "navigator" },
      { from: "navigator", to: "transition" },
    ],
  },
  "dashboard.ht∞": {
    lines: [
      { id: "d1", code: 'on load of Stack "Dashboard"', type: "keyword", node: "load-event", indent: 0 },
      { id: "d2", code: '  fetch data from Connector "Analytics"', type: "spatial", node: "data-fetch", indent: 1 },
      { id: "d3", code: '  set Card "MetricCard" to result', type: "modifier", node: "card-set", indent: 1 },
      { id: "d4", code: '  animate Chart "Revenue" with data', type: "spatial", node: "chart-anim", indent: 1 },
      { id: "d5", code: '  if Agent "DataReview" is available then', type: "condition", node: "agent-check", indent: 1 },
      { id: "d6", code: '    ask Agent "DataReview" to summarize', type: "voice", node: "agent-run", indent: 2 },
      { id: "d7", code: "  end if", type: "keyword", node: null, indent: 1 },
      { id: "d8", code: "end load", type: "keyword", node: null, indent: 0 },
    ],
    nodes: [
      { id: "load-event", label: "Stack Load", x: 20, y: 60, color: "hsl(var(--node-event))" },
      { id: "data-fetch", label: "Analytics", x: 160, y: 20, color: "hsl(var(--node-data))" },
      { id: "card-set", label: "Card Update", x: 310, y: 10, color: "hsl(var(--node-spatial))" },
      { id: "chart-anim", label: "Chart Anim", x: 310, y: 80, color: "hsl(var(--node-media))" },
      { id: "agent-check", label: "Agent Check", x: 160, y: 120, color: "hsl(var(--node-agent))" },
      { id: "agent-run", label: "DataReview", x: 310, y: 150, color: "hsl(var(--node-agent))" },
    ],
    edges: [
      { from: "load-event", to: "data-fetch" },
      { from: "data-fetch", to: "card-set" },
      { from: "data-fetch", to: "chart-anim" },
      { from: "load-event", to: "agent-check" },
      { from: "agent-check", to: "agent-run" },
    ],
  },
  "checkout.ht∞": {
    lines: [
      { id: "c1", code: 'on click of Button "Pay Now"', type: "keyword", node: "pay-event", indent: 0 },
      { id: "c2", code: '  validate Card "PaymentForm"', type: "spatial", node: "validate", indent: 1 },
      { id: "c3", code: '  connect to Connector "Stripe"', type: "modifier", node: "stripe-conn", indent: 1 },
      { id: "c4", code: '  charge amount from Field "Total"', type: "spatial", node: "charge", indent: 1 },
      { id: "c5", code: '  if payment succeeds then', type: "condition", node: "pay-check", indent: 1 },
      { id: "c6", code: '    navigate to Stack "Confirmation"', type: "spatial", node: "confirm-nav", indent: 2 },
      { id: "c7", code: '    say "Your order is confirmed!"', type: "voice", node: "success-voice", indent: 2 },
      { id: "c8", code: "  end if", type: "keyword", node: null, indent: 1 },
      { id: "c9", code: "end click", type: "keyword", node: null, indent: 0 },
    ],
    nodes: [
      { id: "pay-event", label: "Pay Click", x: 20, y: 50, color: "hsl(var(--node-event))" },
      { id: "validate", label: "Validate", x: 160, y: 20, color: "hsl(var(--node-data))" },
      { id: "stripe-conn", label: "Stripe", x: 310, y: 10, color: "hsl(var(--node-media))" },
      { id: "charge", label: "Charge", x: 310, y: 80, color: "hsl(var(--node-media))" },
      { id: "pay-check", label: "Pay Check", x: 160, y: 130, color: "hsl(var(--node-data))" },
      { id: "confirm-nav", label: "Confirm", x: 310, y: 140, color: "hsl(var(--node-spatial))" },
      { id: "success-voice", label: "Voice OK", x: 310, y: 200, color: "hsl(var(--node-agent))" },
    ],
    edges: [
      { from: "pay-event", to: "validate" },
      { from: "validate", to: "stripe-conn" },
      { from: "stripe-conn", to: "charge" },
      { from: "charge", to: "pay-check" },
      { from: "pay-check", to: "confirm-nav" },
      { from: "pay-check", to: "success-voice" },
    ],
  },
};

const WASM_STEPS = [
  { label: "PARSING", color: "hsl(var(--node-event))", desc: "Tokenizing HyperTalk ∞ syntax tree" },
  { label: "TYPE CHECK", color: "hsl(var(--node-data))", desc: "Resolving port types and bindings" },
  { label: "WASM COMPILE", color: "hsl(var(--node-spatial))", desc: "Emitting WebAssembly bytecode" },
  { label: "SANDBOX BOOT", color: "hsl(var(--node-agent))", desc: "Initializing isolated execution context" },
];

const HEX_LINES = [
  "00 61 73 6d 01 00 00 00 01 0d 03 60 01 7f 00 60",
  "00 00 60 02 7f 7f 01 7f 03 07 06 00 01 02 01 03",
  "05 03 01 00 02 06 08 01 7f 01 41 80 88 04 0b 07",
  "2c 04 06 6d 65 6d 6f 72 79 02 00 0b 68 79 70 65",
  "72 5f 63 6c 69 63 6b 00 03 0b 68 79 70 65 72 5f",
  "73 68 61 6b 65 00 04 0c 68 79 70 65 72 5f 76 6f",
];

const LINE_COLORS: Record<string, string> = {
  keyword: "hsl(var(--node-agent))",
  condition: "hsl(var(--node-event))",
  spatial: "hsl(var(--node-spatial))",
  voice: "hsl(var(--node-agent))",
  modifier: "hsl(var(--node-media))",
};

type TabMode = "natural" | "code" | "graph" | "wasm";
type ScriptKey = keyof typeof SCRIPTS;

function getNodePos(id: string, nodes: typeof SCRIPTS["signup.ht∞"]["nodes"]) {
  const n = nodes.find((n) => n.id === id);
  return n ? { x: n.x + 55, y: n.y + 14 } : { x: 0, y: 0 };
}

function WasmPanel({ scriptKey }: { scriptKey: ScriptKey }) {
  const [step, setStep] = useState(0);
  const [hexVisible, setHexVisible] = useState(false);

  useEffect(() => {
    setStep(0);
    setHexVisible(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    WASM_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), (i + 1) * 700));
    });
    timers.push(setTimeout(() => setHexVisible(true), WASM_STEPS.length * 700 + 300));
    return () => timers.forEach(clearTimeout);
  }, [scriptKey]);

  return (
    <div className="p-4 space-y-3 font-mono text-xs overflow-auto h-full">
      <div className="text-muted-foreground mb-4">
        <span style={{ color: "hsl(var(--node-spatial))" }}>$</span> hyperc compile {scriptKey} --target wasm32
      </div>
      {WASM_STEPS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: step > i ? 1 : 0.25, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3"
        >
          <span className="text-[10px] px-2 py-0.5 rounded font-bold w-28 text-center"
            style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
            [{s.label}]
          </span>
          <span className="text-muted-foreground">{s.desc}</span>
          {step > i && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: "hsl(var(--node-spatial))" }}>✓</motion.span>
          )}
        </motion.div>
      ))}
      {step >= WASM_STEPS.length && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--node-spatial))" }} />
          <span style={{ color: "hsl(var(--node-spatial))" }}>Ready — {scriptKey.replace(".ht∞", ".wasm")} (2.3 KB)</span>
        </motion.div>
      )}
      <AnimatePresence>
        {hexVisible && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg overflow-auto"
            style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
            <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Binary output</div>
            {HEX_LINES.map((line, i) => (
              <div key={i} className="leading-5">
                <span className="text-muted-foreground/40 mr-3 text-[10px]">{(i * 16).toString(16).padStart(4, "0")}</span>
                <span style={{ color: i === 0 ? "hsl(var(--node-event))" : "hsl(var(--muted-foreground))" }}>{line}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HyperTalk() {
  const [activeScript, setActiveScript] = useState<ScriptKey>("signup.ht∞");
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tab, setTab] = useState<TabMode>("code");
  const [isRunning, setIsRunning] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const runRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const script = SCRIPTS[activeScript];

  const stopAll = () => {
    if (runRef.current) clearInterval(runRef.current);
    setIsRunning(false);
    setIsAutoPlay(false);
  };

  const handleLineClick = (line: typeof script.lines[0]) => {
    setActiveLine(line.id);
    setActiveNode(line.node);
  };

  const handleRun = () => {
    stopAll();
    setIsRunning(true);
    setShaking(false);
    setNavigated(false);
    let step = 0;
    const lines = script.lines;
    runRef.current = setInterval(() => {
      if (step < lines.length) {
        setActiveLine(lines[step].id);
        setActiveNode(lines[step].node);
        if (lines[step].code.includes("shake")) { setShaking(true); setTimeout(() => setShaking(false), 800); }
        if (lines[step].code.includes("navigate")) setNavigated(true);
        step++;
      } else {
        clearInterval(runRef.current!);
        setIsRunning(false);
        setActiveLine(null);
        setActiveNode(null);
      }
    }, 700);
  };

  const handleAutoPlay = () => {
    if (isAutoPlay) { stopAll(); return; }
    setIsAutoPlay(true);
    setShaking(false);
    setNavigated(false);
    let step = 0;
    const lines = script.lines;
    runRef.current = setInterval(() => {
      setActiveLine(lines[step % lines.length].id);
      setActiveNode(lines[step % lines.length].node);
      if (lines[step % lines.length].code.includes("shake")) { setShaking(true); setTimeout(() => setShaking(false), 800); }
      if (lines[step % lines.length].code.includes("navigate")) setNavigated(true);
      step++;
    }, 800);
  };

  useEffect(() => {
    setActiveLine(null);
    setActiveNode(null);
    setShaking(false);
    setNavigated(false);
    stopAll();
  }, [activeScript]);

  useEffect(() => () => { if (runRef.current) clearInterval(runRef.current); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); isAutoPlay ? stopAll() : handleAutoPlay(); }
      if (e.key === "r" || e.key === "R") handleRun();
      if (e.key === "1") setActiveScript("signup.ht∞");
      if (e.key === "2") setActiveScript("dashboard.ht∞");
      if (e.key === "3") setActiveScript("checkout.ht∞");
      if (e.key === "w" || e.key === "W") setTab("wasm");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const NL_COMMANDS: Record<ScriptKey, string[]> = {
    "signup.ht∞": [
      "When the submit button is clicked, check if the email field is empty.",
      "If it is empty, shake the signup form and speak an error message.",
      "Otherwise, navigate to the onboarding stack using a portal transition.",
    ],
    "dashboard.ht∞": [
      "When the dashboard loads, fetch analytics data from the connector.",
      "Set the metric card values and animate the revenue chart.",
      "If the DataReview agent is available, ask it to summarize the data.",
    ],
    "checkout.ht∞": [
      "When Pay Now is clicked, validate the payment form fields.",
      "Connect to the Stripe connector and charge the total amount.",
      "On success, navigate to confirmation and announce the order.",
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <div className="flex-1 flex flex-col pt-12">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 gap-4 flex-shrink-0 flex-wrap"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>

          {/* Script tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center flex-shrink-0">
              <Terminal size={12} className="text-primary-foreground" />
            </div>
            <div className="flex gap-1 rounded-lg p-0.5" style={{ background: "hsl(var(--background))" }}>
              {(Object.keys(SCRIPTS) as ScriptKey[]).map((sk) => (
                <button key={sk} onClick={() => setActiveScript(sk)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all"
                  style={{
                    background: activeScript === sk ? "hsl(var(--primary) / 0.12)" : "transparent",
                    color: activeScript === sk ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    border: activeScript === sk ? "1px solid hsl(var(--primary) / 0.25)" : "1px solid transparent",
                  }}>
                  {sk}
                </button>
              ))}
            </div>
          </div>

          {/* Tab mode */}
          <div className="flex gap-1 rounded-lg p-1" style={{ background: "hsl(var(--background))" }}>
            {([["natural", "Natural"], ["code", "Code"], ["graph", "Graph"], ["wasm", "WASM"]] as [TabMode, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: tab === t ? "hsl(var(--primary) / 0.12)" : "transparent",
                  color: tab === t ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  border: tab === t ? "1px solid hsl(var(--primary) / 0.25)" : "1px solid transparent",
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Autoplay */}
            <button onClick={handleAutoPlay}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isAutoPlay ? "hsl(var(--destructive) / 0.12)" : "hsl(var(--node-agent) / 0.12)",
                color: isAutoPlay ? "hsl(var(--destructive))" : "hsl(var(--node-agent))",
                border: isAutoPlay ? "1px solid hsl(var(--destructive) / 0.3)" : "1px solid hsl(var(--node-agent) / 0.3)",
              }}>
              {isAutoPlay ? <StopCircle size={11} /> : <Circle size={11} />}
              {isAutoPlay ? "Stop" : "Auto"}
            </button>
            {/* Run */}
            <button onClick={handleRun} disabled={isRunning}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: "hsl(var(--node-spatial) / 0.15)",
                color: "hsl(var(--node-spatial))",
                border: "1px solid hsl(var(--node-spatial) / 0.3)",
                opacity: isRunning ? 0.6 : 1,
              }}>
              {isRunning ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
              {isRunning ? "Running…" : "Run"}
            </button>
          </div>
        </div>

        {/* 3-panel body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 overflow-hidden">
          {/* LEFT: Code / NL / WASM */}
          <div className="flex flex-col overflow-hidden" style={{ borderRight: "1px solid hsl(var(--border))" }}>
            <div className="px-4 py-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <Terminal size={10} />
              {tab === "natural" ? "Natural Language" : tab === "code" ? "HyperTalk ∞ Script" : tab === "wasm" ? "WASM Compilation" : "Node Overview"}
            </div>
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                {tab === "natural" && (
                  <motion.div key="nl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
                    {NL_COMMANDS[activeScript].map((cmd, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-xl text-sm leading-relaxed"
                        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground) / 0.85)" }}>
                        <span className="text-[10px] font-mono mr-2" style={{ color: "hsl(var(--muted-foreground))" }}>{i + 1}.</span>
                        {cmd}
                      </motion.div>
                    ))}
                    <div className="mt-4 p-3 rounded-xl text-xs text-muted-foreground"
                      style={{ background: "hsl(var(--node-event) / 0.06)", border: "1px solid hsl(var(--node-event) / 0.15)" }}>
                      <Zap size={10} className="inline mr-1.5" style={{ color: "hsl(var(--node-event))" }} />
                      Switch to <strong>Code</strong> to see the compiled HyperTalk ∞
                    </div>
                  </motion.div>
                )}

                {tab === "code" && (
                  <motion.div key={`code-${activeScript}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                    <div className="font-mono text-xs space-y-0.5 select-none">
                      {script.lines.map((line) => (
                        <div key={line.id} onClick={() => handleLineClick(line)}
                          className="flex gap-3 rounded-md px-2 py-1 cursor-pointer transition-all"
                          style={{
                            background: activeLine === line.id ? `${LINE_COLORS[line.type]}15` : "transparent",
                            borderLeft: activeLine === line.id ? `2px solid ${LINE_COLORS[line.type]}` : "2px solid transparent",
                          }}>
                          <span className="w-4 text-right text-[10px] select-none flex-shrink-0"
                            style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>
                            {script.lines.indexOf(line) + 1}
                          </span>
                          <span style={{ color: LINE_COLORS[line.type] || "hsl(var(--foreground))", paddingLeft: line.indent * 12 }}>
                            {line.code}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-muted-foreground">Click any line to highlight its node →</p>
                  </motion.div>
                )}

                {tab === "graph" && (
                  <motion.div key={`graph-${activeScript}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
                    {script.nodes.map((n) => (
                      <div key={n.id} onClick={() => setActiveNode(n.id)}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all"
                        style={{
                          background: activeNode === n.id ? `${n.color}12` : "hsl(var(--card))",
                          border: `1px solid ${activeNode === n.id ? n.color + "50" : "hsl(var(--border))"}`,
                        }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color, boxShadow: `0 0 6px ${n.color}` }} />
                        <span className="text-xs font-medium">{n.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {tab === "wasm" && (
                  <motion.div key={`wasm-${activeScript}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <WasmPanel scriptKey={activeScript} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CENTER: Mini node graph */}
          <div className="flex flex-col overflow-hidden" style={{ borderRight: "1px solid hsl(var(--border))" }}>
            <div className="px-4 py-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <Network size={10} />
              Live Node Graph
              {isAutoPlay && (
                <span className="ml-auto flex items-center gap-1" style={{ color: "hsl(var(--node-agent))" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--node-agent))" }} />
                  Auto
                </span>
              )}
            </div>
            <div className="flex-1 relative canvas-dots p-4 overflow-hidden">
              {/* 3D NodeGraphScene backdrop */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <NodeGraphScene />
              </div>
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {script.edges.map((edge, i) => {
                  const from = getNodePos(edge.from, script.nodes);
                  const to = getNodePos(edge.to, script.nodes);
                  const cx1 = from.x + (to.x - from.x) * 0.5;
                  const isActiveEdge = activeNode === edge.from || activeNode === edge.to;
                  return (
                    <path key={i}
                      d={`M ${from.x} ${from.y} C ${cx1} ${from.y}, ${cx1} ${to.y}, ${to.x} ${to.y}`}
                      fill="none"
                      stroke={isActiveEdge ? script.nodes.find(n => n.id === edge.from)?.color || "hsl(var(--border))" : "hsl(var(--border))"}
                      strokeWidth={isActiveEdge ? "2" : "1.5"}
                      strokeOpacity={isActiveEdge ? "0.8" : "0.5"}
                    />
                  );
                })}
              </svg>
              <div className="relative" style={{ width: 420, height: 220 }}>
                {script.nodes.map((n) => {
                  const isActive = activeNode === n.id;
                  return (
                    <motion.div key={n.id} animate={{ scale: isActive ? 1.1 : 1 }}
                      className="absolute px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                      style={{
                        left: n.x, top: n.y, width: 110,
                        background: isActive ? `${n.color}18` : "hsl(var(--card))",
                        border: `1px solid ${isActive ? n.color + "80" : "hsl(var(--border))"}`,
                        boxShadow: isActive ? `0 0 16px ${n.color}40` : "none",
                        color: isActive ? n.color : "hsl(var(--foreground) / 0.8)",
                      }}
                      onClick={() => setActiveNode(isActive ? null : n.id)}>
                      <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ background: n.color }} />
                      {n.label}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground"
              style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <Eye size={10} />
              Live Preview
            </div>
            <div className="flex-1 flex items-center justify-center p-6 canvas-dots">
              <div className="w-full max-w-xs">
                <motion.div
                  animate={shaking ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl p-6 mb-4"
                  style={{
                    background: "hsl(var(--card))",
                    border: `1px solid ${navigated ? "hsl(var(--node-spatial) / 0.5)" : "hsl(var(--border))"}`,
                    boxShadow: navigated ? "0 0 24px hsl(var(--node-spatial) / 0.3)" : "none",
                    transition: "all 0.4s ease",
                  }}>
                  <div className="text-sm font-semibold mb-4"
                    style={{ color: navigated ? "hsl(var(--node-spatial))" : "hsl(var(--foreground))" }}>
                    {navigated ? "✦ Transition Complete" : activeScript === "signup.ht∞" ? "Sign Up" : activeScript === "dashboard.ht∞" ? "Dashboard" : "Checkout"}
                  </div>
                  <AnimatePresence mode="wait">
                    {!navigated ? (
                      <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {activeScript === "signup.ht∞" && (
                          <>
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Email</div>
                              <div className="rounded-lg px-3 py-2 text-xs"
                                style={{
                                  background: "hsl(var(--background))",
                                  border: `1px solid ${shaking ? "hsl(var(--destructive) / 0.6)" : "hsl(var(--border))"}`,
                                  color: "hsl(var(--muted-foreground))",
                                }}>
                                {shaking ? "⚠ Required field" : "Enter your email…"}
                              </div>
                            </div>
                            <div className="w-full py-2 rounded-lg text-xs text-center font-semibold gradient-primary text-primary-foreground cursor-pointer"
                              onClick={() => { setShaking(true); setTimeout(() => setShaking(false), 800); }}>
                              Submit
                            </div>
                          </>
                        )}
                        {activeScript === "dashboard.ht∞" && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              {["Revenue", "Users", "Sessions", "Retention"].map((m, i) => (
                                <div key={m} className="rounded-lg p-2 text-center"
                                  style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                                  <div className="text-xs font-bold text-gradient">{["$12.4K", "2,341", "8,902", "67%"][i]}</div>
                                  <div className="text-[9px] text-muted-foreground">{m}</div>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-lg p-2" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                              <div className="text-[10px] text-muted-foreground mb-1.5">Revenue Chart</div>
                              <div className="flex items-end gap-0.5 h-8">
                                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                                  <motion.div key={i} className="flex-1 rounded-sm"
                                    initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{ background: "hsl(var(--node-data))", opacity: 0.7 }} />
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {activeScript === "checkout.ht∞" && (
                          <>
                            <div>
                              <div className="text-[10px] text-muted-foreground mb-1">Card Number</div>
                              <div className="rounded-lg px-3 py-2 text-xs font-mono"
                                style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                                4242 4242 4242 4242
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] font-bold text-muted-foreground">Total</div>
                              <div className="ml-auto font-bold" style={{ color: "hsl(var(--node-media))" }}>$49.00</div>
                            </div>
                            <div className="w-full py-2 rounded-lg text-xs text-center font-semibold gradient-primary text-primary-foreground cursor-pointer">
                              Pay Now
                            </div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2">
                        <div className="text-xs text-muted-foreground">Portal transition complete ✦</div>
                        <div className="flex gap-2">
                          {["Step 1", "Step 2", "Step 3"].map((s, i) => (
                            <div key={s} className="flex-1 h-1.5 rounded-full"
                              style={{ background: i === 0 ? "hsl(var(--node-spatial))" : "hsl(var(--border))" }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="text-center space-y-1.5">
                  {shaking && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" }}>
                      🔊 "Please enter your email"
                    </motion.div>
                  )}
                  {navigated && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: "hsl(var(--node-spatial) / 0.1)", color: "hsl(var(--node-spatial))", border: "1px solid hsl(var(--node-spatial) / 0.3)" }}>
                      ✦ Portal transition fired
                    </motion.div>
                  )}
                  {!shaking && !navigated && (
                    <p className="text-[10px] text-muted-foreground">Click Run or Auto to simulate</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VS Code-style status bar */}
      <div className="flex-shrink-0 h-6 flex items-center px-4 gap-4 text-[10px] font-mono"
        style={{ background: "hsl(var(--primary) / 0.15)", borderTop: "1px solid hsl(var(--primary) / 0.2)" }}>
        <span style={{ color: "hsl(var(--primary))" }}>HyperTalk ∞</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Space: autoplay</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">R: run</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">1/2/3: scripts</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">W: WASM</span>
        <div className="flex-1" />
        {isAutoPlay && <span style={{ color: "hsl(var(--node-agent))" }}>● Auto-play</span>}
        {isRunning && <span style={{ color: "hsl(var(--node-spatial))" }}>▶ Running</span>}
        <span className="text-muted-foreground">{activeScript}</span>
      </div>
    </div>
  );
}
