import { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HyperCard3DScene } from "@/components/three/HyperCard3DScene";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { WorkspaceToolbar } from "@/components/workspace/WorkspaceToolbar";
import { PropertiesPanel } from "@/components/workspace/PropertiesPanel";
import { BottomPanel } from "@/components/workspace/BottomPanel";
import { PresenceBar } from "@/components/PresenceIndicator";
import {
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  Hexagon, ChevronRight, Network, ArrowLeft, Mic
} from "lucide-react";

export default function Workspace() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">

      {/* ─── TOP BAR ─── */}
      <header
        className="h-11 flex-shrink-0 flex items-center px-3 gap-3 z-20"
        style={{
          background: "hsl(var(--sidebar-background))",
          borderBottom: "1px solid hsl(var(--sidebar-border))",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={() => navigate("/")}
            className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Back to home"
          >
            <Hexagon size={13} className="text-primary-foreground" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft size={10} />
            Home
          </button>
          <ChevronRight size={10} />
          <span className="text-foreground/70">Main World</span>
          <ChevronRight size={10} />
          <span className="text-foreground/70">Dashboard Space</span>
          <ChevronRight size={10} />
          <span className="text-foreground font-medium">Auth Stack</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Voice indicator */}
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-[11px]"
          style={{
            background: voiceActive ? "hsl(var(--node-agent)/0.15)" : "transparent",
            color: voiceActive ? "hsl(var(--node-agent))" : "hsl(var(--muted-foreground))",
            border: `1px solid ${voiceActive ? "hsl(var(--node-agent)/0.3)" : "transparent"}`,
          }}
        >
          <motion.div
            animate={voiceActive ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <Mic size={11} />
          </motion.div>
          {voiceActive ? "Listening" : "Voice"}
        </button>

        {/* Presence */}
        <PresenceBar />

        {/* Panel toggles */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Toggle sidebar"
          >
            {leftOpen
              ? <PanelLeftClose size={13} className="text-muted-foreground" />
              : <PanelLeftOpen size={13} className="text-muted-foreground" />
            }
          </button>
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Toggle properties"
          >
            {rightOpen
              ? <PanelRightClose size={13} className="text-muted-foreground" />
              : <PanelRightOpen size={13} className="text-muted-foreground" />
            }
          </button>
        </div>
      </header>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar */}
        <WorkspaceSidebar collapsed={!leftOpen} />

        {/* Center + bottom */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* 3D Canvas area */}
          <div className="flex-1 relative overflow-hidden canvas-dots">
            {/* R3F World */}
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-muted-foreground text-xs">Loading world...</div>
              </div>
            }>
              <HyperCard3DScene />
            </Suspense>

            {/* Toolbar */}
            <WorkspaceToolbar />

            {/* Node editor shortcut */}
            <button
              onClick={() => navigate("/nodes")}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium glass hover:bg-white/10 transition-all"
              style={{ border: "1px solid hsl(var(--border))" }}
            >
              <Network size={12} className="text-node-data" />
              <span className="text-muted-foreground">Open Node Editor</span>
            </button>

            {/* Status bar overlay */}
            <div
              className="absolute bottom-0 inset-x-0 h-7 flex items-center px-3 gap-4 z-10"
              style={{
                background: "hsl(var(--sidebar-background)/0.85)",
                backdropFilter: "blur(8px)",
                borderTop: "1px solid hsl(var(--sidebar-border))",
              }}
            >
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ background: "hsl(var(--node-spatial))" }}
                />
                <span className="text-[10px] text-muted-foreground">Live · 4 agents active</span>
              </div>
              <div className="text-[10px] text-muted-foreground">x: 0.00 · y: 0.00 · z: 5.00</div>
              <div className="flex-1" />
              <div className="text-[10px] text-muted-foreground font-mono">Phase 1 — Foundation</div>
            </div>
          </div>

          {/* Bottom panel */}
          <BottomPanel />
        </div>

        {/* Right properties panel */}
        <PropertiesPanel collapsed={!rightOpen} />
      </div>
    </div>
  );
}
