import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentNode } from "./AgentNode";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: "data" | "event" | "agent" | "media" | "spatial";
  agentType?: "builder" | "data" | "review" | "narrator";
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
}

interface Edge {
  id: string;
  from: string;
  fromPort: number;
  to: string;
  toPort: number;
  type: string;
}

interface PendingConnection {
  fromId: string;
  fromPort: number;
  fromType: string;
  fromX: number;
  fromY: number;
  mouseX: number;
  mouseY: number;
}

const PORT_COLORS: Record<string, string> = {
  data: "hsl(185, 100%, 55%)",
  event: "hsl(252, 100%, 68%)",
  agent: "hsl(310, 100%, 65%)",
  media: "hsl(45, 100%, 60%)",
  spatial: "hsl(140, 80%, 50%)",
};

const INITIAL_NODES: NodeData[] = [
  { id: "1", label: "User Input", type: "event", x: 60, y: 60, inputs: [], outputs: ["event"] },
  { id: "2", label: "Auth Guard", type: "event", x: 60, y: 160, inputs: ["event"], outputs: ["event"] },
  { id: "3", label: "Auth Agent", type: "agent", agentType: "builder", x: 260, y: 40, inputs: ["event"], outputs: ["data", "agent"] },
  { id: "4", label: "User Store", type: "data", x: 260, y: 170, inputs: ["event"], outputs: ["data"] },
  { id: "5", label: "Builder Agent", type: "agent", agentType: "builder", x: 470, y: 80, inputs: ["data", "data"], outputs: ["spatial", "agent"] },
  { id: "6", label: "Review Agent", type: "agent", agentType: "review", x: 470, y: 240, inputs: ["agent"], outputs: ["data"] },
  { id: "7", label: "3D Card World", type: "spatial", x: 680, y: 60, inputs: ["spatial"], outputs: [] },
  { id: "8", label: "Narrator Agent", type: "agent", agentType: "narrator", x: 680, y: 200, inputs: ["data", "agent"], outputs: ["agent"] },
  { id: "9", label: "API Connector", type: "data", x: 60, y: 280, inputs: ["event"], outputs: ["data"] },
  { id: "10", label: "Media Store", type: "media", x: 260, y: 310, inputs: ["data"], outputs: ["media"] },
  { id: "11", label: "Voice Input", type: "event", x: 60, y: 370, inputs: [], outputs: ["event"] },
  { id: "12", label: "HyperTalk Script", type: "event", x: 470, y: 360, inputs: ["event", "data"], outputs: ["event", "spatial"] },
];

let edgeIdCounter = 100;
const INITIAL_EDGES: Edge[] = [
  { id: "e1", from: "1", fromPort: 0, to: "3", toPort: 0, type: "event" },
  { id: "e2", from: "2", fromPort: 0, to: "4", toPort: 0, type: "event" },
  { id: "e3", from: "3", fromPort: 0, to: "5", toPort: 0, type: "data" },
  { id: "e4", from: "4", fromPort: 0, to: "5", toPort: 1, type: "data" },
  { id: "e5", from: "5", fromPort: 0, to: "7", toPort: 0, type: "spatial" },
  { id: "e6", from: "5", fromPort: 1, to: "6", toPort: 0, type: "agent" },
  { id: "e7", from: "6", fromPort: 0, to: "8", toPort: 0, type: "data" },
  { id: "e8", from: "3", fromPort: 1, to: "8", toPort: 1, type: "agent" },
  { id: "e9", from: "9", fromPort: 0, to: "4", toPort: 0, type: "data" },
  { id: "e10", from: "9", fromPort: 0, to: "10", toPort: 0, type: "data" },
  { id: "e11", from: "11", fromPort: 0, to: "12", toPort: 0, type: "event" },
  { id: "e12", from: "12", fromPort: 0, to: "7", toPort: 0, type: "spatial" },
];

function getPortPosition(node: NodeData, portIndex: number, dir: "in" | "out"): [number, number] {
  const isAgent = node.type === "agent";
  const nodeW = isAgent ? 120 : 100;
  const nodeH = isAgent ? 70 : 56;
  const portCount = dir === "out" ? node.outputs.length : node.inputs.length;
  const spacing = nodeH / (portCount + 1);
  const y = node.y + spacing * (portIndex + 1);
  const x = dir === "out" ? node.x + nodeW : node.x;
  return [x, y];
}

export function NodeEditorCanvas() {
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [flowOffset, setFlowOffset] = useState(0);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ id: string; port: number; dir: "in" | "out" } | null>(null);
  const [deletingEdge, setDeletingEdge] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setFlowOffset((p) => (p + 1) % 100), 30);
    return () => clearInterval(interval);
  }, []);

  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleOutputPortMouseDown = useCallback((
    nodeId: string, portIndex: number, portType: string,
    clientX: number, clientY: number, e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const [px, py] = getPortPosition(node, portIndex, "out");
    const canvasPos = getCanvasPos(clientX, clientY);
    setPending({
      fromId: nodeId,
      fromPort: portIndex,
      fromType: portType,
      fromX: px,
      fromY: py,
      mouseX: canvasPos.x,
      mouseY: canvasPos.y,
    });
  }, [nodes, getCanvasPos]);

  const handleInputPortMouseUp = useCallback((
    nodeId: string, portIndex: number, portType: string
  ) => {
    if (!pending) return;
    if (pending.fromId === nodeId) { setPending(null); return; }
    // Create new edge
    const newEdge: Edge = {
      id: `e${++edgeIdCounter}`,
      from: pending.fromId,
      fromPort: pending.fromPort,
      to: nodeId,
      toPort: portIndex,
      type: portType,
    };
    setEdges((prev) => [...prev, newEdge]);
    setPending(null);
  }, [pending]);

  const handleNodeDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pending) return;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setDragging({ id, startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y });
  }, [nodes, pending]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const dx = (e.clientX - dragging.startX) / zoom;
      const dy = (e.clientY - dragging.startY) / zoom;
      setNodes((prev) => prev.map((n) =>
        n.id === dragging.id ? { ...n, x: dragging.nodeX + dx, y: dragging.nodeY + dy } : n
      ));
    }
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: panStart.panX + dx, y: panStart.panY + dy });
    }
    if (pending) {
      const pos = getCanvasPos(e.clientX, e.clientY);
      setPending((p) => p ? { ...p, mouseX: pos.x, mouseY: pos.y } : null);
    }
  }, [dragging, isPanning, panStart, zoom, pending, getCanvasPos]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
    if (pending) setPending(null);
  }, [pending]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "svg") {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
    }
  }, [pan]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(2, z * delta)));
  }, []);

  const handleDeleteEdge = useCallback((edgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingEdge(edgeId);
    setTimeout(() => {
      setEdges((prev) => prev.filter((ed) => ed.id !== edgeId));
      setDeletingEdge(null);
    }, 300);
  }, []);

  const regularNodes = nodes.filter((n) => n.type !== "agent");
  const agentNodes = nodes.filter((n) => n.type === "agent");

  const getCursor = () => {
    if (isPanning) return "grabbing";
    if (pending) return "crosshair";
    return "default";
  };

  return (
    <div className="relative w-full h-full overflow-hidden canvas-dots" style={{ cursor: getCursor() }}>
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        {[
          { icon: ZoomIn, action: () => setZoom((z) => Math.min(2, z * 1.2)) },
          { icon: ZoomOut, action: () => setZoom((z) => Math.max(0.3, z / 1.2)) },
          { icon: Maximize2, action: () => { setZoom(1); setPan({ x: 20, y: 20 }); } },
        ].map(({ icon: Icon, action }, i) => (
          <button
            key={i}
            onClick={action}
            className="w-7 h-7 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ border: "1px solid hsl(var(--border))" }}
          >
            <Icon size={12} className="text-muted-foreground" />
          </button>
        ))}
        <div className="text-[9px] text-center text-muted-foreground font-mono mt-1">{Math.round(zoom * 100)}%</div>
      </div>

      {/* Help hint */}
      {pending && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full text-xs glass"
          style={{ border: "1px solid hsl(var(--node-event) / 0.4)", color: "hsl(var(--node-event))" }}>
          Drop on an input port to connect · Esc to cancel
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        onKeyDown={(e) => { if (e.key === "Escape") setPending(null); }}
        tabIndex={0}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            position: "absolute",
            width: 1200,
            height: 600,
          }}
        >
          {/* SVG layer: edges + pending connection */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: 1200, height: 600, zIndex: 0, overflow: "visible" }}>
            {/* Existing edges */}
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const [x1, y1] = getPortPosition(fromNode, edge.fromPort, "out");
              const [x2, y2] = getPortPosition(toNode, edge.toPort, "in");
              const color = PORT_COLORS[edge.type] || PORT_COLORS.data;
              const cx1 = x1 + (x2 - x1) * 0.5;
              const cx2 = x2 - (x2 - x1) * 0.5;
              const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const isDeleting = deletingEdge === edge.id;
              return (
                <g key={edge.id} className="pointer-events-auto">
                  {/* Wider invisible hit area */}
                  <path d={d} fill="none" stroke="transparent" strokeWidth="12"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPort(null)}
                  />
                  <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={isDeleting ? 0 : 0.2}
                    style={{ transition: "stroke-opacity 0.3s" }} />
                  <path
                    d={d} fill="none" stroke={color} strokeWidth="2"
                    strokeDasharray="8 12" strokeDashoffset={-flowOffset}
                    strokeLinecap="round"
                    strokeOpacity={isDeleting ? 0 : 1}
                    style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-opacity 0.3s" }}
                  />
                  {/* Delete button at midpoint */}
                  <circle cx={mx} cy={my} r={6} fill="hsl(var(--background))" stroke={color} strokeWidth="1"
                    style={{ cursor: "pointer" }}
                    className="pointer-events-auto"
                    onClick={(e) => handleDeleteEdge(edge.id, e as unknown as React.MouseEvent)}
                  />
                  <text x={mx} y={my + 3.5} textAnchor="middle" fontSize={8} fill={color}
                    style={{ cursor: "pointer", userSelect: "none", pointerEvents: "none" }}>
                    ✕
                  </text>
                </g>
              );
            })}

            {/* Pending connection bezier */}
            {pending && (() => {
              const color = PORT_COLORS[pending.fromType] || PORT_COLORS.data;
              const cx1 = pending.fromX + (pending.mouseX - pending.fromX) * 0.5;
              const cx2 = pending.mouseX - (pending.mouseX - pending.fromX) * 0.5;
              const d = `M ${pending.fromX} ${pending.fromY} C ${cx1} ${pending.fromY}, ${cx2} ${pending.mouseY}, ${pending.mouseX} ${pending.mouseY}`;
              return (
                <path
                  d={d} fill="none" stroke={color} strokeWidth="2"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${color})`, pointerEvents: "none" }}
                />
              );
            })()}
          </svg>

          {/* Regular nodes */}
          {regularNodes.map((node) => {
            const color = PORT_COLORS[node.type] || PORT_COLORS.data;
            return (
              <motion.div
                key={node.id}
                className="absolute glass rounded-lg px-3 py-2 min-w-[90px] cursor-grab select-none"
                style={{ left: node.x, top: node.y, border: `1px solid ${color}40`, boxShadow: `0 0 12px 0 ${color}20`, zIndex: 1 }}
                onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                  <span className="text-[9px] uppercase tracking-widest" style={{ color }}>{node.type}</span>
                </div>
                <div className="text-[11px] font-medium text-foreground/90 whitespace-nowrap">{node.label}</div>

                {/* Output ports */}
                {node.outputs.map((port, i) => {
                  const isHovered = hoveredPort?.id === node.id && hoveredPort?.port === i && hoveredPort?.dir === "out";
                  const portColor = PORT_COLORS[port] || color;
                  return (
                    <motion.div
                      key={`out-${i}`}
                      className="absolute right-[-7px] w-3.5 h-3.5 rounded-full border-2 cursor-crosshair"
                      style={{
                        top: `${(i + 1) * (100 / (node.outputs.length + 1))}%`,
                        background: portColor,
                        borderColor: "hsl(var(--background))",
                        boxShadow: isHovered || pending?.fromId === node.id ? `0 0 10px ${portColor}` : "none",
                        zIndex: 10,
                        transform: "translateY(-50%)",
                      }}
                      animate={{ scale: isHovered ? 1.4 : 1 }}
                      onMouseEnter={() => setHoveredPort({ id: node.id, port: i, dir: "out" })}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseDown={(e) => handleOutputPortMouseDown(node.id, i, port, e.clientX, e.clientY, e)}
                    />
                  );
                })}

                {/* Input ports */}
                {node.inputs.map((port, i) => {
                  const isHovered = hoveredPort?.id === node.id && hoveredPort?.port === i && hoveredPort?.dir === "in";
                  const portColor = PORT_COLORS[port] || color;
                  const isCompatible = pending && pending.fromType === port;
                  return (
                    <motion.div
                      key={`in-${i}`}
                      className="absolute left-[-7px] w-3.5 h-3.5 rounded-full border-2"
                      style={{
                        top: `${(i + 1) * (100 / (node.inputs.length + 1))}%`,
                        background: portColor,
                        borderColor: "hsl(var(--background))",
                        boxShadow: isCompatible ? `0 0 14px ${portColor}` : isHovered ? `0 0 8px ${portColor}` : "none",
                        zIndex: 10,
                        transform: "translateY(-50%)",
                        cursor: pending ? (isCompatible ? "cell" : "not-allowed") : "default",
                        outline: isCompatible ? `2px solid ${portColor}60` : "none",
                      }}
                      animate={{ scale: isCompatible ? 1.5 : isHovered ? 1.2 : 1 }}
                      onMouseEnter={() => setHoveredPort({ id: node.id, port: i, dir: "in" })}
                      onMouseLeave={() => setHoveredPort(null)}
                      onMouseUp={() => handleInputPortMouseUp(node.id, i, port)}
                    />
                  );
                })}
              </motion.div>
            );
          })}

          {/* Agent nodes */}
          {agentNodes.map((node) => (
            <AgentNode
              key={node.id}
              id={node.id}
              label={node.label}
              agentType={node.agentType || "builder"}
              x={node.x}
              y={node.y}
              inputs={node.inputs}
              outputs={node.outputs}
              onDragStart={handleNodeDragStart}
              onOutputPortMouseDown={(portIndex, portType, clientX, clientY, e) =>
                handleOutputPortMouseDown(node.id, portIndex, portType, clientX, clientY, e)}
              onInputPortMouseUp={(portIndex, portType) =>
                handleInputPortMouseUp(node.id, portIndex, portType)}
              pending={pending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
