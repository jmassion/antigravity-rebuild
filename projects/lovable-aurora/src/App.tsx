import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Index from "./pages/Index";
import Workspace from "./pages/Workspace";
import NodeEditor from "./pages/NodeEditor";
import HyperTalk from "./pages/HyperTalk";
import Marketplace from "./pages/Marketplace";
import Worlds from "./pages/Worlds";
import Connectors from "./pages/Connectors";
import Studio from "./pages/Studio";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import FlowCanvas3D from "./pages/FlowCanvas3D";

const queryClient = new QueryClient();

function LiveAmbientTicker() {
  const [eventCount, setEventCount] = useState(247);
  useEffect(() => {
    const interval = setInterval(() => {
      setEventCount((prev) => prev + Math.floor(Math.random() * 4) + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono cursor-default select-none"
      style={{
        background: "hsl(var(--card) / 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid hsl(var(--border) / 0.6)",
        boxShadow: "0 4px 20px hsl(var(--background) / 0.5)",
      }}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ background: "hsl(var(--node-spatial))" }}
      />
      <span style={{ color: "hsl(var(--node-spatial))" }}>Live</span>
      <motion.span
        key={eventCount}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-muted-foreground"
      >
        {eventCount.toLocaleString()} events
      </motion.span>
    </motion.div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/nodes" element={<NodeEditor />} />
          <Route path="/hypertalk" element={<HyperTalk />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/worlds" element={<Worlds />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/flow" element={<FlowCanvas3D />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <LiveAmbientTicker />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
