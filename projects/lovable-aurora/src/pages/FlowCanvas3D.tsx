import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Text, Line, Html, Float, Outlines, Trail, Billboard, MeshDistortMaterial, CameraShake } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hexagon, ArrowLeft, Plus, Trash2, Layers3, Cpu, Database, Zap, Globe,
  Music, ChevronRight, Info, Box, Play, Square, Maximize2, Focus,
  Copy, Unlink, Flag, Map, Undo2, Redo2, Save, Download, Upload, Users, X,
  Grid3x3, Search, Clipboard, ShieldCheck, GitBranch, Workflow,
  LayoutDashboard, Command, ChevronLeft, ChevronRight as ChevronRightIcon, RotateCcw,
  Tag, Hash, Filter, Share2, Pin, Presentation, Pause,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Command as CommandPrimitive,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { toast } from "@/hooks/use-toast";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type PortType = "data" | "event" | "agent" | "spatial" | "media";

interface Port {
  id: string;
  label: string;
  type: PortType;
  dir: "in" | "out";
  index: number;
}

interface FlowNode {
  id: string;
  label: string;
  type: PortType;
  subtype?: string;
  pos: THREE.Vector3;
  ports: Port[];
  color: string;
  description?: string;
  isEntryPoint?: boolean;
  metadata?: Record<string, string>;
  tags?: string[];
  accentColor?: string;
}

interface FlowEdge {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  type: PortType;
}

interface PendingWire {
  fromNodeId: string;
  fromPortId: string;
  fromPos: THREE.Vector3;
  portType: PortType;
}

interface NodeGroup {
  id: string;
  label: string;
  nodeIds: string[];
  color: string;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PORT_COLORS: Record<PortType, string> = {
  data:    "#0891b2",
  event:   "#7c3aed",
  agent:   "#ec4899",
  spatial: "#10b981",
  media:   "#f59e0b",
};

const GROUP_COLORS = ["#7c3aed", "#0891b2", "#ec4899", "#10b981", "#f59e0b"];

// ─── PRESETS ─────────────────────────────────────────────────────────────────

interface FlowPreset {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  nodes: { templateIdx: number; offset: [number, number, number] }[];
  edges: [number, number, number, number][]; // [fromNodeIdx, fromPortIdx, toNodeIdx, toPortIdx]
}

const NODE_TEMPLATES = [
  { type: "event"   as PortType, label: "Trigger",    icon: Zap,      description: "Start of a flow" },
  { type: "data"    as PortType, label: "Transform",  icon: Database, description: "Transform data" },
  { type: "agent"   as PortType, label: "AI Agent",   icon: Cpu,      description: "AI reasoning node" },
  { type: "spatial" as PortType, label: "3D Card",    icon: Box,      description: "Spatial card output" },
  { type: "media"   as PortType, label: "Media",      icon: Music,    description: "Audio / Video" },
  { type: "event"   as PortType, label: "Condition",  icon: Layers3,  description: "Branch logic" },
  { type: "data"    as PortType, label: "API Call",   icon: Globe,    description: "HTTP connector" },
  { type: "agent"   as PortType, label: "Narrator",   icon: Cpu,      description: "Voice narration" },
  { type: "data"    as PortType, label: "Auth Guard", icon: ShieldCheck, description: "Validate auth token" },
  { type: "data"    as PortType, label: "Transform",  icon: GitBranch,   description: "Data transform step" },
];

// 0=Trigger,1=Transform,2=AI Agent,3=3D Card,4=Media,5=Condition,6=API Call,7=Narrator,8=Auth Guard,9=Transform2
const FLOW_PRESETS: FlowPreset[] = [
  {
    label: "Auth Flow",
    description: "Trigger → Auth Guard → Data Store",
    icon: ShieldCheck,
    color: "#7c3aed",
    nodes: [
      { templateIdx: 0, offset: [-3, 1.5, 0] },
      { templateIdx: 8, offset: [0, 1.5, 0] },
      { templateIdx: 1, offset: [3, 1.5, 0] },
    ],
    edges: [[0, 0, 1, 0], [1, 0, 2, 0]],
  },
  {
    label: "Data Pipeline",
    description: "API Call → Transform → Data Store",
    icon: Database,
    color: "#0891b2",
    nodes: [
      { templateIdx: 6, offset: [-3, 0, 0] },
      { templateIdx: 9, offset: [0, 0, 0] },
      { templateIdx: 1, offset: [3, 0, 0] },
    ],
    edges: [[0, 0, 1, 0], [1, 0, 2, 0]],
  },
  {
    label: "Agent Chain",
    description: "Trigger → AI Agent → Narrator",
    icon: Cpu,
    color: "#ec4899",
    nodes: [
      { templateIdx: 0, offset: [-3, -1, 0] },
      { templateIdx: 2, offset: [0, -1, 0] },
      { templateIdx: 7, offset: [3, -1, 0] },
    ],
    edges: [[0, 0, 1, 0], [1, 0, 2, 0]],
  },
  {
    label: "Media Pipeline",
    description: "Trigger → AI Agent → Media",
    icon: Workflow,
    color: "#f59e0b",
    nodes: [
      { templateIdx: 0, offset: [-3, -2.5, 0] },
      { templateIdx: 2, offset: [0, -2.5, 0] },
      { templateIdx: 4, offset: [3, -2.5, 0] },
    ],
    edges: [[0, 0, 1, 0], [1, 0, 2, 0]],
  },
];

function makeNode(template: typeof NODE_TEMPLATES[number], pos: THREE.Vector3, id: string): FlowNode {
  return {
    id,
    label: template.label,
    type: template.type,
    pos: pos.clone(),
    color: PORT_COLORS[template.type],
    description: template.description,
    ports: [
      ...(template.label !== "Trigger" ? [{ id: `${id}-in0`, label: "in", type: template.type, dir: "in" as const, index: 0 }] : []),
      { id: `${id}-out0`, label: "out", type: template.type, dir: "out" as const, index: 0 },
      ...(template.label === "Condition" ? [
        { id: `${id}-out1`, label: "true",  type: "event" as PortType, dir: "out" as const, index: 1 },
        { id: `${id}-out2`, label: "false", type: "data"  as PortType, dir: "out" as const, index: 2 },
      ] : []),
    ],
  };
}

let nodeCounter = 20;

// ─── INITIAL GRAPH ────────────────────────────────────────────────────────────

const INITIAL_NODES: FlowNode[] = [
  {
    id: "n1", label: "User Auth",  type: "event",   color: "#7c3aed", description: "Auth trigger", isEntryPoint: true,
    pos: new THREE.Vector3(-5, 1.5, 0),
    ports: [
      { id: "n1-out0", label: "user",  type: "event", dir: "out", index: 0 },
      { id: "n1-out1", label: "error", type: "data",  dir: "out", index: 1 },
    ],
  },
  {
    id: "n2", label: "Auth Guard", type: "event",   color: "#7c3aed", description: "Validate token",
    pos: new THREE.Vector3(-1.5, 2.5, 1),
    ports: [
      { id: "n2-in0",  label: "in",   type: "event", dir: "in",  index: 0 },
      { id: "n2-out0", label: "pass", type: "event", dir: "out", index: 0 },
      { id: "n2-out1", label: "fail", type: "data",  dir: "out", index: 1 },
    ],
  },
  {
    id: "n3", label: "Builder AI", type: "agent",   color: "#ec4899", description: "GPT-4o reasoning",
    pos: new THREE.Vector3(2, 1, -1.5),
    ports: [
      { id: "n3-in0",  label: "ctx",   type: "event",   dir: "in",  index: 0 },
      { id: "n3-out0", label: "cards", type: "spatial", dir: "out", index: 0 },
      { id: "n3-out1", label: "log",   type: "agent",   dir: "out", index: 1 },
    ],
  },
  {
    id: "n4", label: "Data Store", type: "data",    color: "#0891b2", description: "Supabase write",
    pos: new THREE.Vector3(-2, -2, 2),
    ports: [
      { id: "n4-in0",  label: "write", type: "data", dir: "in",  index: 0 },
      { id: "n4-out0", label: "id",    type: "data", dir: "out", index: 0 },
    ],
  },
  {
    id: "n5", label: "3D Card",    type: "spatial", color: "#10b981", description: "Render spatial card",
    pos: new THREE.Vector3(5.5, 0.5, 0.5),
    ports: [
      { id: "n5-in0",  label: "layout", type: "spatial", dir: "in",  index: 0 },
      { id: "n5-out0", label: "world",  type: "spatial", dir: "out", index: 0 },
    ],
  },
  {
    id: "n6", label: "Narrator",   type: "agent",   color: "#ec4899", description: "Voice output",
    pos: new THREE.Vector3(1, -1.5, -3),
    ports: [
      { id: "n6-in0",  label: "text",  type: "agent", dir: "in",  index: 0 },
      { id: "n6-out0", label: "voice", type: "media", dir: "out", index: 0 },
    ],
  },
  {
    id: "n7", label: "API Fetch",  type: "data",    color: "#0891b2", description: "HTTP connector",
    pos: new THREE.Vector3(-4, -0.5, -2),
    ports: [
      { id: "n7-out0", label: "json", type: "data", dir: "out", index: 0 },
    ],
  },
  {
    id: "n8", label: "Media Out",  type: "media",   color: "#f59e0b", description: "Video / Audio sink",
    pos: new THREE.Vector3(3, 3, 2.5),
    ports: [
      { id: "n8-in0", label: "stream", type: "media", dir: "in", index: 0 },
    ],
  },
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: "e1", fromNodeId: "n1", fromPortId: "n1-out0", toNodeId: "n2", toPortId: "n2-in0", type: "event" },
  { id: "e2", fromNodeId: "n2", fromPortId: "n2-out0", toNodeId: "n3", toPortId: "n3-in0", type: "event" },
  { id: "e3", fromNodeId: "n3", fromPortId: "n3-out0", toNodeId: "n5", toPortId: "n5-in0", type: "spatial" },
  { id: "e4", fromNodeId: "n7", fromPortId: "n7-out0", toNodeId: "n4", toPortId: "n4-in0", type: "data" },
  { id: "e5", fromNodeId: "n3", fromPortId: "n3-out1", toNodeId: "n6", toPortId: "n6-in0", type: "agent" },
  { id: "e6", fromNodeId: "n6", fromPortId: "n6-out0", toNodeId: "n8", toPortId: "n8-in0", type: "media" },
];

// ─── SERIALIZATION ───────────────────────────────────────────────────────────

// ─── ANNOTATION TYPE ─────────────────────────────────────────────────────────

interface NoteAnnotation {
  id: string;
  nodeId: string;
  text: string;
  minimized: boolean;
  color: string;
}

const NOTE_COLORS = ["#facc15", "#34d399", "#60a5fa", "#f87171", "#c084fc", "#fb923c"];

type SerializedNode = Omit<FlowNode, "pos"> & { pos: [number, number, number] };
type FlowSnapshot = { nodes: SerializedNode[]; edges: FlowEdge[]; groups?: NodeGroup[]; annotations?: NoteAnnotation[] };

function serializeGraph(nodes: FlowNode[], edges: FlowEdge[], groups: NodeGroup[] = [], annotations: NoteAnnotation[] = []): string {
  return JSON.stringify({
    nodes: nodes.map(n => ({ ...n, pos: [n.pos.x, n.pos.y, n.pos.z] as [number, number, number] })),
    edges,
    groups,
    annotations,
  });
}

function deserializeGraph(json: string): { nodes: FlowNode[]; edges: FlowEdge[]; groups: NodeGroup[]; annotations: NoteAnnotation[] } {
  const parsed = JSON.parse(json) as FlowSnapshot;
  return {
    nodes: parsed.nodes.map(n => ({ ...n, pos: new THREE.Vector3(...n.pos) })),
    edges: parsed.edges,
    groups: parsed.groups ?? [],
    annotations: parsed.annotations ?? [],
  };
}

const LS_KEY = "hypercard-flow";

// ─── TOPO BFS ─────────────────────────────────────────────────────────────────

function topoWaves(nodes: FlowNode[], edges: FlowEdge[]): string[][] {
  const inDeg: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  for (const n of nodes) { inDeg[n.id] = 0; adj[n.id] = []; }
  for (const e of edges) {
    inDeg[e.toNodeId] = (inDeg[e.toNodeId] ?? 0) + 1;
    if (adj[e.fromNodeId]) adj[e.fromNodeId].push(e.toNodeId);
  }
  const waves: string[][] = [];
  let queue = nodes.filter(n => (inDeg[n.id] ?? 0) === 0).map(n => n.id);
  const visited = new Set<string>();
  while (queue.length > 0) {
    waves.push([...queue]);
    queue.forEach(id => visited.add(id));
    const next: string[] = [];
    for (const id of queue) {
      for (const nb of (adj[id] ?? [])) {
        if (!visited.has(nb)) {
          const deg = (inDeg[nb] ?? 0) - 1;
          inDeg[nb] = deg;
          if (deg === 0) next.push(nb);
        }
      }
    }
    queue = next;
  }
  return waves;
}

// ─── AUTO LAYOUT ─────────────────────────────────────────────────────────────

function autoLayout(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const waves = topoWaves(nodes, edges);
  if (waves.length === 0) return nodes;
  const totalWaves = waves.length;
  return nodes.map(n => {
    const waveIdx = waves.findIndex(w => w.includes(n.id));
    if (waveIdx === -1) return n;
    const posInWave = waves[waveIdx].indexOf(n.id);
    const waveLen = waves[waveIdx].length;
    return {
      ...n,
      pos: new THREE.Vector3(
        waveIdx * 4 - (totalWaves * 4) / 2,
        posInWave * 2.5 - ((waveLen - 1) * 2.5) / 2,
        0,
      ),
    };
  });
}

// ─── PORT WORLD POSITION ─────────────────────────────────────────────────────

function getPortWorldPos(node: FlowNode, portId: string): THREE.Vector3 {
  const port = node.ports.find(p => p.id === portId);
  if (!port) return node.pos.clone();
  const outs  = node.ports.filter(p => p.dir === "out");
  const ins   = node.ports.filter(p => p.dir === "in");
  const list  = port.dir === "out" ? outs : ins;
  const idx   = list.findIndex(p => p.id === portId);
  const total = list.length;
  const spread = 0.35;
  const yOff = total === 1 ? 0 : (idx / (total - 1) - 0.5) * spread * (total - 1);
  const xOff = port.dir === "out" ? 0.85 : -0.85;
  return new THREE.Vector3(node.pos.x + xOff, node.pos.y + yOff, node.pos.z);
}

// ─── NODE TYPE ICON ───────────────────────────────────────────────────────────

function NodeTypeIcon({ type, color }: { type: PortType; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.012;
      ref.current.rotation.x += 0.006;
    }
  });
  const col = useMemo(() => new THREE.Color(color), [color]);
  return (
    <mesh ref={ref} position={[-0.63, 0.18, 0.12]}>
      {type === "event"   && <octahedronGeometry args={[0.12, 0]} />}
      {type === "agent"   && <icosahedronGeometry args={[0.11, 0]} />}
      {type === "data"    && <boxGeometry args={[0.18, 0.18, 0.18]} />}
      {type === "spatial" && <torusKnotGeometry args={[0.07, 0.022, 48, 6]} />}
      {type === "media"   && <sphereGeometry args={[0.11, 12, 12]} />}
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.6} />
    </mesh>
  );
}

// ─── EDGE TUBE ───────────────────────────────────────────────────────────────

function EdgePacket({ curve, color, offset }: { curve: THREE.CatmullRomCurve3; color: string; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(offset);
  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.55) % 1;
    if (ref.current) {
      const pt = curve.getPoint(t.current);
      ref.current.position.copy(pt);
    }
  });
  return (
    <Trail width={0.22} length={5} color={color} attenuation={(w) => w * w}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.038, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
      </mesh>
    </Trail>
  );
}

function EdgeTube({ id, from, to, color, edgeType, animated, executing, onDelete }: {
  id: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  edgeType?: PortType;
  animated?: boolean;
  executing?: boolean;
  onDelete?: (id: string) => void;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const { outerGeo, innerGeo, curve } = useMemo(() => {
    const mid = new THREE.Vector3(
      (from.x + to.x) / 2 + (to.y - from.y) * 0.3,
      (from.y + to.y) / 2,
      (from.z + to.z) / 2 + (to.x - from.x) * 0.15,
    );
    const c = new THREE.CatmullRomCurve3([from.clone(), mid, to.clone()]);
    return {
      outerGeo: new THREE.TubeGeometry(c, 24, 0.038, 7, false),
      innerGeo: new THREE.TubeGeometry(c, 24, 0.014, 5, false),
      curve: c,
    };
  }, [from.x, from.y, from.z, to.x, to.y, to.z]);

  const midPos = useMemo(() => new THREE.Vector3(
    (from.x + to.x) / 2 + (to.y - from.y) * 0.3,
    (from.y + to.y) / 2 + 0.1,
    (from.z + to.z) / 2 + (to.x - from.x) * 0.15,
  ), [from.x, from.y, from.z, to.x, to.y, to.z]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matRef.current.uniforms.uSpeed.value = executing ? 2.8 : 0.9;
      matRef.current.uniforms.uGlow.value  = THREE.MathUtils.lerp(
        matRef.current.uniforms.uGlow.value, executing ? 1.6 : hovered ? 0.9 : 0.18, 0.1
      );
    }
  });

  const col = useMemo(() => new THREE.Color(color), [color]);

  return (
    <>
      {/* Outer glow tube — dim halo */}
      <mesh
        geometry={outerGeo}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onContextMenu={(e) => { e.stopPropagation(); onDelete?.(id); }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={executing ? 0.6 : 0.15}
          transparent
          opacity={executing ? 0.12 : 0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Inner bright core tube with animated shader */}
      <mesh geometry={innerGeo}>
        <shaderMaterial
          ref={matRef}
          vertexShader={`
            varying float vProgress;
            void main() {
              vProgress = uv.x;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uSpeed;
            uniform float uGlow;
            uniform vec3 uColor;
            varying float vProgress;
            void main() {
              float packet = fract(vProgress * 3.0 - uTime * uSpeed);
              float glow   = smoothstep(0.0, 0.12, packet) * smoothstep(0.22, 0.12, packet);
              float base   = uGlow * 0.12;
              gl_FragColor = vec4(uColor, base + glow * uGlow * 0.85);
            }
          `}
          uniforms={{
            uTime:  { value: 0 },
            uSpeed: { value: 0.9 },
            uGlow:  { value: 0.18 },
            uColor: { value: col },
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Traveling packets with Trail comet tails */}
      {executing && (
        <>
          <EdgePacket curve={curve} color={color} offset={0.0} />
          <EdgePacket curve={curve} color={color} offset={0.33} />
          <EdgePacket curve={curve} color={color} offset={0.66} />
        </>
      )}

      {/* Edge type label on hover */}
      {hovered && edgeType && (
        <Billboard follow>
          <Text
            position={midPos}
            fontSize={0.11}
            color={color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {edgeType.toUpperCase()}
          </Text>
        </Billboard>
      )}

      {hovered && onDelete && (
        <Html position={new THREE.Vector3(midPos.x, midPos.y + 0.28, midPos.z)} center style={{ pointerEvents: "all" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "hsl(0 70% 50%)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: 11, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
            title="Delete connection"
          >✕</button>
        </Html>
      )}
    </>
  );
}

// ─── PENDING WIRE ─────────────────────────────────────────────────────────────

function PendingWireMesh({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const points = useMemo(() => {
    const mid = new THREE.Vector3((from.x + to.x) / 2, (from.y + to.y) / 2 + 0.4, (from.z + to.z) / 2);
    const curve = new THREE.CatmullRomCurve3([from.clone(), mid, to.clone()]);
    return curve.getPoints(40);
  }, [from.x, from.y, from.z, to.x, to.y, to.z]);
  return <Line points={points} color={color} lineWidth={1.5} dashed dashSize={0.12} gapSize={0.08} transparent opacity={0.7} />;
}

// ─── PORT DOT ─────────────────────────────────────────────────────────────────

function PortDot({ position, color, isCompatible, onPointerDown, onPointerUp }: {
  position: THREE.Vector3;
  color: string;
  isCompatible?: boolean;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const s = isCompatible ? 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2 : 1;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={position} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <sphereGeometry args={[0.09, 14, 14]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isCompatible ? 3.5 : 1.2} />
    </mesh>
  );
}

// ─── SELECTION BOX ───────────────────────────────────────────────────────────

function SelectionBox({ nodes, selectedIds }: { nodes: FlowNode[]; selectedIds: Set<string> }) {
  const selected = nodes.filter(n => selectedIds.has(n.id));
  if (selected.length < 2) return null;
  const box = new THREE.Box3();
  for (const n of selected) box.expandByPoint(n.pos);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return (
    <mesh position={center}>
      <boxGeometry args={[size.x + 1.8, size.y + 1, size.z + 1.2]} />
      <meshStandardMaterial wireframe color="#7c3aed" transparent opacity={0.3} />
    </mesh>
  );
}

// ─── GROUP FRAME ─────────────────────────────────────────────────────────────

function GroupFrame({ group, nodes, onDelete }: { group: NodeGroup; nodes: FlowNode[]; onDelete: (id: string) => void }) {
  const col = useMemo(() => new THREE.Color(group.color), [group.color]);

  const contained = nodes.filter(n => group.nodeIds.includes(n.id));
  if (contained.length === 0) return null;
  const box = new THREE.Box3();
  for (const n of contained) box.expandByPoint(n.pos);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  return (
    <group position={center}>
      {/* Translucent fill */}
      <mesh>
        <boxGeometry args={[size.x + 2.2, size.y + 1.4, size.z + 1.6]} />
        <meshStandardMaterial color={col} transparent opacity={0.04} depthWrite={false} />
      </mesh>
      {/* Wireframe border */}
      <mesh>
        <boxGeometry args={[size.x + 2.22, size.y + 1.42, size.z + 1.62]} />
        <meshStandardMaterial color={col} wireframe transparent opacity={0.35} emissive={col} emissiveIntensity={0.4} />
      </mesh>
      {/* Label */}
      <Text
        position={[0, size.y / 2 + 1.0, 0]}
        fontSize={0.16}
        color={group.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.007}
        outlineColor="#000000"
      >
        {group.label}
      </Text>
      {/* Delete button */}
      <Html
        position={[size.x / 2 + 1.3, size.y / 2 + 1.0, 0]}
        center
        style={{ pointerEvents: "all" }}
      >
        <button
          onClick={() => onDelete(group.id)}
          style={{
            width: 18, height: 18, borderRadius: "50%",
            background: `${group.color}33`, color: group.color,
            border: `1px solid ${group.color}80`,
            cursor: "pointer", fontSize: 9, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
          title="Remove group"
        >✕</button>
      </Html>
    </group>
  );
}

// ─── NODE HALO ───────────────────────────────────────────────────────────────

function NodeHalo({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(t * (active ? 3.5 : 0.8)) * (active ? 0.16 : 0.04));
    }
    if (mat.current) {
      mat.current.opacity = active
        ? 0.22 + Math.sin(t * 3.5) * 0.14
        : 0.05 + Math.sin(t * 0.8) * 0.02;
    }
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.08]}>
      <ringGeometry args={[0.95, 1.12, 48]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.05} depthWrite={false} />
    </mesh>
  );
}

// ─── NODE SCAN LINE ──────────────────────────────────────────────────────────

function NodeScanLine({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current = (t.current + delta * 1.1) % 1;
    if (ref.current) {
      ref.current.position.y = -0.375 + t.current * 0.75;
    }
  });
  return (
    <mesh ref={ref} position={[0, -0.375, 0.06]}>
      <boxGeometry args={[1.7, 0.028, 0.04]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} transparent opacity={0.75} depthWrite={false} />
    </mesh>
  );
}

// ─── NODE MESH ────────────────────────────────────────────────────────────────

function NodeMesh({
  node, selected, multiSelected, executing, pending,
  onDragStart, onPortDown, onPortUp, onClick, onDelete, onContextMenu, onRename, onDescriptionChange,
}: {
  node: FlowNode;
  selected: boolean;
  multiSelected: boolean;
  executing: boolean;
  pending: PendingWire | null;
  onDragStart: (nodeId: string, e: ThreeEvent<PointerEvent>) => void;
  onPortDown: (nodeId: string, portId: string, portType: PortType, worldPos: THREE.Vector3, e: ThreeEvent<PointerEvent>) => void;
  onPortUp: (nodeId: string, portId: string, portType: PortType) => void;
  onClick: (nodeId: string, shift: boolean) => void;
  onDelete: (nodeId: string) => void;
  onContextMenu: (nodeId: string, clientX: number, clientY: number) => void;
  onRename: (nodeId: string, newLabel: string) => void;
  onDescriptionChange: (nodeId: string, desc: string) => void;
}) {

  const ref    = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState(node.label);
  const scaleTarget = useRef(1);
  const isAgent = node.type === "agent";
  const isActive = selected || multiSelected || executing;

  useFrame((state) => {
    if (ref.current) {
      const targetY = node.pos.y + Math.sin(state.clock.elapsedTime * 0.5 + node.pos.x) * 0.04;
      ref.current.position.lerp(new THREE.Vector3(node.pos.x, targetY, node.pos.z), 0.12);
      if (executing) {
        scaleTarget.current = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.06;
      } else {
        scaleTarget.current = THREE.MathUtils.lerp(scaleTarget.current, 1, 0.1);
      }
      ref.current.scale.setScalar(scaleTarget.current);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        executing ? 0.8 : (selected || multiSelected) ? 0.45 : hovered ? 0.25 : 0.08,
        0.1
      );
    }
  });

  const inPorts  = node.ports.filter(p => p.dir === "in");
  const outPorts = node.ports.filter(p => p.dir === "out");

  return (
    <Float speed={0.6} floatIntensity={isActive ? 0.5 : 0.08} rotationIntensity={0}>
      <group ref={ref} position={node.pos}>
        {/* Pulsing halo ring behind node */}
        <NodeHalo color={node.color} active={isActive} />

        {/* Executing sparkle burst */}
        {executing && (
          <Sparkles count={10} scale={2.2} size={1.8} speed={0.6} color={node.color} />
        )}

        {node.isEntryPoint && (
          <mesh position={[-0.95, 0.45, 0.1]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={3} />
          </mesh>
        )}

        <NodeTypeIcon type={node.type} color={node.color} />

        {/* Agent node: organic distorted body instead of flat box */}
        {isAgent ? (
          <Float speed={1.2} floatIntensity={0.15} rotationIntensity={0.08}>
            <mesh
              onPointerDown={(e) => { e.stopPropagation(); onDragStart(node.id, e); }}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
              onClick={(e) => { e.stopPropagation(); onClick(node.id, e.shiftKey); }}
              onDoubleClick={(e) => { e.stopPropagation(); setRenaming(true); setRenameVal(node.label); }}
              onContextMenu={(e) => { e.stopPropagation(); onContextMenu(node.id, (e.nativeEvent as MouseEvent).clientX, (e.nativeEvent as MouseEvent).clientY); }}
              position={[0.15, 0, 0]}
            >
              <icosahedronGeometry args={[0.42, 1]} />
              <MeshDistortMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={executing ? 0.8 : 0.25}
                distort={executing ? 0.38 : 0.14}
                speed={executing ? 4 : 2}
                transparent
                opacity={executing ? 0.55 : 0.35}
              />
              {(hovered || selected || multiSelected) && (
                <Outlines thickness={0.022} color={node.color} />
              )}
            </mesh>
          </Float>
        ) : (
          <mesh
            onPointerDown={(e) => { e.stopPropagation(); onDragStart(node.id, e); }}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={(e) => { e.stopPropagation(); onClick(node.id, e.shiftKey); }}
            onDoubleClick={(e) => { e.stopPropagation(); setRenaming(true); setRenameVal(node.label); }}
            onContextMenu={(e) => { e.stopPropagation(); onContextMenu(node.id, (e.nativeEvent as MouseEvent).clientX, (e.nativeEvent as MouseEvent).clientY); }}
          >
            <boxGeometry args={[1.7, 0.75, 0.06]} />
            <meshStandardMaterial
              ref={matRef}
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.08}
              transparent
              opacity={executing ? 0.38 : 0.18}
            />
            {(hovered || selected || multiSelected) && (
              <Outlines thickness={0.018} color={node.color} />
            )}
          </mesh>
        )}

        {!isAgent && (
          <mesh>
            <boxGeometry args={[1.72, 0.77, 0.065]} />
            <meshStandardMaterial
              color={node.color}
              transparent
              opacity={executing ? 0.9 : (selected || multiSelected) ? 0.6 : hovered ? 0.4 : 0.22}
              wireframe
            />
          </mesh>
        )}

        <mesh position={[-0.85, 0, 0.04]}>
          <boxGeometry args={[0.06, 0.75, 0.02]} />
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={executing ? 3 : 1.5} />
        </mesh>

        {/* Scan line effect during execution */}
        {executing && !isAgent && <NodeScanLine color={node.color} />}

        <Billboard follow>
          <Text position={[-0.18, 0.1, 0.06]} fontSize={0.12} color={node.color}
            anchorX="left" anchorY="middle" outlineWidth={0.005} outlineColor="#000">
            {node.label}
          </Text>
          <Text position={[-0.18, -0.1, 0.06]} fontSize={0.075} color="#ffffff"
            anchorX="left" anchorY="middle" fillOpacity={0.45} outlineWidth={0.003} outlineColor="#000">
            {node.type.toUpperCase()}
          </Text>
        </Billboard>

        {inPorts.map((port) => {
          const pPos = getPortWorldPos(node, port.id).sub(node.pos);
          const isCompat = pending !== null && pending.portType === port.type && pending.fromNodeId !== node.id;
          return (
            <PortDot key={port.id} position={pPos} color={PORT_COLORS[port.type]}
              isCompatible={isCompat}
              onPointerUp={(e) => { e.stopPropagation(); onPortUp(node.id, port.id, port.type); }}
            />
          );
        })}

        {outPorts.map((port) => {
          const pPos = getPortWorldPos(node, port.id).sub(node.pos);
          return (
            <PortDot key={port.id} position={pPos} color={PORT_COLORS[port.type]}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPortDown(node.id, port.id, port.type, getPortWorldPos(node, port.id), e);
              }}
            />
          );
        })}

        {selected && !renaming && (
          <Html position={[0.85, 0.5, 0.1]} center style={{ pointerEvents: "all" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "hsl(0 70% 50%)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                cursor: "pointer", fontSize: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              title="Delete node"
            >✕</button>
          </Html>
        )}

        {renaming && (
          <Html position={[0, 0.1, 0.12]} center style={{ pointerEvents: "all" }}>
            <input
              autoFocus
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { onRename(node.id, renameVal); setRenaming(false); }
                if (e.key === "Escape") setRenaming(false);
              }}
              onBlur={() => { onRename(node.id, renameVal); setRenaming(false); }}
              style={{
                background: "hsl(240 10% 8%)", color: node.color,
                border: `1px solid ${node.color}80`, borderRadius: 6,
                padding: "2px 6px", fontSize: 11, width: 120, outline: "none",
                textAlign: "center",
              }}
            />
          </Html>
        )}
      </group>
    </Float>
  );
}

// ─── JUMP CONTROLLER ─────────────────────────────────────────────────────────

function JumpController({ target, onDone }: { target: THREE.Vector3 | null; onDone: () => void }) {
  const { camera } = useThree();
  const active = useRef(false);
  const dest = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (target) {
      dest.current = target.clone();
      active.current = true;
    }
  }, [target]);

  useFrame(() => {
    if (!active.current || !dest.current) return;
    camera.position.lerp(dest.current, 0.09);
    if (camera.position.distanceTo(dest.current) < 0.08) {
      active.current = false;
      dest.current = null;
      onDone();
    }
  });

  return null;
}

// ─── FIT-TO-VIEW CONTROLLER ───────────────────────────────────────────────────

function FitController({
  nodes,
  fitAll,
  focusId,
  onFitDone,
  onFocusDone,
}: {
  nodes: FlowNode[];
  fitAll: number;
  focusId: string | null;
  onFitDone: () => void;
  onFocusDone: () => void;
}) {
  const { camera } = useThree();
  const targetPos  = useRef<THREE.Vector3 | null>(null);
  const active     = useRef(false);

  useEffect(() => {
    if (fitAll > 0 && nodes.length > 0) {
      const box = new THREE.Box3();
      for (const n of nodes) box.expandByPoint(n.pos);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const dist   = Math.max(size.x, size.y, size.z) * 1.4 + 6;
      targetPos.current = new THREE.Vector3(center.x, center.y + dist * 0.3, center.z + dist);
      active.current = true;
    }
  }, [fitAll]);

  useEffect(() => {
    if (focusId) {
      const node = nodes.find(n => n.id === focusId);
      if (node) {
        targetPos.current = new THREE.Vector3(node.pos.x, node.pos.y + 2, node.pos.z + 7);
        active.current = true;
      }
    }
  }, [focusId]);

  useFrame(() => {
    if (!active.current || !targetPos.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      active.current = false;
      targetPos.current = null;
      onFitDone();
      onFocusDone();
    }
  });

  return null;
}

// ─── ORIGIN BEACON ───────────────────────────────────────────────────────────

function OriginBeacon() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const beaconMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (beaconMat.current) {
      beaconMat.current.emissiveIntensity = 1.2 + Math.sin(t * 1.4) * 0.6;
    }
    [ring1, ring2, ring3].forEach((r, i) => {
      if (!r.current) return;
      const phase = t * 0.7 + i * (Math.PI * 2 / 3);
      const sc = 0.5 + ((phase % (Math.PI * 2)) / (Math.PI * 2)) * 2.5;
      r.current.scale.setScalar(sc);
      (r.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.35 - sc * 0.12);
    });
  });

  return (
    <group position={[0, -2.95, 0]}>
      {/* Vertical light column */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 9, 8]} />
        <meshStandardMaterial
          ref={beaconMat}
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Expanding base rings */}
      {[ring1, ring2, ring3].map((r, i) => (
        <mesh key={i} ref={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── GRAPH SCENE ─────────────────────────────────────────────────────────────

function GraphScene({
  nodes, edges, groups, annotations, selected, selectedIds, pending, pendingMousePos, executingNodes, executingEdges,
  isRunning,
  onDragStart, onPortDown, onPortUp, onSelect, onDelete, onCanvasClick, onEdgeDelete, onContextMenu, onRename,
  onDescriptionChange, onGroupDelete, onCanvasRightClick, onAnnotationUpdate, onAnnotationDelete,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  groups: NodeGroup[];
  annotations: NoteAnnotation[];
  selected: string | null;
  selectedIds: Set<string>;
  pending: PendingWire | null;
  pendingMousePos: THREE.Vector3;
  executingNodes: Set<string>;
  executingEdges: Set<string>;
  isRunning: boolean;
  onDragStart: (nodeId: string, e: ThreeEvent<PointerEvent>) => void;
  onPortDown: (nodeId: string, portId: string, portType: PortType, worldPos: THREE.Vector3, e: ThreeEvent<PointerEvent>) => void;
  onPortUp: (nodeId: string, portId: string, portType: PortType) => void;
  onSelect: (nodeId: string, shift: boolean) => void;
  onDelete: (nodeId: string) => void;
  onCanvasClick: () => void;
  onEdgeDelete: (edgeId: string) => void;
  onContextMenu: (nodeId: string, clientX: number, clientY: number) => void;
  onRename: (nodeId: string, newLabel: string) => void;
  onDescriptionChange: (nodeId: string, desc: string) => void;
  onGroupDelete: (groupId: string) => void;
  onCanvasRightClick: (worldPos: THREE.Vector3, screenX: number, screenY: number) => void;
  onAnnotationUpdate: (id: string, patch: Partial<NoteAnnotation>) => void;
  onAnnotationDelete: (id: string) => void;
}) {
  const { camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const xyPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  return (
    <>
      <fog attach="fog" args={["#050510", 25, 60]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 10, 5]} intensity={4} color="#7c3aed" />
      <pointLight position={[10, -5, -5]} intensity={2} color="#0891b2" />
      <pointLight position={[-10, 5, 5]} intensity={1.5} color="#ec4899" />
      <pointLight position={[0, -8, 0]} intensity={1.8} color="#6d28d9" />
      <Stars radius={100} depth={60} count={4000} factor={3} fade speed={0.3} />
      <Sparkles count={30} scale={12} size={0.8} speed={0.2} color="#7c3aed" />

      <InfiniteGrid />
      <AxisGuides />
      <OriginBeacon />

      {/* Camera shake during execution */}
      <CameraShake maxYaw={0.006} maxPitch={0.004} maxRoll={0.002} yawFrequency={0.8} pitchFrequency={0.6} rollFrequency={0.4} intensity={isRunning ? 0.8 : 0} />

      {/* Group frames (behind nodes) */}
      {groups.map(group => (
        <GroupFrame key={group.id} group={group} nodes={nodes} onDelete={onGroupDelete} />
      ))}

      {edges.map(edge => {
        const fn = nodes.find(n => n.id === edge.fromNodeId);
        const tn = nodes.find(n => n.id === edge.toNodeId);
        if (!fn || !tn) return null;
        const fp = getPortWorldPos(fn, edge.fromPortId);
        const tp = getPortWorldPos(tn, edge.toPortId);
        return (
          <EdgeTube
            key={edge.id}
            id={edge.id}
            from={fp}
            to={tp}
            color={PORT_COLORS[edge.type]}
            edgeType={edge.type}
            animated
            executing={executingEdges.has(edge.id)}
            onDelete={onEdgeDelete}
          />
        );
      })}

      {pending && (
        <PendingWireMesh from={pending.fromPos} to={pendingMousePos} color={PORT_COLORS[pending.portType]} />
      )}

      <SelectionBox nodes={nodes} selectedIds={selectedIds} />

      {nodes.map(node => (
        <NodeMesh
          key={node.id}
          node={node}
          selected={selected === node.id}
          multiSelected={selectedIds.has(node.id)}
          executing={executingNodes.has(node.id)}
          pending={pending}
          onDragStart={onDragStart}
          onPortDown={onPortDown}
          onPortUp={onPortUp}
          onClick={onSelect}
          onDelete={onDelete}
          onContextMenu={onContextMenu}
          onRename={onRename}
          onDescriptionChange={onDescriptionChange}
        />
      ))}

      {/* Sticky note annotations */}
      {annotations.map(ann => {
        const node = nodes.find(n => n.id === ann.nodeId);
        if (!node) return null;
        return (
          <Html
            key={ann.id}
            position={[node.pos.x + 1.1, node.pos.y + 0.75, node.pos.z]}
            style={{ pointerEvents: "all", userSelect: "none" }}
            zIndexRange={[60, 70]}
          >
            <div style={{
              background: ann.color + "e0",
              borderRadius: 8,
              padding: ann.minimized ? "5px 8px" : "7px 8px",
              minWidth: ann.minimized ? "auto" : 130,
              maxWidth: 160,
              boxShadow: `0 3px 12px ${ann.color}50`,
              border: `1px solid ${ann.color}80`,
              fontSize: 10,
              fontFamily: "inherit",
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: ann.minimized ? 0 : 4 }}>
                <span style={{ fontSize: 9, opacity: 0.8, lineHeight: 1 }}>📌</span>
                <button
                  onClick={() => onAnnotationUpdate(ann.id, { minimized: !ann.minimized })}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.7, padding: 0, fontSize: 9, lineHeight: 1, color: "#111" }}
                  title={ann.minimized ? "Expand" : "Minimize"}
                >{ann.minimized ? "▼" : "▲"}</button>
                <button
                  onClick={() => onAnnotationDelete(ann.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.65, padding: 0, marginLeft: "auto", fontSize: 10, lineHeight: 1, color: "#111" }}
                  title="Delete note"
                >✕</button>
              </div>
              {!ann.minimized && (
                <textarea
                  value={ann.text}
                  onChange={e => onAnnotationUpdate(ann.id, { text: e.target.value })}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  rows={3}
                  placeholder="Type a note…"
                  style={{
                    display: "block",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    fontSize: 10,
                    color: "#111",
                    fontFamily: "inherit",
                    lineHeight: 1.4,
                    padding: 0,
                  }}
                />
              )}
            </div>
          </Html>
        );
      })}

      {/* Canvas background — handles click + right-click to spawn */}
      <mesh
        position={[0, 0, -20]}
        onPointerDown={onCanvasClick}
        onContextMenu={(e) => {
          e.stopPropagation();
          const nativeEv = e.nativeEvent as MouseEvent;
          const rect = (e.nativeEvent.target as HTMLElement).getBoundingClientRect?.() ??
            { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
          const ndc = new THREE.Vector2(
            ((nativeEv.clientX - rect.left) / rect.width) * 2 - 1,
            -((nativeEv.clientY - rect.top) / rect.height) * 2 + 1,
          );
          raycaster.setFromCamera(ndc, camera);
          const target = new THREE.Vector3();
          raycaster.ray.intersectPlane(xyPlane, target);
          onCanvasRightClick(target, nativeEv.clientX, nativeEv.clientY);
        }}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.12}
          luminanceSmoothing={0.9}
          intensity={isRunning ? 3.0 : 1.4}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.55} />
      </EffectComposer>
    </>
  );
}

// ─── INFINITE GRID ────────────────────────────────────────────────────────────

function InfiniteGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((s) => { if (matRef.current) matRef.current.uniforms.uTime.value = s.clock.elapsedTime; });
  const vs = `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const fs = `
    uniform float uTime;
    varying vec3 vPos;
    float grid(vec2 p, float s){ vec2 g = abs(fract(p/s-0.5)-0.5)/fwidth(p/s); return 1.0-min(min(g.x,g.y),1.0); }
    void main(){
      float d = length(vPos.xz);
      float fade = 1.0-smoothstep(12.0,28.0,d);
      float ripple = sin(d*1.2-uTime*1.8)*0.5+0.5;
      float g = grid(vPos.xz, 1.0)*0.7 + grid(vPos.xz, 5.0)*0.2;
      vec3 col = mix(vec3(0.22,0.19,0.60),vec3(0.49,0.23,0.93),ripple);
      gl_FragColor = vec4(col, g*fade*(0.2+ripple*0.1));
    }
  `;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vs} fragmentShader={fs}
        uniforms={{ uTime: { value: 0 } }} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── AXIS GUIDES ─────────────────────────────────────────────────────────────

function AxisGuides() {
  return (
    <>
      <Line points={[new THREE.Vector3(-20, 0, 0), new THREE.Vector3(20, 0, 0)]}
        color="#3730a3" lineWidth={0.5} transparent opacity={0.15} />
      <Line points={[new THREE.Vector3(0, -8, 0), new THREE.Vector3(0, 8, 0)]}
        color="#3730a3" lineWidth={0.5} transparent opacity={0.15} />
      <Line points={[new THREE.Vector3(0, 0, -15), new THREE.Vector3(0, 0, 8)]}
        color="#3730a3" lineWidth={0.5} transparent opacity={0.15} />
    </>
  );
}

// ─── INTERACTION CONTROLLER ───────────────────────────────────────────────────

function InteractionController({
  draggingNodeId, shiftHeld,
  onNodeDrag, onPendingMove, isPending,
}: {
  draggingNodeId: string | null;
  shiftHeld: boolean;
  onNodeDrag: (pos: THREE.Vector3, isZ: boolean) => void;
  onPendingMove: (pos: THREE.Vector3) => void;
  isPending: boolean;
}) {
  const { camera, gl } = useThree();
  const xyPlane  = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const xzPlane  = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const target    = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      if (!draggingNodeId && !isPending) return;
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      const plane = (shiftHeld && draggingNodeId) ? xzPlane : xyPlane;
      if (raycaster.ray.intersectPlane(plane, target)) {
        if (draggingNodeId) onNodeDrag(target.clone(), shiftHeld);
        else if (isPending) onPendingMove(target.clone());
      }
    };
    canvas.addEventListener("pointermove", onMove);
    return () => canvas.removeEventListener("pointermove", onMove);
  }, [draggingNodeId, isPending, shiftHeld, camera, gl, xyPlane, xzPlane, raycaster, target, onNodeDrag, onPendingMove]);

  return null;
}

// ─── MINIMAP ─────────────────────────────────────────────────────────────────

function Minimap({
  nodes, edges, groups, cameraPos, onJump,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  groups: NodeGroup[];
  cameraPos: THREE.Vector3;
  onJump: (pos: THREE.Vector3) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 160, H = 120;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    let minX = -8, maxX = 8, minZ = -6, maxZ = 6;
    for (const n of nodes) {
      minX = Math.min(minX, n.pos.x - 2);
      maxX = Math.max(maxX, n.pos.x + 2);
      minZ = Math.min(minZ, n.pos.z - 2);
      maxZ = Math.max(maxZ, n.pos.z + 2);
    }
    const toX = (wx: number) => ((wx - minX) / (maxX - minX)) * W;
    const toY = (wz: number) => ((wz - minZ) / (maxZ - minZ)) * H;

    // Draw group regions
    for (const group of groups) {
      const contained = nodes.filter(n => group.nodeIds.includes(n.id));
      if (contained.length < 2) continue;
      let gMinX = Infinity, gMaxX = -Infinity, gMinZ = Infinity, gMaxZ = -Infinity;
      for (const n of contained) {
        gMinX = Math.min(gMinX, n.pos.x); gMaxX = Math.max(gMaxX, n.pos.x);
        gMinZ = Math.min(gMinZ, n.pos.z); gMaxZ = Math.max(gMaxZ, n.pos.z);
      }
      const gx = toX(gMinX - 1), gy = toY(gMinZ - 1);
      const gw = toX(gMaxX + 1) - gx, gh = toY(gMaxZ + 1) - gy;
      ctx.fillStyle = group.color + "22";
      ctx.strokeStyle = group.color + "80";
      ctx.lineWidth = 1;
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeRect(gx, gy, gw, gh);
    }

    // Draw edges
    for (const edge of edges) {
      const fn = nodes.find(n => n.id === edge.fromNodeId);
      const tn = nodes.find(n => n.id === edge.toNodeId);
      if (!fn || !tn) continue;
      ctx.strokeStyle = PORT_COLORS[edge.type] + "70";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toX(fn.pos.x), toY(fn.pos.z));
      ctx.lineTo(toX(tn.pos.x), toY(tn.pos.z));
      ctx.stroke();
    }

    // Draw nodes
    for (const node of nodes) {
      const x = toX(node.pos.x);
      const y = toY(node.pos.z);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff30";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Camera frustum rectangle
    const cx = toX(cameraPos.x);
    const cy = toY(cameraPos.z);
    ctx.strokeStyle = "#ffffff60";
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 14, cy - 10, 28, 20);
    // Small crosshair at camera center
    ctx.strokeStyle = "#ffffff90";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy);
    ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy + 3);
    ctx.stroke();
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    let minX = -8, maxX = 8, minZ = -6, maxZ = 6;
    for (const n of nodes) {
      minX = Math.min(minX, n.pos.x - 2); maxX = Math.max(maxX, n.pos.x + 2);
      minZ = Math.min(minZ, n.pos.z - 2); maxZ = Math.max(maxZ, n.pos.z + 2);
    }
    const wx = minX + px * (maxX - minX);
    const wz = minZ + py * (maxZ - minZ);
    onJump(new THREE.Vector3(wx, 4, wz + 10));
  };

  return (
    <div style={{
      position: "absolute", bottom: 16, left: 16, zIndex: 40,
      borderRadius: 10, overflow: "hidden",
      border: "1px solid hsl(var(--border))",
      background: "hsl(var(--card) / 0.85)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontSize: 9, padding: "3px 8px", borderBottom: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Minimap · {groups.length > 0 && <span style={{ color: "#7c3aed" }}>{groups.length} groups</span>}
      </div>
      <canvas ref={canvasRef} width={W} height={H} onClick={handleClick}
        style={{ display: "block", cursor: "crosshair" }} />
    </div>
  );
}

// ─── CONTEXT MENU ─────────────────────────────────────────────────────────────

function NodeContextMenu({ nodeId, pos, onClose, onDuplicate, onDelete, onDisconnect, onSetEntry }: {
  nodeId: string;
  pos: { x: number; y: number };
  onClose: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSetEntry: (id: string) => void;
}) {
  const items = [
    { icon: Copy,    label: "Duplicate",          action: () => { onDuplicate(nodeId); onClose(); } },
    { icon: Trash2,  label: "Delete node",         action: () => { onDelete(nodeId); onClose(); } },
    { icon: Unlink,  label: "Disconnect all edges", action: () => { onDisconnect(nodeId); onClose(); } },
    { icon: Flag,    label: "Set as entry point",  action: () => { onSetEntry(nodeId); onClose(); } },
  ];

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 100,
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 10, overflow: "hidden", minWidth: 172,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {items.map(({ icon: Icon, label, action }) => (
        <button
          key={label}
          onClick={(e) => { e.stopPropagation(); action(); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            width: "100%", padding: "8px 14px", fontSize: 12,
            background: "transparent", border: "none", cursor: "pointer",
            color: "hsl(var(--foreground))", textAlign: "left",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--accent))")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <Icon size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
          {label}
        </button>
      ))}
    </motion.div>
  );
}

// ─── CANVAS SPAWN MENU ───────────────────────────────────────────────────────

function CanvasSpawnMenu({ pos, worldPos, onSpawn, onClose }: {
  pos: { x: number; y: number };
  worldPos: THREE.Vector3;
  onSpawn: (template: typeof NODE_TEMPLATES[number], worldPos: THREE.Vector3) => void;
  onClose: () => void;
}) {
  const QUICK_TEMPLATES = NODE_TEMPLATES.slice(0, 4);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("pointerdown", handler, true);
    return () => window.removeEventListener("pointerdown", handler, true);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed", left: pos.x, top: pos.y, zIndex: 100,
        background: "hsl(var(--card) / 0.97)",
        border: "1px solid hsl(var(--border))",
        borderRadius: 12, overflow: "hidden", minWidth: 160,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ padding: "6px 12px", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "hsl(var(--muted-foreground))", borderBottom: "1px solid hsl(var(--border))" }}>
        Spawn Node Here
      </div>
      {QUICK_TEMPLATES.map((t, i) => {
        const Icon = t.icon;
        const color = PORT_COLORS[t.type];
        return (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); onSpawn(t, worldPos); onClose(); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "8px 12px", fontSize: 12,
              background: "transparent", border: "none", cursor: "pointer",
              color: "hsl(var(--foreground))", textAlign: "left",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${color}15`)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Icon size={13} style={{ color }} />
            {t.label}
          </button>
        );
      })}
    </motion.div>
  );
}

// ─── CAMERA POS READER ────────────────────────────────────────────────────────

function CameraPosReader({ onChange }: { onChange: (pos: THREE.Vector3) => void }) {
  useFrame(({ camera }) => { onChange(camera.position.clone()); });
  return null;
}

// ─── PRESENCE ────────────────────────────────────────────────────────────────

const PRESENCE_USERS = [
  { name: "Aria", color: "#a855f7" },
  { name: "Kai",  color: "#06b6d4" },
  { name: "Zoe",  color: "#10b981" },
];

function PresenceCursor({ name, color }: { name: string; color: string }) {
  const posRef    = useRef(new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 4, 0));
  const targetRef = useRef(posRef.current.clone());

  useEffect(() => {
    const jitter = Math.random() * 1200;
    const id = setInterval(() => {
      targetRef.current.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6,
        0,
      );
    }, 2000 + jitter);
    return () => clearInterval(id);
  }, []);

  useFrame(() => {
    posRef.current.lerp(targetRef.current, 0.03);
  });

  return (
    <Html position={posRef.current} style={{ pointerEvents: "none", userSelect: "none" }}>
      <div style={{ position: "relative", width: 0, height: 0 }}>
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ position: "absolute", top: 0, left: 0 }}>
          <path d="M0 0L0 13L3.5 9.5L6 16L8 15L5.5 8.5L10 8.5L0 0Z" fill={color} opacity={0.9} />
        </svg>
        <div style={{
          position: "absolute", top: 18, left: 4,
          background: color + "28", color, border: `1px solid ${color}60`,
          borderRadius: 6, padding: "1px 5px", fontSize: 9, whiteSpace: "nowrap", fontWeight: 600,
        }}>
          {name}
        </div>
      </div>
    </Html>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FlowCanvas3D() {
  const navigate = useNavigate();

  const loadedGraph = useMemo(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return deserializeGraph(saved);
    } catch {}
    return null;
  }, []);

  const [nodes, setNodes] = useState<FlowNode[]>(loadedGraph?.nodes ?? INITIAL_NODES);
  const [edges, setEdges] = useState<FlowEdge[]>(loadedGraph?.edges ?? INITIAL_EDGES);
  const [groups, setGroups] = useState<NodeGroup[]>(loadedGraph?.groups ?? []);
  const [annotations, setAnnotations] = useState<NoteAnnotation[]>(loadedGraph?.annotations ?? []);
  const [presentMode, setPresentMode] = useState(false);
  const [presentPlaying, setPresentPlaying] = useState(false);
  const [presentWaveIdx, setPresentWaveIdx] = useState(0);
  const [selected, setSelected]         = useState<string | null>(null);
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [pending, setPending]           = useState<PendingWire | null>(null);
  const [pendingMousePos, setPendingMousePos] = useState(new THREE.Vector3());
  const [draggingNodeId, setDraggingNodeId]   = useState<string | null>(null);
  const [shiftHeld, setShiftHeld]       = useState(false);
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [paletteOpen, setPaletteOpen]   = useState(false);
  const [paletteTab, setPaletteTab]     = useState<"nodes" | "presets">("nodes");
  const [paletteSearch, setPaletteSearch] = useState("");
  const [gridSnap, setGridSnap]         = useState(false);
  const [showInfo, setShowInfo]         = useState(false);
  const [showMinimap, setShowMinimap]   = useState(true);
  const [cameraPos, setCameraPos]       = useState(new THREE.Vector3(0, 4, 14));
  const [fitAll, setFitAll]             = useState(0);
  const [focusTarget, setFocusTarget]   = useState<string | null>(null);
  const [jumpTarget, setJumpTarget]     = useState<THREE.Vector3 | null>(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Command palette
  const [cmdOpen, setCmdOpen] = useState(false);

  // Search sidebar (Ctrl+F)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTypeFilter, setSearchTypeFilter] = useState<PortType | "all">("all");

  // Execution simulation
  const [runStatus, setRunStatus]       = useState<"idle" | "running" | "done">("idle");
  const [runStep, setRunStep]           = useState(0);
  const [runTotal, setRunTotal]         = useState(0);
  const [runElapsed, setRunElapsed]     = useState(0);
  const [currentWaveLabel, setCurrentWaveLabel] = useState("");
  const [executingNodes, setExecutingNodes] = useState<Set<string>>(new Set());
  const [executingEdges, setExecutingEdges] = useState<Set<string>>(new Set());
  // Timeline scrubber
  const [waveHistory, setWaveHistory] = useState<string[][]>([]);
  const [scrubStep, setScrubStep] = useState<number | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  // Context menus
  const [ctxMenu, setCtxMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [spawnMenu, setSpawnMenu] = useState<{ worldPos: THREE.Vector3; x: number; y: number } | null>(null);

  // Copy/paste clipboard
  const clipboardRef = useRef<{ nodes: SerializedNode[]; edges: FlowEdge[] } | null>(null);
  const deleteNodeRef = useRef<(id: string) => void>(() => {});

  const orbitRef = useRef<any>(null);
  const duplicateNodeRef = useRef<(id: string) => void>(() => {});

  // ── History stack ──
  const historyRef      = useRef<FlowSnapshot[]>([]);
  const historyIndexRef = useRef(-1);

  const pushHistory = useCallback((ns: FlowNode[], es: FlowEdge[]) => {
    const snap: FlowSnapshot = {
      nodes: ns.map(n => ({ ...n, pos: [n.pos.x, n.pos.y, n.pos.z] })),
      edges: es,
    };
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const snap = historyRef.current[historyIndexRef.current];
    const { nodes: sn, edges: se } = deserializeGraph(JSON.stringify(snap));
    setNodes(sn); setEdges(se); setSelected(null); setSelectedIds(new Set());
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const snap = historyRef.current[historyIndexRef.current];
    const { nodes: sn, edges: se } = deserializeGraph(JSON.stringify(snap));
    setNodes(sn); setEdges(se);
  }, []);

  // ── Auto-save debounce ──
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerAutoSave = useCallback((ns: FlowNode[], es: FlowEdge[], gs: NodeGroup[], as_: NoteAnnotation[] = []) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, serializeGraph(ns, es, gs, as_)); } catch {}
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2500);
    }, 1500);
  }, []);

  const mutate = useCallback((newNodes: FlowNode[], newEdges: FlowEdge[], newGroups?: NodeGroup[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    const gs = newGroups ?? groups;
    if (newGroups) setGroups(newGroups);
    pushHistory(newNodes, newEdges);
    triggerAutoSave(newNodes, newEdges, gs, annotations);
  }, [pushHistory, triggerAutoSave, groups, annotations]);

  useEffect(() => {
    pushHistory(nodes, edges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── URL load on mount ──
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("g");
    if (param) {
      try {
        const json = decodeURIComponent(atob(param));
        const { nodes: n, edges: e, groups: g, annotations: a } = deserializeGraph(json);
        setNodes(n); setEdges(e); setGroups(g); setAnnotations(a);
        toast({ title: "Graph loaded from URL", description: `${n.length} nodes, ${e.length} edges` });
      } catch { /* ignore bad param */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Annotation callbacks ──
  const addAnnotation = useCallback((nodeId: string) => {
    const existing = annotations.find(a => a.nodeId === nodeId);
    if (existing) return; // already has one
    const color = NOTE_COLORS[annotations.length % NOTE_COLORS.length];
    const newAnn: NoteAnnotation = { id: `ann${Date.now()}`, nodeId, text: "", minimized: false, color };
    const next = [...annotations, newAnn];
    setAnnotations(next);
    triggerAutoSave(nodes, edges, groups, next);
  }, [annotations, nodes, edges, groups, triggerAutoSave]);

  const updateAnnotation = useCallback((id: string, patch: Partial<NoteAnnotation>) => {
    setAnnotations(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...patch } : a);
      triggerAutoSave(nodes, edges, groups, next);
      return next;
    });
  }, [nodes, edges, groups, triggerAutoSave]);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => {
      const next = prev.filter(a => a.id !== id);
      triggerAutoSave(nodes, edges, groups, next);
      return next;
    });
  }, [nodes, edges, groups, triggerAutoSave]);

  // ── Share graph URL ──
  const encodeGraphToURL = useCallback(() => {
    try {
      const json = serializeGraph(nodes, edges, groups, annotations);
      const encoded = btoa(encodeURIComponent(json));
      const url = `${window.location.origin}${window.location.pathname}?g=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        toast({ title: "Link copied!", description: `${url.length} chars — paste anywhere to share this graph` });
      }).catch(() => {
        toast({ title: "Share URL ready", description: url.substring(0, 60) + "…" });
      });
    } catch { toast({ title: "Share failed", description: "Graph too large to encode" }); }
  }, [nodes, edges, groups, annotations]);

  // ── Export / Import ──
  const exportJSON = useCallback(() => {
    const blob = new Blob([serializeGraph(nodes, edges, groups, annotations)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hypercard-flow.json";
    a.click();
  }, [nodes, edges, groups, annotations]);

  const importRef = useRef<HTMLInputElement>(null);
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { nodes: in_, edges: ie, groups: ig, annotations: ia } = deserializeGraph(ev.target!.result as string);
        mutate(in_, ie, ig);
        setAnnotations(ia);
        toast({ title: "Graph imported", description: `${in_.length} nodes, ${ie.length} edges` });
      } catch { toast({ title: "Import failed", description: "Invalid JSON" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [mutate]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
      if (e.key === "F11") { e.preventDefault(); setPresentMode(v => !v); return; }
      if (e.key === "f" || e.key === "F") { if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setFitAll(v => v + 1); }
      if (e.key === " " && selected && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setFocusTarget(selected); }
      if (e.key === "Escape") {
        if (presentMode) { setPresentMode(false); setPresentPlaying(false); return; }
        setCmdOpen(false); setCtxMenu(null); setSpawnMenu(null); setPaletteOpen(false);
        setSearchOpen(false);
        setSelected(null); setSelectedIds(new Set()); setScrubStep(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selected && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        deleteNodeRef.current(selected);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
      // Select all
      if ((e.metaKey || e.ctrlKey) && e.key === "a" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSelectedIds(new Set(nodes.map(n => n.id)));
        setSelected(nodes[nodes.length - 1]?.id ?? null);
      }
      // Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selected && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        duplicateNodeRef.current(selected);
      }
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
      // Search sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setSearchOpen(v => !v); }
      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        const ids = selectedIds.size > 0 ? selectedIds : selected ? new Set([selected]) : new Set<string>();
        if (ids.size === 0) return;
        const copiedNodes = nodes.filter(n => ids.has(n.id)).map(n => ({ ...n, pos: [n.pos.x, n.pos.y, n.pos.z] as [number, number, number] }));
        const allIds = new Set(copiedNodes.map(n => n.id));
        const copiedEdges = edges.filter(ed => allIds.has(ed.fromNodeId) && allIds.has(ed.toNodeId));
        clipboardRef.current = { nodes: copiedNodes, edges: copiedEdges };
        toast({ title: `Copied ${copiedNodes.length} node${copiedNodes.length > 1 ? "s" : ""}` });
      }
      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === "v" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        if (!clipboardRef.current) return;
        const idMap: Record<string, string> = {};
        const newNodes = clipboardRef.current.nodes.map(sn => {
          const newId = `n${++nodeCounter}`;
          idMap[sn.id] = newId;
          const [x, y, z] = sn.pos;
          return {
            ...sn,
            id: newId,
            pos: new THREE.Vector3(x + 2, y - 1, z),
            ports: sn.ports.map(p => ({ ...p, id: p.id.replace(sn.id, newId) })),
            isEntryPoint: false,
          } as FlowNode;
        });
        const newEdges = clipboardRef.current.edges.map(ed => ({
          ...ed,
          id: `e${Date.now()}_${Math.random().toString(36).slice(2)}`,
          fromNodeId: idMap[ed.fromNodeId] ?? ed.fromNodeId,
          fromPortId: ed.fromPortId.replace(ed.fromNodeId, idMap[ed.fromNodeId] ?? ed.fromNodeId),
          toNodeId: idMap[ed.toNodeId] ?? ed.toNodeId,
          toPortId: ed.toPortId.replace(ed.toNodeId, idMap[ed.toNodeId] ?? ed.toNodeId),
        }));
        mutate([...nodes, ...newNodes], [...edges, ...newEdges]);
        setSelectedIds(new Set(newNodes.map(n => n.id)));
        toast({ title: `Pasted ${newNodes.length} node${newNodes.length > 1 ? "s" : ""}` });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, selectedIds, nodes, edges, undo, redo, mutate]);

  // ── Run flow execution ──
  const runFlow = useCallback(async () => {
    if (runStatus === "running") return;
    const waves = topoWaves(nodes, edges);
    if (waves.length === 0) return;
    const total = nodes.length;
    const startTime = Date.now();
    setRunStatus("running");
    setRunTotal(total);
    setRunStep(0);
    setCurrentWaveLabel("");
    setExecutingNodes(new Set());
    setExecutingEdges(new Set());
    setScrubStep(null);
    setWaveHistory(waves);

    let stepCount = 0;
    for (let wi = 0; wi < waves.length; wi++) {
      const wave = waves[wi];
      const activeEdges = new Set<string>();
      for (const eid of wave) {
        for (const edge of edges) {
          if (edge.toNodeId === eid) activeEdges.add(edge.id);
        }
      }
      const waveNodes = nodes.filter(n => wave.includes(n.id));
      const waveLabel = waveNodes.map(n => `${n.label} (${n.type})`).join(", ");
      setCurrentWaveLabel(waveLabel);

      setExecutingEdges(activeEdges);
      setExecutingNodes(new Set(wave));
      stepCount += wave.length;
      setRunStep(stepCount);
      await new Promise(r => setTimeout(r, 650));
    }

    setExecutingNodes(new Set());
    setExecutingEdges(new Set());
    setCurrentWaveLabel("");
    setRunElapsed((Date.now() - startTime) / 1000);
    setRunStatus("done");
    setShowTimeline(true);
    setTimeout(() => setRunStatus("idle"), 3500);
  }, [nodes, edges, runStatus]);

  // ── Presentation mode auto-play ──
  useEffect(() => {
    if (!presentMode || !presentPlaying) return;
    const waves = topoWaves(nodes, edges);
    if (waves.length === 0) return;
    const id = setInterval(() => {
      setPresentWaveIdx(prev => {
        const next = (prev + 1) % waves.length;
        setExecutingNodes(new Set(waves[next]));
        return next;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [presentMode, presentPlaying, nodes, edges]);

  // When presentation mode starts, reset to wave 0
  useEffect(() => {
    if (presentMode) {
      setPresentWaveIdx(0);
      const waves = topoWaves(nodes, edges);
      if (waves.length > 0) setExecutingNodes(new Set(waves[0]));
    } else {
      setExecutingNodes(new Set());
      setPresentPlaying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentMode]);

  // ── Auto layout ──
  const handleAutoLayout = useCallback(() => {
    const arranged = autoLayout(nodes, edges);
    mutate(arranged, edges);
    setFitAll(v => v + 1);
    toast({ title: "Auto-layout applied", description: `${nodes.length} nodes arranged by BFS wave` });
  }, [nodes, edges, mutate]);

  // ── Port events ──
  const handlePortDown = useCallback((
    nodeId: string, portId: string, portType: PortType, worldPos: THREE.Vector3, e: ThreeEvent<PointerEvent>
  ) => {
    e.stopPropagation();
    setOrbitEnabled(false);
    setPending({ fromNodeId: nodeId, fromPortId: portId, portType, fromPos: worldPos });
    setPendingMousePos(worldPos.clone());
  }, []);

  const handlePortUp = useCallback((nodeId: string, portId: string, portType: PortType) => {
    if (!pending) return;
    if (pending.fromNodeId === nodeId) { setPending(null); setOrbitEnabled(true); return; }
    // Connection validation: prevent duplicates
    const duplicate = edges.some(e => e.fromPortId === pending.fromPortId && e.toPortId === portId);
    if (duplicate) {
      toast({ title: "Already connected", description: "These ports are already wired." });
      setPending(null); setOrbitEnabled(true); return;
    }
    const newEdge: FlowEdge = {
      id: `e${Date.now()}`,
      fromNodeId: pending.fromNodeId,
      fromPortId: pending.fromPortId,
      toNodeId: nodeId,
      toPortId: portId,
      type: pending.portType,
    };
    const newEdges = [...edges, newEdge];
    mutate(nodes, newEdges);
    setPending(null);
    setOrbitEnabled(true);
  }, [pending, nodes, edges, mutate]);

  // ── Node drag ──
  const handleNodeDragStart = useCallback((nodeId: string, e: ThreeEvent<PointerEvent>) => {
    if (pending) return;
    setDraggingNodeId(nodeId);
    setOrbitEnabled(false);
    setSelected(nodeId);
  }, [pending]);

  const handleNodeDrag = useCallback((pos: THREE.Vector3, isZ: boolean) => {
    if (!draggingNodeId) return;
    const snap = (v: number) => gridSnap ? Math.round(v / 0.5) * 0.5 : v;
    setNodes(prev => prev.map(n => {
      if (n.id !== draggingNodeId) return n;
      return isZ
        ? { ...n, pos: new THREE.Vector3(n.pos.x, n.pos.y, pos.z) }
        : { ...n, pos: new THREE.Vector3(snap(pos.x), snap(pos.y), n.pos.z) };
    }));
  }, [draggingNodeId, gridSnap]);

  const handlePointerUp = useCallback(() => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      setOrbitEnabled(true);
      setNodes(prev => { pushHistory(prev, edges); triggerAutoSave(prev, edges, groups); return prev; });
    }
    if (pending) { setPending(null); setOrbitEnabled(true); }
  }, [draggingNodeId, pending, edges, groups, pushHistory, triggerAutoSave]);

  // ── Node operations ──
  const addNode = useCallback((template: typeof NODE_TEMPLATES[number], atPos?: THREE.Vector3) => {
    const pos = atPos ?? new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 3,
    );
    const newNode = makeNode(template, pos, `n${++nodeCounter}`);
    const newNodes = [...nodes, newNode];
    mutate(newNodes, edges);
    setPaletteOpen(false);
    setSpawnMenu(null);
    setSelected(newNode.id);
  }, [nodes, edges, mutate]);

  const addPreset = useCallback((preset: FlowPreset, atCenter?: THREE.Vector3) => {
    const center = atCenter ?? new THREE.Vector3(
      cameraPos.x + (Math.random() - 0.5) * 2,
      cameraPos.y - 4,
      0,
    );
    const createdNodes = preset.nodes.map(({ templateIdx, offset }) => {
      const template = NODE_TEMPLATES[templateIdx];
      const pos = new THREE.Vector3(center.x + offset[0], center.y + offset[1], center.z + offset[2]);
      return makeNode(template, pos, `n${++nodeCounter}`);
    });
    const createdEdges: FlowEdge[] = preset.edges.map(([fni, fpi, tni, tpi]) => {
      const fromNode = createdNodes[fni];
      const toNode   = createdNodes[tni];
      const fromPort = fromNode.ports.filter(p => p.dir === "out")[fpi];
      const toPort   = toNode.ports.filter(p => p.dir === "in")[tpi];
      if (!fromPort || !toPort) return null;
      return {
        id: `e${Date.now()}_${fni}${tni}`,
        fromNodeId: fromNode.id, fromPortId: fromPort.id,
        toNodeId: toNode.id,   toPortId: toPort.id,
        type: fromPort.type,
      } as FlowEdge;
    }).filter(Boolean) as FlowEdge[];
    mutate([...nodes, ...createdNodes], [...edges, ...createdEdges]);
    setSelectedIds(new Set(createdNodes.map(n => n.id)));
    setPaletteOpen(false);
    toast({ title: `Preset "${preset.label}" added`, description: `${createdNodes.length} nodes, ${createdEdges.length} edges` });
  }, [nodes, edges, mutate, cameraPos]);

  const deleteNode = useCallback((nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newEdges = edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId);
    const newGroups = groups.map(g => ({ ...g, nodeIds: g.nodeIds.filter(id => id !== nodeId) })).filter(g => g.nodeIds.length > 0);
    mutate(newNodes, newEdges, newGroups);
    setSelected(null);
    setSelectedIds(prev => { const s = new Set(prev); s.delete(nodeId); return s; });
  }, [nodes, edges, mutate]);
  deleteNodeRef.current = deleteNode;
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const deleteEdge = useCallback((edgeId: string) => {
    const newEdges = edges.filter(e => e.id !== edgeId);
    mutate(nodes, newEdges);
  }, [nodes, edges, mutate]);

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newId = `n${++nodeCounter}`;
    const newNode: FlowNode = {
      ...node,
      id: newId,
      pos: new THREE.Vector3(node.pos.x + 2, node.pos.y - 1, node.pos.z),
      ports: node.ports.map(p => ({ ...p, id: p.id.replace(nodeId, newId) })),
      isEntryPoint: false,
    };
    const newNodes = [...nodes, newNode];
    mutate(newNodes, edges);
    setSelected(newId);
  }, [nodes, edges, mutate]);
  duplicateNodeRef.current = duplicateNode;

  const disconnectNode = useCallback((nodeId: string) => {
    const newEdges = edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId);
    mutate(nodes, newEdges);
  }, [nodes, edges, mutate]);

  const setEntryPoint = useCallback((nodeId: string) => {
    const newNodes = nodes.map(n => ({ ...n, isEntryPoint: n.id === nodeId }));
    mutate(newNodes, edges);
  }, [nodes, edges, mutate]);

  const renameNode = useCallback((nodeId: string, newLabel: string) => {
    const newNodes = nodes.map(n => n.id === nodeId ? { ...n, label: newLabel } : n);
    mutate(newNodes, edges);
  }, [nodes, edges, mutate]);

  const updateNodeDescription = useCallback((nodeId: string, desc: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, description: desc } : n));
  }, []);

  const updateNodeMetadata = useCallback((nodeId: string, metadata: Record<string, string>) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, metadata } : n));
  }, []);

  const updateNodeTags = useCallback((nodeId: string, tags: string[]) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, tags } : n));
  }, []);

  const updateNodeAccentColor = useCallback((nodeId: string, accentColor: string) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, accentColor, color: accentColor } : n));
  }, []);

  // ── Groups ──
  const createGroup = useCallback(() => {
    if (selectedIds.size < 2) return;
    const color = GROUP_COLORS[groups.length % GROUP_COLORS.length];
    const newGroup: NodeGroup = {
      id: `g${Date.now()}`,
      label: "Group",
      nodeIds: [...selectedIds],
      color,
    };
    const newGroups = [...groups, newGroup];
    setGroups(newGroups);
    triggerAutoSave(nodes, edges, newGroups);
    setSelectedIds(new Set());
    toast({ title: "Group created", description: `${newGroup.nodeIds.length} nodes grouped` });
  }, [selectedIds, groups, nodes, edges, triggerAutoSave]);

  const deleteGroup = useCallback((groupId: string) => {
    const newGroups = groups.filter(g => g.id !== groupId);
    setGroups(newGroups);
    triggerAutoSave(nodes, edges, newGroups);
  }, [groups, nodes, edges, triggerAutoSave]);

  const handleContextMenu = useCallback((nodeId: string, clientX: number, clientY: number) => {
    setCtxMenu({ nodeId, x: clientX, y: clientY });
    setSpawnMenu(null);
  }, []);

  const handleCanvasRightClick = useCallback((worldPos: THREE.Vector3, screenX: number, screenY: number) => {
    setSpawnMenu({ worldPos, x: screenX, y: screenY });
    setCtxMenu(null);
  }, []);

  // ── Multi-select ──
  const handleSelect = useCallback((nodeId: string, shift: boolean) => {
    if (shift) {
      setSelectedIds(prev => {
        const s = new Set(prev);
        if (s.has(nodeId)) s.delete(nodeId); else s.add(nodeId);
        return s;
      });
      setSelected(nodeId);
    } else {
      setSelected(nodeId);
      setSelectedIds(new Set([nodeId]));
    }
  }, []);

  const selectedNode = nodes.find(n => n.id === selected);

  // Timeline scrubber: override executingNodes when scrubbing
  const visibleExecutingNodes = useMemo(() => {
    if (scrubStep !== null && waveHistory[scrubStep]) {
      return new Set(waveHistory[scrubStep]);
    }
    return executingNodes;
  }, [scrubStep, waveHistory, executingNodes]);

  const handleZChange = useCallback((val: number[]) => {
    if (!selected) return;
    setNodes(prev => prev.map(n =>
      n.id === selected ? { ...n, pos: new THREE.Vector3(n.pos.x, n.pos.y, val[0]) } : n
    ));
  }, [selected]);

  const handleJumpToPos = useCallback((pos: THREE.Vector3) => {
    setJumpTarget(pos);
  }, []);

  const undoDepth = historyIndexRef.current;

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden bg-background"
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      {/* Top bar */}
      <header className="h-11 flex-shrink-0 flex items-center px-3 gap-2 z-30"
        style={{ background: "hsl(var(--card) / 0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(var(--border))" }}>
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center hover:opacity-80 transition-opacity">
          <Hexagon size={13} className="text-primary-foreground" />
        </button>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft size={10} /> Home</button>
          <ChevronRight size={10} />
          <span className="text-foreground font-medium">3D Flow Canvas</span>
        </div>

        {/* Port legend */}
        <div className="hidden md:flex items-center gap-3 ml-4">
          {(Object.entries(PORT_COLORS) as [PortType, string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={undoDepth <= 0} title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30">
            <Undo2 size={13} className="text-muted-foreground" />
          </button>
          {undoDepth > 0 && <span className="text-[10px] text-muted-foreground font-mono min-w-[14px]">{undoDepth}</span>}
          <button onClick={redo} disabled={historyIndexRef.current >= historyRef.current.length - 1} title="Redo (Ctrl+Shift+Z)"
            className="p-1.5 rounded hover:bg-white/10 transition-colors disabled:opacity-30">
            <Redo2 size={13} className="text-muted-foreground" />
          </button>
        </div>

        {/* Save / Export / Import */}
        <div className="flex items-center gap-0.5">
          <AnimatePresence>
            {savedIndicator && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ color: "hsl(142 72% 55%)", background: "hsl(142 72% 10% / 0.6)" }}>
                Saved ✓
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => { localStorage.setItem(LS_KEY, serializeGraph(nodes, edges, groups)); setSavedIndicator(true); setTimeout(() => setSavedIndicator(false), 2000); }}
            title="Save to browser" className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Save size={13} className="text-muted-foreground" />
          </button>
          <button onClick={exportJSON} title="Export JSON"
            className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Download size={13} className="text-muted-foreground" />
          </button>
          <button onClick={() => importRef.current?.click()} title="Import JSON"
            className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Upload size={13} className="text-muted-foreground" />
          </button>
        </div>

        <span className="text-[10px] text-muted-foreground font-mono hidden md:block">
          {nodes.length} nodes · {edges.length} edges
          {selectedIds.size > 1 && <span style={{ color: "hsl(var(--primary))" }}> · {selectedIds.size} sel</span>}
        </span>

        {/* Presence bar */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "hsl(var(--muted)/0.3)" }}>
          {PRESENCE_USERS.map((u, i) => (
            <div key={u.name} className="relative flex items-center" title={`${u.name} (online)`}>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border"
                style={{ background: u.color + "25", borderColor: u.color + "60", color: u.color }}
              >
                {u.name[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: u.color, border: "1px solid hsl(var(--background))" }} />
            </div>
          ))}
          <span className="text-[9px] text-muted-foreground ml-0.5">3 live</span>
        </div>

        {/* Search sidebar toggle (Ctrl+F) */}
        <button
          onClick={() => setSearchOpen(v => !v)}
          title="Search nodes (Ctrl+F)"
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          style={{ color: searchOpen ? "hsl(var(--primary))" : undefined }}>
          <Filter size={13} className={searchOpen ? "" : "text-muted-foreground"} />
        </button>

        <button onClick={() => setShowMinimap(v => !v)} title="Toggle minimap"
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          style={{ color: showMinimap ? "hsl(var(--primary))" : undefined }}>
          <Map size={13} className="text-muted-foreground" />
        </button>
        <button onClick={() => setFitAll(v => v + 1)} title="Fit all (F)"
          className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <Maximize2 size={13} className="text-muted-foreground" />
        </button>
        {selected && (
          <button onClick={() => setFocusTarget(selected)} title="Focus selected (Space)"
            className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Focus size={13} className="text-muted-foreground" />
          </button>
        )}
        {/* Group button — now functional */}
        {selectedIds.size > 1 && (
          <button
            onClick={createGroup}
            title={`Group ${selectedIds.size} selected nodes`}
            className="flex items-center gap-1 px-2 py-1 rounded transition-all text-[10px] font-medium"
            style={{ color: "hsl(var(--primary))", background: "hsl(var(--primary)/0.12)", border: "1px solid hsl(var(--primary)/0.3)" }}>
            <Users size={12} />
            Group {selectedIds.size}
          </button>
        )}
        {/* Grid snap toggle */}
        <button
          onClick={() => setGridSnap(v => !v)}
          title={`Grid snap ${gridSnap ? "on" : "off"} (0.5 unit)`}
          className="p-1.5 rounded transition-colors"
          style={{ background: gridSnap ? "hsl(var(--primary)/0.15)" : "transparent", color: gridSnap ? "hsl(var(--primary))" : undefined }}>
          <Grid3x3 size={13} className={gridSnap ? "" : "text-muted-foreground"} />
        </button>
        {/* Copy hint */}
        {(selected || selectedIds.size > 0) && (
          <button
            onClick={() => {
              const ids = selectedIds.size > 0 ? selectedIds : selected ? new Set([selected]) : new Set<string>();
              const copiedNodes = nodes.filter(n => ids.has(n.id)).map(n => ({ ...n, pos: [n.pos.x, n.pos.y, n.pos.z] as [number, number, number] }));
              const allIds = new Set(copiedNodes.map(n => n.id));
              const copiedEdges = edges.filter(ed => allIds.has(ed.fromNodeId) && allIds.has(ed.toNodeId));
              clipboardRef.current = { nodes: copiedNodes, edges: copiedEdges };
              toast({ title: `Copied ${copiedNodes.length} node${copiedNodes.length > 1 ? "s" : ""}` });
            }}
            title="Copy selected (Ctrl+C)"
            className="p-1.5 rounded hover:bg-white/10 transition-colors">
            <Clipboard size={13} className="text-muted-foreground" />
          </button>
        )}
        <button onClick={() => setShowInfo(v => !v)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <Info size={13} className="text-muted-foreground" />
        </button>

        {/* Auto-layout button */}
        <button
          onClick={handleAutoLayout}
          title="Auto-layout (BFS columns)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all hover:bg-white/10"
          style={{ color: "hsl(var(--muted-foreground))" }}>
          <LayoutDashboard size={11} />
          Layout
        </button>

        {/* Command palette button */}
        <button
          onClick={() => setCmdOpen(v => !v)}
          title="Command palette (Ctrl+K)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all"
          style={{ color: cmdOpen ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", background: cmdOpen ? "hsl(var(--primary)/0.12)" : "transparent" }}>
          <Command size={11} />
          <span className="hidden md:block">⌘K</span>
        </button>
        <button
          onClick={runFlow}
          disabled={runStatus === "running"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: runStatus === "done" ? "hsl(142 72% 29% / 0.25)" : "hsl(var(--primary) / 0.15)",
            color: runStatus === "done" ? "hsl(142 72% 60%)" : "hsl(var(--primary))",
            border: `1px solid ${runStatus === "done" ? "hsl(142 72% 29% / 0.4)" : "hsl(var(--primary) / 0.3)"}`,
            opacity: runStatus === "running" ? 0.7 : 1,
          }}>
          {runStatus === "running" ? <Square size={11} /> : <Play size={11} />}
          {runStatus === "running" ? "Running…" : runStatus === "done" ? "Done ✓" : "Run Flow"}
        </button>

        {/* Share button */}
        <button
          onClick={encodeGraphToURL}
          title="Copy shareable URL"
          className="p-1.5 rounded hover:bg-white/10 transition-colors">
          <Share2 size={13} className="text-muted-foreground" />
        </button>

        {/* Present button */}
        <button
          onClick={() => setPresentMode(v => !v)}
          title="Fullscreen presentation mode (F11)"
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          style={{ color: presentMode ? "hsl(var(--primary))" : undefined }}>
          <Presentation size={13} className={presentMode ? "" : "text-muted-foreground"} />
        </button>

        <button
          onClick={() => setPaletteOpen(v => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}>
          <Plus size={11} /> Add Node
        </button>
      </header>

      {/* Groups panel strip */}
      {groups.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 flex-shrink-0 overflow-x-auto"
          style={{ background: "hsl(var(--card)/0.6)", borderBottom: "1px solid hsl(var(--border))" }}>
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground mr-1">Groups</span>
          {groups.map(g => (
            <div key={g.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0"
              style={{ background: `${g.color}18`, border: `1px solid ${g.color}50`, color: g.color }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: g.color }} />
              {g.label} · {g.nodeIds.length}
              <button onClick={() => deleteGroup(g.id)} className="ml-0.5 opacity-60 hover:opacity-100">
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Controls info */}
      <AnimatePresence>
        {showInfo && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 right-4 z-50 rounded-xl p-4 text-xs space-y-1.5 w-60"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 30px hsl(var(--background)/0.6)" }}>
            <div className="font-semibold mb-2">Controls</div>
            {[
              ["Left drag",      "Orbit / rotate"],
              ["Right drag",     "Pan camera"],
              ["Scroll",         "Zoom in/out"],
              ["Drag node",      "Move XY"],
              ["Shift+drag",     "Move Z depth"],
              ["F key",          "Fit all to view"],
              ["Space",          "Focus selected"],
              ["Del/Backspace",  "Delete selected"],
              ["Ctrl+A",         "Select all nodes"],
              ["Ctrl+D",         "Duplicate selected"],
              ["Ctrl+K",         "Command palette"],
              ["Port → port",    "Draw connection"],
              ["Hover edge",     "Type label + delete"],
              ["Right-click bg", "Spawn node here"],
              ["Right-click node","Context menu"],
              ["Shift+click ×2+","Multi-select then Group"],
              ["Ctrl+C / Ctrl+V","Copy / Paste nodes"],
              ["Grid Snap btn",  "Snap XY to 0.5 grid"],
              ["Layout btn",     "BFS auto-arrange"],
              ["Run → Timeline", "Scrub execution waves"],
              ["Ctrl+F",         "Node search sidebar"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono text-[10px] text-right">{v}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node palette */}
      <AnimatePresence>
        {paletteOpen && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="absolute left-4 top-16 z-40 rounded-2xl overflow-hidden w-56"
            style={{ background: "hsl(var(--card) / 0.95)", backdropFilter: "blur(16px)", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 40px hsl(var(--background)/0.7)", maxHeight: "calc(100vh - 80px)" }}>

            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {(["nodes", "presets"] as const).map(tab => (
                <button key={tab} onClick={() => setPaletteTab(tab)}
                  className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                  style={{
                    background: paletteTab === tab ? "hsl(var(--primary)/0.12)" : "transparent",
                    color: paletteTab === tab ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                    borderBottom: paletteTab === tab ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-2 py-1.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "hsl(var(--muted)/0.5)" }}>
                <Search size={10} style={{ color: "hsl(var(--muted-foreground))" }} />
                <input
                  value={paletteSearch}
                  onChange={e => setPaletteSearch(e.target.value)}
                  placeholder="Search…"
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    fontSize: 11, color: "hsl(var(--foreground))", width: "100%",
                  }}
                />
                {paletteSearch && (
                  <button onClick={() => setPaletteSearch("")} style={{ color: "hsl(var(--muted-foreground))", cursor: "pointer", background: "none", border: "none" }}>
                    <X size={9} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
              {paletteTab === "nodes" && (
                <div className="p-2 grid grid-cols-2 gap-1.5">
                  {NODE_TEMPLATES.filter(t => t.label.toLowerCase().includes(paletteSearch.toLowerCase())).map((t, i) => {
                    const Icon = t.icon;
                    const color = PORT_COLORS[t.type];
                    return (
                      <button key={i} onClick={() => addNode(t)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all hover:scale-105"
                        style={{ background: `${color}10`, border: `1px solid ${color}30`, color }}>
                        <Icon size={14} />{t.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {paletteTab === "presets" && (
                <div className="p-2 space-y-1.5">
                  {FLOW_PRESETS.filter(p => p.label.toLowerCase().includes(paletteSearch.toLowerCase()) || p.description.toLowerCase().includes(paletteSearch.toLowerCase())).map((preset, i) => {
                    const Icon = preset.icon;
                    return (
                      <button key={i} onClick={() => addPreset(preset)}
                        className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all hover:scale-[1.01]"
                        style={{ background: `${preset.color}10`, border: `1px solid ${preset.color}30` }}>
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${preset.color}20` }}>
                          <Icon size={12} style={{ color: preset.color }} />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold" style={{ color: preset.color }}>{preset.label}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">{preset.description}</div>
                          <div className="text-[8px] font-mono mt-1" style={{ color: `${preset.color}90` }}>
                            {preset.nodes.length} nodes · {preset.edges.length} edges
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node inspector */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-16 z-40 rounded-2xl overflow-hidden w-60"
            style={{ background: "hsl(var(--card) / 0.95)", backdropFilter: "blur(16px)", border: `1px solid ${selectedNode.color}40`, boxShadow: `0 8px 40px ${selectedNode.color}20` }}>
            <div className="px-4 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid hsl(var(--border))", background: `${selectedNode.color}08` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: selectedNode.color, boxShadow: `0 0 6px ${selectedNode.color}` }} />
              <div className="flex-1">
                <div className="text-xs font-semibold">{selectedNode.label}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{selectedNode.type}</div>
              </div>
              {/* Pin/unpin annotation */}
              <button
                onClick={() => {
                  const hasNote = annotations.some(a => a.nodeId === selectedNode.id);
                  if (hasNote) deleteAnnotation(annotations.find(a => a.nodeId === selectedNode.id)!.id);
                  else addAnnotation(selectedNode.id);
                }}
                title="Toggle sticky note"
                className="p-1 rounded transition-colors hover:bg-white/10"
                style={{ color: annotations.some(a => a.nodeId === selectedNode.id) ? "#facc15" : "hsl(var(--muted-foreground))" }}
              >
                <Pin size={11} />
              </button>
              <button onClick={() => deleteNode(selectedNode.id)} className="p-1 rounded hover:bg-destructive/20 transition-colors">
                <Trash2 size={11} className="text-muted-foreground" />
              </button>
            </div>

            {/* Editable description */}
            <div style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <textarea
                value={selectedNode.description ?? ""}
                onChange={e => updateNodeDescription(selectedNode.id, e.target.value)}
                placeholder="Add description…"
                rows={2}
                style={{
                  width: "100%", background: "transparent", resize: "none",
                  border: "none", outline: "none", padding: "10px 16px",
                  fontSize: 11, color: "hsl(var(--muted-foreground))",
                  fontFamily: "inherit", lineHeight: 1.5,
                }}
              />
            </div>

            {/* Ports */}
            <div className="px-4 py-3 space-y-1.5" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Ports</div>
              {selectedNode.ports.map(p => (
                <div key={p.id} className="flex items-center gap-2 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: PORT_COLORS[p.type] }} />
                  <span className="text-muted-foreground capitalize">{p.dir}</span>
                  <span className="font-mono">{p.label}</span>
                  <span className="ml-auto text-[9px] uppercase" style={{ color: PORT_COLORS[p.type] }}>{p.type}</span>
                </div>
              ))}
            </div>

            {/* Position */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Position (XYZ)</div>
              <div className="text-[10px] font-mono text-muted-foreground mb-3">
                x:{selectedNode.pos.x.toFixed(1)} y:{selectedNode.pos.y.toFixed(1)} z:{selectedNode.pos.z.toFixed(1)}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-muted-foreground w-4">Z</span>
                <div className="flex-1">
                  <Slider
                    min={-8} max={8} step={0.1}
                    value={[selectedNode.pos.z]}
                    onValueChange={handleZChange}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                  {selectedNode.pos.z.toFixed(1)}
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-1 opacity-60">Or Shift+drag node in canvas</div>
            </div>

            {/* Advanced: Accent Color */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Accent Color</div>
              <div className="flex flex-wrap gap-1.5">
                {["#7c3aed","#0891b2","#ec4899","#10b981","#f59e0b","#ef4444","#3b82f6","#84cc16"].map(c => (
                  <button
                    key={c}
                    onClick={() => updateNodeAccentColor(selectedNode.id, c)}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: c,
                      boxShadow: selectedNode.accentColor === c || selectedNode.color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none",
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Advanced: Tags */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                <Tag size={9} /> Tags
              </div>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {(selectedNode.tags ?? []).map((tag, ti) => (
                  <span key={ti} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${selectedNode.color}20`, color: selectedNode.color, border: `1px solid ${selectedNode.color}40` }}>
                    {tag}
                    <button onClick={() => updateNodeTags(selectedNode.id, (selectedNode.tags ?? []).filter((_, i) => i !== ti))}
                      style={{ lineHeight: 1, background: "none", border: "none", cursor: "pointer", color: selectedNode.color, padding: 0, fontSize: 9 }}>✕</button>
                  </span>
                ))}
              </div>
              <input
                placeholder="Add tag + Enter"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) { updateNodeTags(selectedNode.id, [...(selectedNode.tags ?? []), val]); (e.target as HTMLInputElement).value = ""; }
                  }
                }}
                style={{
                  background: "hsl(var(--muted)/0.5)", border: "1px solid hsl(var(--border))",
                  borderRadius: 6, padding: "3px 8px", fontSize: 10, width: "100%",
                  color: "hsl(var(--foreground))", outline: "none",
                }}
              />
            </div>

            {/* Advanced: Metadata key-value */}
            <div className="px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1 justify-between">
                <span className="flex items-center gap-1"><Hash size={9} /> Metadata</span>
                <button
                  onClick={() => {
                    const meta = { ...(selectedNode.metadata ?? {}), [`key${Object.keys(selectedNode.metadata ?? {}).length + 1}`]: "" };
                    updateNodeMetadata(selectedNode.id, meta);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--primary))", fontSize: 11, lineHeight: 1 }}>+ add</button>
              </div>
              <div className="space-y-1">
                {Object.entries(selectedNode.metadata ?? {}).map(([k, v]) => (
                  <div key={k} className="flex gap-1 items-center">
                    <input
                      defaultValue={k}
                      onBlur={e => {
                        const newMeta = { ...(selectedNode.metadata ?? {}) };
                        const val = newMeta[k];
                        delete newMeta[k];
                        newMeta[e.target.value] = val;
                        updateNodeMetadata(selectedNode.id, newMeta);
                      }}
                      style={{ flex: 1, background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))", borderRadius: 4, padding: "2px 5px", fontSize: 9, color: "hsl(var(--muted-foreground))", outline: "none", minWidth: 0 }}
                    />
                    <input
                      defaultValue={v}
                      onBlur={e => updateNodeMetadata(selectedNode.id, { ...(selectedNode.metadata ?? {}), [k]: e.target.value })}
                      style={{ flex: 1, background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border))", borderRadius: 4, padding: "2px 5px", fontSize: 9, color: "hsl(var(--foreground))", outline: "none", minWidth: 0 }}
                    />
                    <button
                      onClick={() => {
                        const newMeta = { ...(selectedNode.metadata ?? {}) };
                        delete newMeta[k];
                        updateNodeMetadata(selectedNode.id, newMeta);
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", fontSize: 10, lineHeight: 1, padding: "0 2px", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Execution status bar */}
      <AnimatePresence>
        {runStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2 max-w-md"
            style={{
              background: runStatus === "done" ? "hsl(142 72% 10% / 0.95)" : "hsl(var(--card) / 0.95)",
              border: `1px solid ${runStatus === "done" ? "hsl(142 72% 40% / 0.5)" : "hsl(var(--primary)/0.4)"}`,
              backdropFilter: "blur(12px)",
              boxShadow: runStatus === "done" ? "0 0 20px hsl(142 72% 29% / 0.4)" : "0 4px 20px rgba(0,0,0,0.4)",
              color: runStatus === "done" ? "hsl(142 72% 60%)" : "hsl(var(--primary))",
            }}>
            {runStatus === "running" && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "hsl(var(--primary))" }}
                />
                <span className="truncate">
                  [RUNNING] Step {runStep}/{runTotal}
                  {currentWaveLabel && ` — ${currentWaveLabel}`}
                </span>
              </>
            )}
            {runStatus === "done" && (
              <>[COMPLETE] {runTotal} nodes executed in {runElapsed.toFixed(1)}s ✓</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette (Ctrl+K) */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-start justify-center pt-20"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -12 }}
              onClick={e => e.stopPropagation()}
              className="w-[26rem] rounded-2xl overflow-hidden"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            >
              <CommandPrimitive>
                <CommandInput placeholder="Type a command or search nodes…" autoFocus />
                <CommandList className="max-h-80">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Flow Actions">
                    <CommandItem onSelect={() => { runFlow(); setCmdOpen(false); }}>
                      <Play size={12} className="mr-2" /> Run Flow
                    </CommandItem>
                    <CommandItem onSelect={() => { handleAutoLayout(); setCmdOpen(false); }}>
                      <LayoutDashboard size={12} className="mr-2" /> Auto Layout
                    </CommandItem>
                    <CommandItem onSelect={() => { setFitAll(v => v + 1); setCmdOpen(false); }}>
                      <Maximize2 size={12} className="mr-2" /> Fit View (F)
                    </CommandItem>
                    <CommandItem onSelect={() => { undo(); setCmdOpen(false); }}>
                      <Undo2 size={12} className="mr-2" /> Undo
                    </CommandItem>
                    <CommandItem onSelect={() => { redo(); setCmdOpen(false); }}>
                      <Redo2 size={12} className="mr-2" /> Redo
                    </CommandItem>
                    <CommandItem onSelect={() => { exportJSON(); setCmdOpen(false); }}>
                      <Download size={12} className="mr-2" /> Export JSON
                    </CommandItem>
                    <CommandItem onSelect={() => { setGridSnap(v => !v); setCmdOpen(false); }}>
                      <Grid3x3 size={12} className="mr-2" /> Toggle Grid Snap {gridSnap ? "(ON)" : "(OFF)"}
                    </CommandItem>
                    <CommandItem onSelect={() => { setShowMinimap(v => !v); setCmdOpen(false); }}>
                      <Map size={12} className="mr-2" /> Toggle Minimap
                    </CommandItem>
                    {selectedIds.size > 1 && (
                      <CommandItem onSelect={() => { createGroup(); setCmdOpen(false); }}>
                        <Users size={12} className="mr-2" /> Group Selected ({selectedIds.size})
                      </CommandItem>
                    )}
                    {selected && (
                      <CommandItem onSelect={() => { duplicateNodeRef.current(selected); setCmdOpen(false); }}>
                        <Copy size={12} className="mr-2" /> Duplicate Selected Node
                      </CommandItem>
                    )}
                    <CommandItem onSelect={() => { setSelectedIds(new Set(nodes.map(n => n.id))); setCmdOpen(false); }}>
                      <Layers3 size={12} className="mr-2" /> Select All Nodes
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Add Node">
                    {NODE_TEMPLATES.map((t, i) => {
                      const Icon = t.icon;
                      return (
                        <CommandItem key={i} onSelect={() => { addNode(t); setCmdOpen(false); }}>
                          <Icon size={12} className="mr-2" style={{ color: PORT_COLORS[t.type] }} />
                          Add {t.label}
                          <span className="ml-auto text-[10px] font-mono" style={{ color: PORT_COLORS[t.type] }}>{t.type}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandGroup heading="Insert Preset">
                    {FLOW_PRESETS.map((p, i) => {
                      const Icon = p.icon;
                      return (
                        <CommandItem key={i} onSelect={() => { addPreset(p); setCmdOpen(false); }}>
                          <Icon size={12} className="mr-2" style={{ color: p.color }} />
                          {p.label}
                          <span className="ml-auto text-[10px] text-muted-foreground">{p.description}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </CommandPrimitive>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Timeline Scrubber */}
      <AnimatePresence>
        {showTimeline && waveHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ background: "hsl(var(--card)/0.95)", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 30px rgba(0,0,0,0.5)", maxWidth: "90vw" }}
          >
            {/* Prev */}
            <button
              onClick={() => setScrubStep(s => s === null ? waveHistory.length - 2 : Math.max(0, s - 1))}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Previous wave"
            >
              <ChevronLeft size={13} className="text-muted-foreground" />
            </button>

            {/* Wave segments */}
            <div className="flex items-center gap-1">
              {waveHistory.map((wave, i) => {
                const isActive = scrubStep === i;
                const waveNodes = nodes.filter(n => wave.includes(n.id));
                const colors = [...new Set(waveNodes.map(n => n.color))];
                return (
                  <button
                    key={i}
                    onClick={() => setScrubStep(isActive ? null : i)}
                    title={`Wave ${i + 1}: ${waveNodes.map(n => n.label).join(", ")}`}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: isActive ? "hsl(var(--primary)/0.2)" : "hsl(var(--muted)/0.5)",
                      border: isActive ? "1px solid hsl(var(--primary)/0.5)" : "1px solid transparent",
                      minWidth: 36,
                    }}
                  >
                    <div className="flex gap-0.5">
                      {colors.slice(0, 3).map((c, ci) => (
                        <div key={ci} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono" style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                      W{i + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={() => setScrubStep(s => s === null ? 0 : Math.min(waveHistory.length - 1, s + 1))}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Next wave"
            >
              <ChevronRightIcon size={13} className="text-muted-foreground" />
            </button>

            {/* Replay */}
            <button
              onClick={async () => {
                setScrubStep(null);
                for (let i = 0; i < waveHistory.length; i++) {
                  setScrubStep(i);
                  await new Promise(r => setTimeout(r, 500));
                }
                setScrubStep(null);
              }}
              title="Replay execution"
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <RotateCcw size={12} className="text-muted-foreground" />
            </button>

            {/* Info */}
            {scrubStep !== null && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ color: "hsl(var(--primary))", background: "hsl(var(--primary)/0.1)" }}>
                Wave {scrubStep + 1}/{waveHistory.length} · {waveHistory[scrubStep]?.length} node{waveHistory[scrubStep]?.length !== 1 ? "s" : ""}
              </span>
            )}

            {/* Close */}
            <button onClick={() => { setShowTimeline(false); setScrubStep(null); }} className="p-1 rounded hover:bg-white/10 transition-colors ml-1">
              <X size={11} className="text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search sidebar (Ctrl+F) */}
      <AnimatePresence>
        {searchOpen && (() => {
          const TYPE_FILTERS: (PortType | "all")[] = ["all", "event", "data", "agent", "spatial", "media"];
          const filtered = nodes.filter(n => {
            const matchesType = searchTypeFilter === "all" || n.type === searchTypeFilter;
            const matchesQ = !searchQuery || n.label.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesQ;
          });
          return (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="absolute right-4 z-40 rounded-2xl overflow-hidden w-60 flex flex-col"
              style={{
                top: 52, bottom: 16,
                background: "hsl(var(--card)/0.97)",
                backdropFilter: "blur(16px)",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 8px 40px hsl(var(--background)/0.7)",
              }}
            >
              {/* Header */}
              <div className="px-3 py-2.5 flex items-center gap-2" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                <Search size={11} className="text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search nodes…"
                  style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: 11, color: "hsl(var(--foreground))" }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={11} className="text-muted-foreground" />
                </button>
              </div>

              {/* Type filters */}
              <div className="px-2 py-1.5 flex flex-wrap gap-1" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {TYPE_FILTERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setSearchTypeFilter(t)}
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide transition-all"
                    style={{
                      background: searchTypeFilter === t ? (t === "all" ? "hsl(var(--primary)/0.2)" : PORT_COLORS[t] + "25") : "hsl(var(--muted)/0.4)",
                      color: searchTypeFilter === t ? (t === "all" ? "hsl(var(--primary))" : PORT_COLORS[t]) : "hsl(var(--muted-foreground))",
                      border: `1px solid ${searchTypeFilter === t ? (t === "all" ? "hsl(var(--primary)/0.4)" : PORT_COLORS[t] + "50") : "transparent"}`,
                    }}
                  >{t}</button>
                ))}
              </div>

              {/* Count */}
              <div className="px-3 py-1 text-[9px] text-muted-foreground" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {filtered.length} of {nodes.length} nodes
              </div>

              {/* Node list */}
              <div className="flex-1 overflow-y-auto">
                {filtered.map(n => {
                  const inCount = edges.filter(e => e.toNodeId === n.id).length;
                  const outCount = edges.filter(e => e.fromNodeId === n.id).length;
                  const Icon = NODE_TEMPLATES.find(t => t.label === n.label)?.icon ?? Box;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setFocusTarget(n.id); setSelected(n.id); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-white/5"
                      style={{ borderBottom: "1px solid hsl(var(--border)/0.4)" }}
                    >
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: n.color + "20" }}>
                        <Icon size={10} style={{ color: n.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium truncate">{n.label}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] uppercase font-mono" style={{ color: n.color }}>{n.type}</span>
                          {n.tags && n.tags.length > 0 && <span className="text-[9px] text-muted-foreground">· {n.tags.slice(0,2).join(", ")}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className="text-[8px] font-mono text-muted-foreground">↓{inCount} ↑{outCount}</span>
                        {n.isEntryPoint && <span className="text-[8px]" style={{ color: "#facc15" }}>★</span>}
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-[11px] text-muted-foreground">No nodes found</div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>


      {pending && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full text-xs"
          style={{ background: "hsl(var(--card)/0.9)", border: `1px solid ${PORT_COLORS[pending.portType]}50`, color: PORT_COLORS[pending.portType], backdropFilter: "blur(8px)" }}>
          Drawing {pending.portType} wire — drop on compatible input port
        </div>
      )}

      {/* Shift+drag hint */}
      {shiftHeld && draggingNodeId && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full text-xs"
          style={{ background: "hsl(var(--card)/0.9)", border: "1px solid hsl(var(--primary)/0.4)", color: "hsl(var(--primary))", backdropFilter: "blur(8px)" }}>
          Z-depth mode — drag to push/pull node in depth
        </div>
      )}

      {/* Node context menu */}
      <AnimatePresence>
        {ctxMenu && (
          <NodeContextMenu
            nodeId={ctxMenu.nodeId}
            pos={{ x: ctxMenu.x, y: ctxMenu.y }}
            onClose={() => setCtxMenu(null)}
            onDuplicate={duplicateNode}
            onDelete={deleteNode}
            onDisconnect={disconnectNode}
            onSetEntry={setEntryPoint}
          />
        )}
      </AnimatePresence>

      {/* Canvas right-click spawn menu */}
      <AnimatePresence>
        {spawnMenu && (
          <CanvasSpawnMenu
            pos={{ x: spawnMenu.x, y: spawnMenu.y }}
            worldPos={spawnMenu.worldPos}
            onSpawn={(template, worldPos) => addNode(template, worldPos)}
            onClose={() => setSpawnMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 4, 14], fov: 52 }}
          gl={{ antialias: true, alpha: false }}
          onPointerUp={handlePointerUp}
          style={{ background: "#050510" }}
        >
          <CameraPosReader onChange={setCameraPos} />
          <InteractionController
            draggingNodeId={draggingNodeId}
            shiftHeld={shiftHeld}
            onNodeDrag={handleNodeDrag}
            onPendingMove={setPendingMousePos}
            isPending={!!pending}
          />
          <FitController
            nodes={nodes}
            fitAll={fitAll}
            focusId={focusTarget}
            onFitDone={() => {}}
            onFocusDone={() => setFocusTarget(null)}
          />
          {/* Dedicated jump controller — replaces fragile dummy FitController */}
          <JumpController
            target={jumpTarget}
            onDone={() => setJumpTarget(null)}
          />
          <GraphScene
            nodes={nodes}
            edges={edges}
            groups={groups}
            annotations={annotations}
            selected={selected}
            selectedIds={selectedIds}
            pending={pending}
            pendingMousePos={pendingMousePos}
            executingNodes={visibleExecutingNodes}
            executingEdges={executingEdges}
            isRunning={runStatus === "running"}
            onDragStart={handleNodeDragStart}
            onPortDown={handlePortDown}
            onPortUp={handlePortUp}
            onSelect={handleSelect}
            onDelete={deleteNode}
            onCanvasClick={() => { setSelected(null); setSelectedIds(new Set()); setPaletteOpen(false); setCtxMenu(null); setSpawnMenu(null); }}
            onEdgeDelete={deleteEdge}
            onContextMenu={handleContextMenu}
            onRename={renameNode}
            onDescriptionChange={updateNodeDescription}
            onGroupDelete={deleteGroup}
            onCanvasRightClick={handleCanvasRightClick}
            onAnnotationUpdate={updateAnnotation}
            onAnnotationDelete={deleteAnnotation}
          />
          {/* Presence ghost cursors */}
          {PRESENCE_USERS.map(u => (
            <PresenceCursor key={u.name} name={u.name} color={u.color} />
          ))}
          <OrbitControls
            ref={orbitRef}
            enabled={orbitEnabled}
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.5}
            zoomSpeed={0.9}
            panSpeed={0.8}
            minDistance={2}
            maxDistance={40}
            mouseButtons={{
              LEFT: (draggingNodeId || pending) ? undefined : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
          />
        </Canvas>

        {showMinimap && (
          <Minimap
            nodes={nodes}
            edges={edges}
            groups={groups}
            cameraPos={cameraPos}
            onJump={handleJumpToPos}
          />
        )}
      </div>

      {/* ── Fullscreen Presentation Mode overlay ────────────────────────────── */}
      <AnimatePresence>
        {presentMode && (() => {
          const waves = topoWaves(nodes, edges);
          return (
            <motion.div
              key="present"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                display: "flex", flexDirection: "column",
                pointerEvents: "none",
              }}
            >
              {/* Progress bar */}
              {waves.length > 0 && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "hsl(var(--muted)/0.3)" }}>
                  <motion.div
                    style={{
                      height: "100%",
                      background: "hsl(var(--primary))",
                      width: `${waves.length > 1 ? (presentWaveIdx / (waves.length - 1)) * 100 : 100}%`,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}

              {/* HUD bottom bar */}
              <div style={{
                position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
                display: "flex", alignItems: "center", gap: 10,
                background: "hsl(var(--card)/0.92)",
                backdropFilter: "blur(16px)",
                border: "1px solid hsl(var(--border))",
                borderRadius: 40,
                padding: "8px 20px",
                pointerEvents: "all",
                boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              }}>
                {/* Prev */}
                <button
                  onClick={() => { const idx = Math.max(0, presentWaveIdx - 1); setPresentWaveIdx(idx); setExecutingNodes(new Set(waves[idx] ?? [])); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 4 }}
                  title="Previous wave"
                ><ChevronLeft size={15} /></button>

                {/* Play / Pause */}
                <button
                  onClick={() => setPresentPlaying(v => !v)}
                  style={{
                    background: "hsl(var(--primary)/0.18)", border: "1px solid hsl(var(--primary)/0.4)",
                    cursor: "pointer", color: "hsl(var(--primary))",
                    borderRadius: 20, padding: "4px 14px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
                  }}
                >
                  {presentPlaying ? <Pause size={12} /> : <Play size={12} />}
                  {presentPlaying ? "Pause" : "Play"}
                </button>

                {/* Next */}
                <button
                  onClick={() => { const idx = Math.min(waves.length - 1, presentWaveIdx + 1); setPresentWaveIdx(idx); setExecutingNodes(new Set(waves[idx] ?? [])); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 4 }}
                  title="Next wave"
                ><ChevronRightIcon size={15} /></button>

                <span style={{ fontSize: 10, fontFamily: "monospace", color: "hsl(var(--muted-foreground))", minWidth: 54 }}>
                  {presentWaveIdx + 1} / {waves.length}
                </span>

                {/* Exit */}
                <button
                  onClick={() => { setPresentMode(false); setPresentPlaying(false); setExecutingNodes(new Set()); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", marginLeft: 4 }}
                  title="Exit (Esc)"
                ><X size={14} /></button>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
