import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Float, MeshDistortMaterial, Sparkles, Text } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const CARD_LABELS = ["Login Card", "Dashboard", "Analytics", "Profile", "Settings", "Checkout", "Onboarding"];

// Curved tube connection between two points via CatmullRomCurve3
function ConnectionTube({ start, end, color }: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const geometry = useMemo(() => {
    const mx = (start[0] + end[0]) / 2;
    const my = (start[1] + end[1]) / 2 + 0.8;
    const mz = (start[2] + end[2]) / 2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(mx, my, mz),
      new THREE.Vector3(...end),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.012, 6, false);
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} transparent opacity={0.35} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

// Animated data packet that travels along a CatmullRom curve
function DataPacket({ start, end, color, speed = 1 }: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());
  const curve = useMemo(() => {
    const mx = (start[0] + end[0]) / 2;
    const my = (start[1] + end[1]) / 2 + 0.8;
    const mz = (start[2] + end[2]) / 2;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(mx, my, mz),
      new THREE.Vector3(...end),
    ]);
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  useFrame((_, delta) => {
    t.current = (t.current + delta * speed * 0.25) % 1;
    if (ref.current) {
      const pt = curve.getPoint(t.current);
      ref.current.position.copy(pt);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} />
    </mesh>
  );
}

// Floating card in 3D space — with hover interaction + drei Text label
function Card3D({ position, color, scale = 1, label }: {
  position: [number, number, number];
  color: string;
  scale?: number;
  label: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { gl } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.2 + position[1]) * 0.05 - meshRef.current.rotation.y) * 0.1;
      if (hovered) {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale * 1.18, 0.08));
      } else {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.08));
      }
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh
        ref={meshRef}
        position={position}
        scale={scale}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); gl.domElement.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); gl.domElement.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); setClicked((c) => !c); }}
      >
        <planeGeometry args={[1.6, 1.0, 1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.28 : 0.15}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>
      {/* Card border */}
      <mesh position={position} scale={scale}>
        <planeGeometry args={[1.62, 1.02, 1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.65 : 0.35}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* drei Text label — pure WebGL, no DOM */}
      {(hovered || clicked) && (
        <Text
          position={[position[0], position[1] + 0.72 * scale, position[2]]}
          fontSize={0.13}
          color={color}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.006}
          outlineColor="#000000"
        >
          {label}
          {"\n"}
          <meshStandardMaterial color={color} transparent opacity={0.9} />
        </Text>
      )}
    </Float>
  );
}

// Instanced node sphere cluster — single draw call, 20 instances
function NodeCluster() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 20;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => ["#7c3aed", "#0891b2", "#ec4899", "#10b981", "#f59e0b"], []);

  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 5,
      y: (Math.random() - 0.5) * 3,
      z: (Math.random() - 0.5) * 2 + 0.5,
      offset: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
    }));
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    positions.forEach((p, i) => {
      color.set(p.color);
      meshRef.current!.setColorAt(i, color);
    });
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [positions]);

  useFrame((state) => {
    if (!meshRef.current) return;
    positions.forEach((p, i) => {
      const s = 0.05 + Math.abs(Math.sin(state.clock.elapsedTime * 1.5 + p.offset)) * 0.04;
      dummy.position.set(p.x, p.y + Math.sin(state.clock.elapsedTime * 0.8 + p.offset) * 0.1, p.z);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 14, 14]} />
      <meshStandardMaterial emissiveIntensity={2.5} toneMapped={false} />
    </instancedMesh>
  );
}

// ShaderMaterial animated grid floor with ripple pulse
function AnimatedGrid() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vPosition;

    float grid(vec2 uv, float res) {
      vec2 g = abs(fract(uv * res - 0.5) - 0.5) / fwidth(uv * res);
      return 1.0 - min(min(g.x, g.y), 1.0);
    }

    void main() {
      float dist = length(vPosition.xz);
      float fade = 1.0 - smoothstep(8.0, 22.0, dist);
      float ripple = sin(dist * 1.5 - uTime * 2.0) * 0.5 + 0.5;
      vec3 col = mix(vec3(0.22, 0.19, 0.60), vec3(0.49, 0.23, 0.93), ripple);
      float g = grid(vPosition.xz, 1.0) * 0.8 + grid(vPosition.xz, 0.2) * 0.15;
      gl_FragColor = vec4(col, g * fade * (0.25 + ripple * 0.15));
    }
  `;

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[50, 50, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Orbit rings around the world orb
function OrbitRings() {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const ref3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref1.current) ref1.current.rotation.z = state.clock.elapsedTime * 0.3;
    if (ref2.current) ref2.current.rotation.x = state.clock.elapsedTime * 0.2;
    if (ref3.current) ref3.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <>
      <mesh ref={ref1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.015, 8, 80]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ref2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.7, 0.01, 8, 80]} />
        <meshStandardMaterial color="#0891b2" emissive="#0891b2" emissiveIntensity={1.2} transparent opacity={0.45} />
      </mesh>
      <mesh ref={ref3} rotation={[Math.PI / 5, Math.PI / 4, Math.PI / 7]}>
        <torusGeometry args={[2.1, 0.008, 8, 80]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.0} transparent opacity={0.3} />
      </mesh>
    </>
  );
}

// Central orb
function WorldOrb() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
      ref.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <sphereGeometry args={[0.6, 64, 64]} />
      <MeshDistortMaterial
        color="#7c3aed"
        emissive="#4c1d95"
        emissiveIntensity={0.5}
        distort={0.3}
        speed={2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

const CARD_DATA = [
  { position: [-4, 1.5, -2] as [number, number, number], color: "#7c3aed", scale: 1.2, label: CARD_LABELS[0] },
  { position: [4, 0.5, -3] as [number, number, number], color: "#0891b2", scale: 1.0, label: CARD_LABELS[1] },
  { position: [-3, -1, -4] as [number, number, number], color: "#7c3aed", scale: 0.9, label: CARD_LABELS[2] },
  { position: [3, 2, -1] as [number, number, number], color: "#ec4899", scale: 0.8, label: CARD_LABELS[3] },
  { position: [1, -1.5, -5] as [number, number, number], color: "#0891b2", scale: 1.1, label: CARD_LABELS[4] },
  { position: [-2, 2.5, -6] as [number, number, number], color: "#10b981", scale: 0.85, label: CARD_LABELS[5] },
  { position: [5, -0.5, -2] as [number, number, number], color: "#f59e0b", scale: 0.75, label: CARD_LABELS[6] },
];

const CONNECTIONS: Array<{ start: [number, number, number]; end: [number, number, number]; color: string }> = [
  { start: [-1.5, 0.5, 1], end: [1.5, -0.3, 0.8], color: "#7c3aed" },
  { start: [1.5, -0.3, 0.8], end: [0, 1.2, 0.5], color: "#0891b2" },
  { start: [0, 1.2, 0.5], end: [-2, -0.5, 0.3], color: "#ec4899" },
  { start: [-2, -0.5, 0.3], end: [-1.5, 0.5, 1], color: "#10b981" },
  { start: [2.5, 0.8, 0.2], end: [1.5, -0.3, 0.8], color: "#f59e0b" },
];

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0a0a0f", 15, 40]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#7c3aed" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#0891b2" />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#6d28d9" />

      <Stars radius={80} depth={50} count={3000} factor={4} fade speed={0.5} />
      <Sparkles count={60} scale={5} size={1.5} speed={0.3} color="#7c3aed" />
      <Sparkles count={30} scale={3} size={1} speed={0.5} color="#0891b2" />

      <WorldOrb />
      <OrbitRings />
      <AnimatedGrid />

      {CARD_DATA.map((card) => (
        <Card3D key={card.label} position={card.position} color={card.color} scale={card.scale} label={card.label} />
      ))}

      {/* Curved tube connections */}
      {CONNECTIONS.map((c, i) => (
        <ConnectionTube key={i} start={c.start} end={c.end} color={c.color} />
      ))}

      {/* Instanced nerve cluster */}
      <NodeCluster />

      {/* Animated data packets along curves */}
      <DataPacket start={[-1.5, 0.5, 1]} end={[1.5, -0.3, 0.8]} color="#7c3aed" speed={1.2} />
      <DataPacket start={[1.5, -0.3, 0.8]} end={[0, 1.2, 0.5]} color="#0891b2" speed={0.9} />
      <DataPacket start={[0, 1.2, 0.5]} end={[-2, -0.5, 0.3]} color="#ec4899" speed={1.5} />
      <DataPacket start={[2.5, 0.8, 0.2]} end={[1.5, -0.3, 0.8]} color="#f59e0b" speed={0.8} />
    </>
  );
}

export function WorldCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2, 10], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Suspense>
    </Canvas>
  );
}
