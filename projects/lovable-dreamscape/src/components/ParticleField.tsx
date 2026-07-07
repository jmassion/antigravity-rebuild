import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Particles = ({ count = 300 }: { count?: number }) => {
  const mesh = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#d4a754"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const GoldenOrb = () => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial color="#d4a754" transparent opacity={0.04} />
    </mesh>
  );
};

export const ParticleField = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.2} />
        <Particles />
        <GoldenOrb />
      </Canvas>
    </div>
  );
};
