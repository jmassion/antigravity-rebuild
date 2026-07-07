import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Node types matching the design system
const NODES = [
  { id: 0, pos: [-2.2, 1.0, 0] as [number, number, number], color: "#7c3aed", label: "Event" },
  { id: 1, pos: [0, 1.6, 0] as [number, number, number], color: "#0891b2", label: "Data" },
  { id: 2, pos: [2.2, 0.8, 0] as [number, number, number], color: "#ec4899", label: "Agent" },
  { id: 3, pos: [-1.5, -1.2, 0] as [number, number, number], color: "#10b981", label: "Spatial" },
  { id: 4, pos: [1.5, -1.4, 0] as [number, number, number], color: "#f59e0b", label: "Media" },
  { id: 5, pos: [0, -0.2, 0.5] as [number, number, number], color: "#6d28d9", label: "Voice" },
];

const EDGES = [
  [0, 1], [1, 2], [0, 3], [3, 5], [5, 4], [1, 5], [2, 4],
];

function NodeSphere({ position, color, index }: {
  position: [number, number, number];
  color: string;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = index * 0.8;
  useFrame((state) => {
    if (ref.current) {
      const s = 0.9 + Math.sin(state.clock.elapsedTime * 1.8 + offset) * 0.12;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.18, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} transparent opacity={0.9} />
    </mesh>
  );
}

function ConnectionTube({ fromPos, toPos, color }: {
  fromPos: [number, number, number];
  toPos: [number, number, number];
  color: string;
}) {
  const geometry = useMemo(() => {
    const mx = (fromPos[0] + toPos[0]) / 2;
    const my = (fromPos[1] + toPos[1]) / 2 + 0.4;
    const mz = (fromPos[2] + toPos[2]) / 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(mx, my, mz),
      new THREE.Vector3(...toPos),
    ]);
    return new THREE.TubeGeometry(curve, 16, 0.015, 5, false);
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} transparent opacity={0.4} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

// Traveling data packet along a curve
function Packet({ fromPos, toPos, color, offset }: {
  fromPos: [number, number, number];
  toPos: [number, number, number];
  color: string;
  offset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(offset);
  const curve = useMemo(() => {
    const mx = (fromPos[0] + toPos[0]) / 2;
    const my = (fromPos[1] + toPos[1]) / 2 + 0.4;
    const mz = (fromPos[2] + toPos[2]) / 2;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(mx, my, mz),
      new THREE.Vector3(...toPos),
    ]);
  }, []);

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.4) % 1;
    if (ref.current) {
      const pt = curve.getPoint(t.current);
      ref.current.position.copy(pt);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
    </mesh>
  );
}

function GraphScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 4, 3]} intensity={2.5} color="#7c3aed" />
      <pointLight position={[3, -2, 2]} intensity={1.5} color="#0891b2" />
      <pointLight position={[-3, 2, 1]} intensity={1} color="#ec4899" />

      {/* Connection tubes */}
      {EDGES.map(([a, b], i) => {
        const from = NODES[a];
        const to = NODES[b];
        return (
          <ConnectionTube
            key={i}
            fromPos={from.pos}
            toPos={to.pos}
            color={from.color}
          />
        );
      })}

      {/* Traveling packets */}
      {EDGES.map(([a, b], i) => (
        <Packet
          key={i}
          fromPos={NODES[a].pos}
          toPos={NODES[b].pos}
          color={NODES[a].color}
          offset={i * 0.15}
        />
      ))}

      {/* Node spheres */}
      {NODES.map((n) => (
        <NodeSphere key={n.id} position={n.pos} color={n.color} index={n.id} />
      ))}
    </>
  );
}

export function NodeGraphScene({ className }: { className?: string }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      className={className}
    >
      <Suspense fallback={null}>
        <GraphScene />
      </Suspense>
    </Canvas>
  );
}
