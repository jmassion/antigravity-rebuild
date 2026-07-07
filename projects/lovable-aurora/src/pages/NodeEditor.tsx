import { useNavigate } from "react-router-dom";
import { NodeEditorCanvas } from "@/components/nodes/NodeEditorCanvas";
import { NodePalette } from "@/components/nodes/NodePalette";
import { PresenceBar } from "@/components/PresenceIndicator";
import { Hexagon, ChevronRight, ArrowLeft, Info, Share2, Copy, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const MOCK_URL = "hypercard.∞/worlds/dev-nexus/graphs/auth-flow";

const COLLABORATORS = [
  { name: "Aria Chen", initials: "AC", color: "hsl(var(--presence-1))", action: "viewing" },
  { name: "Leon Park", initials: "LP", color: "hsl(var(--presence-2))", action: "editing node" },
  { name: "Nova Kim", initials: "NK", color: "hsl(var(--presence-3))", action: "viewing" },
];

export default function NodeEditor() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${MOCK_URL}`).catch(() => {});
    toast({ title: "Link copied!", description: MOCK_URL, duration: 2500 });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">

      {/* Top bar */}
      <header
        className="h-11 flex-shrink-0 flex items-center px-3 gap-3 z-20"
        style={{
          background: "hsl(var(--sidebar-background))",
          borderBottom: "1px solid hsl(var(--sidebar-border))",
        }}
      >
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center hover:opacity-80 transition-opacity">
          <Hexagon size={13} className="text-primary-foreground" />
        </button>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={10} /> Home
          </button>
          <ChevronRight size={10} />
          <button onClick={() => navigate("/workspace")} className="hover:text-foreground transition-colors">Workspace</button>
          <ChevronRight size={10} />
          <span className="text-foreground font-medium">Node Editor</span>
        </div>

        <div className="flex-1" />

        {/* Node legend */}
        <div className="hidden md:flex items-center gap-3 mr-4">
          {[
            { color: "hsl(var(--node-data))", label: "Data" },
            { color: "hsl(var(--node-event))", label: "Event" },
            { color: "hsl(var(--node-agent))", label: "Agent" },
            { color: "hsl(var(--node-spatial))", label: "Spatial" },
            { color: "hsl(var(--node-media))", label: "Media" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <PresenceBar />

        {/* Share button */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ml-2"
              style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
              <Share2 size={11} /> Share
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
            <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}>
              <div className="text-xs font-semibold mb-1">Share Graph</div>
              <div className="text-[11px] text-muted-foreground">Anyone with the link can view this graph</div>
            </div>
            {/* URL */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-mono" style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}>
                <span className="flex-1 text-muted-foreground truncate">{MOCK_URL}</span>
                <button onClick={handleCopyLink} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all hover:bg-primary/10"
                  style={{ color: "hsl(var(--primary))" }}>
                  <Copy size={10} /> Copy
                </button>
              </div>
            </div>
            {/* Collaborators */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Users size={11} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">Currently viewing</span>
              </div>
              <div className="space-y-2">
                {COLLABORATORS.map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40` }}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.action}</div>
                    </div>
                    <motion.div className="w-1.5 h-1.5 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                      style={{ background: c.color }} />
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button onClick={() => setShowHelp(!showHelp)} className="p-1.5 rounded hover:bg-white/10 transition-colors ml-1">
          <Info size={13} className="text-muted-foreground" />
        </button>
      </header>

      {/* Help tooltip */}
      {showHelp && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 right-4 z-50 rounded-xl p-4 text-xs space-y-1.5"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", width: 220 }}>
          <div className="font-semibold text-foreground mb-2">Node Editor Controls</div>
          {[
            ["Drag node", "Move it around"],
            ["Scroll", "Zoom in/out"],
            ["Drag canvas", "Pan view"],
            ["Zoom buttons", "Top-right controls"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono text-[10px]">{v}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <NodePalette />
        <div className="flex-1 relative overflow-hidden">
          <NodeEditorCanvas />
          <div className="absolute bottom-0 inset-x-0 h-7 flex items-center px-4 gap-4"
            style={{ background: "hsl(var(--sidebar-background)/0.85)", backdropFilter: "blur(8px)", borderTop: "1px solid hsl(var(--sidebar-border))" }}>
            <span className="text-[10px] text-muted-foreground">12 nodes · 12 connections</span>
            <span className="text-[10px] text-muted-foreground">4 agent nodes active</span>
            <div className="flex-1" />
            <span className="text-[10px] font-mono text-muted-foreground">world://main.space/nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
