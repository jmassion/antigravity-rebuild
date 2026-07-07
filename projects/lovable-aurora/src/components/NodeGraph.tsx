import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  label: string;
  type: "data" | "event" | "agent" | "media" | "spatial";
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
}

interface Edge {
  from: string;
  to: string;
  type: "data" | "event" | "agent" | "media" | "spatial";
}

const PORT_COLORS = {
  data: "hsl(185, 100%, 55%)",
  event: "hsl(252, 100%, 68%)",
  agent: "hsl(310, 100%, 65%)",
  media: "hsl(45, 100%, 60%)",
  spatial: "hsl(140, 80%, 50%)",
};

const SAMPLE_NODES: Node[] = [
  { id: "1", label: "User Input", type: "event", x: 60, y: 80, inputs: [], outputs: ["event"] },
  { id: "2", label: "Auth Agent", type: "agent", x: 230, y: 40, inputs: ["event"], outputs: ["data"] },
  { id: "3", label: "Data Store", type: "data", x: 230, y: 140, inputs: ["event"], outputs: ["data"] },
  { id: "4", label: "Builder Agent", type: "agent", x: 400, y: 90, inputs: ["data", "data"], outputs: ["spatial"] },
  { id: "5", label: "3D Card", type: "spatial", x: 560, y: 90, inputs: ["spatial"], outputs: [] },
];

const SAMPLE_EDGES: Edge[] = [
  { from: "1", to: "2", type: "event" },
  { from: "1", to: "3", type: "event" },
  { from: "2", to: "4", type: "data" },
  { from: "3", to: "4", type: "data" },
  { from: "4", to: "5", type: "spatial" },
];

function NodeCard({ node, animated }: { node: Node; animated: boolean }) {
  const color = PORT_COLORS[node.type];
  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: parseInt(node.id) * 0.1 }}
      className="absolute glass rounded-lg px-3 py-2 min-w-[90px] cursor-grab"
      style={{
        left: node.x,
        top: node.y,
        border: `1px solid ${color}40`,
        boxShadow: `0 0 12px 0 ${color}20`,
      }}
    >
      {/* Type indicator */}
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
        />
        <span className="text-[9px] uppercase tracking-widest" style={{ color }}>
          {node.type}
        </span>
      </div>
      <div className="text-[11px] font-medium text-foreground/90 whitespace-nowrap">
        {node.label}
      </div>

      {/* Output ports */}
      {node.outputs.map((port, i) => (
        <div
          key={i}
          className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: PORT_COLORS[port as keyof typeof PORT_COLORS] || color,
            borderColor: "hsl(var(--background))",
            boxShadow: `0 0 6px ${color}`,
            top: `${50 + i * 20}%`,
          }}
        />
      ))}

      {/* Input ports */}
      {node.inputs.map((port, i) => (
        <div
          key={i}
          className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: PORT_COLORS[port as keyof typeof PORT_COLORS] || color,
            borderColor: "hsl(var(--background))",
            top: `${50 + i * 20}%`,
          }}
        />
      ))}
    </motion.div>
  );
}

export function NodeGraph({ animated = true }: { animated?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [flowOffset, setFlowOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowOffset((prev) => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const getNodeCenter = (id: string): [number, number] => {
    const node = SAMPLE_NODES.find((n) => n.id === id);
    if (!node) return [0, 0];
    return [node.x + 50, node.y + 30];
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* SVG for connection lines */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {SAMPLE_EDGES.map((edge, i) => {
          const [x1, y1] = getNodeCenter(edge.from);
          const [x2, y2] = getNodeCenter(edge.to);
          const color = PORT_COLORS[edge.type];
          const cx1 = x1 + (x2 - x1) * 0.5;
          const cx2 = x2 - (x2 - x1) * 0.5;
          const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

          return (
            <g key={i}>
              {/* Base cable */}
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.2"
              />
              {/* Animated flow */}
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="8 12"
                strokeDashoffset={-flowOffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="relative" style={{ zIndex: 1 }}>
        {SAMPLE_NODES.map((node) => (
          <NodeCard key={node.id} node={node} animated={animated} />
        ))}
      </div>
    </div>
  );
}
