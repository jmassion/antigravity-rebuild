import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Monitor, Smartphone, Zap, CheckCircle2, Loader2 } from "lucide-react";

const PLATFORMS = [
  {
    id: "pwa",
    name: "PWA",
    subtitle: "Browser / Web",
    icon: Globe,
    color: "hsl(var(--node-event))",
    steps: ["Bundling WASM core...", "Generating service worker...", "Optimizing assets...", "Deploy to CDN..."],
    stats: [{ label: "Bundle Size", value: "1.2 MB" }, { label: "FCP", value: "0.8s" }, { label: "Offline", value: "Full" }],
  },
  {
    id: "tauri",
    name: "Tauri",
    subtitle: "macOS · Windows · Linux",
    icon: Monitor,
    color: "hsl(var(--node-agent))",
    steps: ["Compiling Rust core...", "Building native binaries...", "Signing app bundle...", "Creating installer..."],
    stats: [{ label: "App Size", value: "8 MB" }, { label: "Cold Start", value: "0.3s" }, { label: "Memory", value: "-80%" }],
  },
  {
    id: "capacitor",
    name: "Capacitor",
    subtitle: "iOS · Android",
    icon: Smartphone,
    color: "hsl(var(--node-spatial))",
    steps: ["Syncing project...", "Building native bridge...", "Compiling WASM...", "Submitting to store..."],
    stats: [{ label: "iOS Size", value: "12 MB" }, { label: "Android", value: "9 MB" }, { label: "Push", value: "Native" }],
  },
];

function PlatformCard({ platform }: { platform: typeof PLATFORMS[0] }) {
  const [state, setState] = useState<"idle" | "deploying" | "done">("idle");
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const Icon = platform.icon;

  const deploy = () => {
    if (state !== "idle") return;
    setState("deploying");
    setStep(0);
    setProgress(0);

    let s = 0;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 6 + 2;
      if (p >= 100) {
        clearInterval(interval);
        setProgress(100);
        setState("done");
        return;
      }
      setProgress(p);
      const newStep = Math.floor((p / 100) * platform.steps.length);
      if (newStep !== s && newStep < platform.steps.length) {
        s = newStep;
        setStep(s);
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background: `linear-gradient(145deg, ${platform.color}10, hsl(var(--card)))`,
        border: `1px solid ${platform.color}${state === "done" ? "50" : "25"}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${platform.color}20` }}
        >
          <Icon size={22} style={{ color: platform.color }} />
        </div>
        <div>
          <div className="text-base font-bold text-foreground">{platform.name}</div>
          <div className="text-xs text-muted-foreground">{platform.subtitle}</div>
        </div>
        {state === "done" && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
            <CheckCircle2 size={18} style={{ color: "hsl(var(--node-spatial))" }} />
          </motion.div>
        )}
        {state === "deploying" && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="ml-auto">
            <Loader2 size={18} style={{ color: platform.color }} />
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1.5">
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-mono"
              style={{ color: `${platform.color}99` }}
            >
              {state === "idle" ? "Ready to deploy" : state === "done" ? "Deployed ✓" : platform.steps[step]}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] font-mono" style={{ color: platform.color }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            style={{ background: state === "done" ? "hsl(var(--node-spatial))" : platform.color }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {platform.stats.map((s) => (
          <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: "hsl(var(--background))" }}>
            <div className="text-xs font-bold" style={{ color: platform.color }}>{s.value}</div>
            <div className="text-[9px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Deploy button */}
      <button
        onClick={deploy}
        disabled={state !== "idle"}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: state === "idle" ? platform.color : state === "done" ? "hsl(var(--node-spatial)/0.15)" : "hsl(var(--muted))",
          color: state === "idle" ? "hsl(var(--background))" : state === "done" ? "hsl(var(--node-spatial))" : "hsl(var(--muted-foreground))",
          cursor: state !== "idle" ? "not-allowed" : "pointer",
        }}
      >
        <Zap size={12} />
        {state === "idle" ? `Deploy to ${platform.name}` : state === "done" ? "Deployed" : "Deploying..."}
      </button>
    </motion.div>
  );
}

export function PublishingSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="text-xs uppercase tracking-widest text-node-spatial mb-3">Layer 8</div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">One Stack → </span>
            <span className="text-gradient">Every Platform</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Any Stack becomes a standalone app. Click deploy — your WASM bundle ships to browser, desktop, and mobile simultaneously.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLATFORMS.map((p) => <PlatformCard key={p.id} platform={p} />)}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: "1-click", label: "Deploy to all platforms", color: "hsl(var(--node-event))" },
            { value: "70%", label: "Creator revenue share", color: "hsl(var(--node-spatial))" },
            { value: "Git-like", label: "Version control built-in", color: "hsl(var(--node-agent))" },
            { value: "3D", label: "Analytics visualization", color: "hsl(var(--node-media))" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center glass">
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
