import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CardPlane({ position, color, rotation = [0, 0, 0] }: {
  position: [number, number, number];
  color: string;
  label: string;
  rotation?: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.08;
    }
  });

  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <group ref={ref} position={position}>
        <mesh>
          <planeGeometry args={[2.2, 1.4]} />
          <meshStandardMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <planeGeometry args={[2.22, 1.42]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} wireframe />
        </mesh>
        {/* Corner glow dots */}
        {[[-1.1, 0.7], [1.1, 0.7], [-1.1, -0.7], [1.1, -0.7]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.01]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Satellite dot orbiting the icosahedron
function SatelliteDot({ index, total, color }: { index: number; total: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const baseAngle = (index / total) * Math.PI * 2;
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * 0.6 + baseAngle;
      ref.current.position.x = Math.cos(t) * 0.9;
      ref.current.position.z = Math.sin(t) * 0.9;
      ref.current.position.y = Math.sin(t * 1.3 + baseAngle) * 0.2;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} />
    </mesh>
  );
}

function CentralCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shell1Ref = useRef<THREE.Mesh>(null);
  const shell2Ref = useRef<THREE.Mesh>(null);
  const shell3Ref = useRef<THREE.Mesh>(null);
  // Use a typed ref for MeshDistortMaterial
  const matRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    // Pulsate distort
    if (matRef.current) {
      matRef.current.distort = 0.15 + Math.abs(Math.sin(t * 0.8)) * 0.2;
    }
    // Counter-rotating shells
    if (shell1Ref.current) {
      shell1Ref.current.rotation.y = t * 0.3;
      shell1Ref.current.rotation.x = t * 0.15;
    }
    if (shell2Ref.current) {
      shell2Ref.current.rotation.y = -t * 0.22;
      shell2Ref.current.rotation.z = t * 0.18;
    }
    if (shell3Ref.current) {
      shell3Ref.current.rotation.x = -t * 0.28;
      shell3Ref.current.rotation.z = -t * 0.12;
    }
  });

  const satelliteColors = ["#7c3aed", "#0891b2", "#ec4899", "#10b981", "#f59e0b", "#6d28d9", "#0e7490", "#be185d"];

  return (
    <>
      {/* Solid icosahedron core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 1]} />
        <MeshDistortMaterial
          ref={matRef}
          color="#6d28d9"
          emissive="#4c1d95"
          emissiveIntensity={0.8}
          distort={0.2}
          speed={3}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Shell 1 — tight */}
      <mesh ref={shell1Ref} scale={[0.7, 0.7, 0.7]}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.28} wireframe />
      </mesh>

      {/* Shell 2 — mid */}
      <mesh ref={shell2Ref} scale={[0.9, 0.9, 0.9]}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#0891b2" transparent opacity={0.18} wireframe />
      </mesh>

      {/* Shell 3 — outer */}
      <mesh ref={shell3Ref} scale={[1.15, 1.15, 1.15]}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshStandardMaterial color="#ec4899" transparent opacity={0.10} wireframe />
      </mesh>

      {/* 8 satellite dots orbiting on XZ plane */}
      {satelliteColors.map((c, i) => (
        <SatelliteDot key={i} index={i} total={8} color={c} />
      ))}
    </>
  );
}

export function HyperCard3DPreview() {
  return (
    <Canvas
      camera={{ position: [0, 1, 8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={3} color="#7c3aed" />
        <pointLight position={[-4, -2, 2]} intensity={2} color="#0891b2" />
        <pointLight position={[0, -4, 4]} intensity={1.5} color="#ec4899" />

        <CentralCore />

        <CardPlane position={[-3, 1.2, -1]} color="#7c3aed" label="Design" rotation={[0, 0.3, 0]} />
        <CardPlane position={[3, 0.8, -1]} color="#0891b2" label="Data" rotation={[0, -0.3, 0]} />
        <CardPlane position={[-2, -1.5, -2]} color="#ec4899" label="Agent" rotation={[0.1, 0.2, 0]} />
        <CardPlane position={[2, -1.2, -1.5]} color="#10b981" label="Flow" rotation={[-0.1, -0.2, 0]} />
        <CardPlane position={[0, 2.2, -2]} color="#f59e0b" label="Voice" rotation={[0.2, 0, 0]} />
      </Suspense>
    </Canvas>
  );
}
