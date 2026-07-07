import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Sparkles, Trail } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Card cluster item
function ClusterCard({ position, color, w = 1.4, h = 0.9 }: {
  position: [number, number, number];
  color: string;
  w?: number;
  h?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 + position[0]) * 0.05;
    }
  });
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <mesh ref={ref} position={position}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={position}>
        <planeGeometry args={[w + 0.02, h + 0.02]} />
        <meshStandardMaterial color={color} transparent opacity={0.35} wireframe side={THREE.DoubleSide} />
      </mesh>
    </Float>
  );
}

// Orbiting agent orb with comet Trail
function AgentOrb({ radius, speed, color, yOffset = 0 }: {
  radius: number;
  speed: number;
  color: string;
  yOffset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = yOffset + Math.sin(t * 0.5) * 0.3;
    }
  });
  return (
    <Trail
      width={0.35}
      length={10}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
      </mesh>
    </Trail>
  );
}

// Animated portal ring with swirl ShaderMaterial disc
function PortalRing() {
  const torusRef = useRef<THREE.Mesh>(null);
  const discRef = useRef<THREE.ShaderMaterial>(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      vec2 centered = vUv - 0.5;
      float angle = atan(centered.y, centered.x);
      float r = length(centered);
      float swirl = sin(angle * 4.0 + uTime * 2.5 - r * 9.0);
      float ring = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.38, 0.5, r));
      float glow = smoothstep(0.5, 0.0, r) * 0.25;
      float intensity = ring * (swirl * 0.5 + 0.5) * 0.75 + glow;
      gl_FragColor = vec4(uColor, intensity);
    }
  `;

  useFrame((state) => {
    if (torusRef.current) {
      torusRef.current.rotation.z = state.clock.elapsedTime * 0.4;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      torusRef.current.scale.set(s, s, s);
    }
    if (discRef.current) {
      discRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const colorVec = useMemo(() => new THREE.Color("#7c3aed"), []);

  return (
    <>
      <mesh ref={torusRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 12, 80]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={2} transparent opacity={0.85} />
      </mesh>
      {/* Swirl shader disc */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 64]} />
        <shaderMaterial
          ref={discRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: colorVec },
          }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// User cursor (presence dot with random walk)
function PresenceDot({ color, startX, startZ }: { color: string; startX: number; startZ: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useRef({ x: startX, z: startZ, tx: startX, tz: startZ, timer: 0 });
  useFrame((_, delta) => {
    const o = offset.current;
    o.timer -= delta;
    if (o.timer <= 0) {
      o.tx = startX + (Math.random() - 0.5) * 3;
      o.tz = startZ + (Math.random() - 0.5) * 3;
      o.timer = 1.5 + Math.random() * 2;
    }
    o.x += (o.tx - o.x) * delta * 1.5;
    o.z += (o.tz - o.z) * delta * 1.5;
    if (ref.current) {
      ref.current.position.x = o.x;
      ref.current.position.z = o.z;
      ref.current.position.y = 0.05;
    }
  });
  return (
    <mesh ref={ref} position={[startX, 0.05, startZ]}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </mesh>
  );
}

// Animated ShaderMaterial grid floor
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
      gl_FragColor = vec4(col, g * fade * (0.25 + ripple * 0.12));
    }
  `;

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[60, 60, 1, 1]} />
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

function WorkspaceScene() {
  return (
    <>
      <fog attach="fog" args={["#0a0a0f", 18, 45]} />

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 6, 0]} intensity={3} color="#7c3aed" />
      <pointLight position={[8, 3, -4]} intensity={1.5} color="#0891b2" />
      <pointLight position={[-8, 2, 4]} intensity={1} color="#ec4899" />

      <Stars radius={80} depth={50} count={2000} factor={3} fade speed={0.3} />
      <Sparkles count={40} scale={6} size={1.2} speed={0.25} color="#7c3aed" />

      {/* Shader grid floor */}
      <AnimatedGrid />

      {/* Faint wall planes */}
      <mesh position={[0, 3, -12]} rotation={[0, 0, 0]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#1e1b4b" transparent opacity={0.08} />
      </mesh>
      <mesh position={[-12, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[30, 10]} />
        <meshStandardMaterial color="#1e1b4b" transparent opacity={0.05} />
      </mesh>

      {/* Card clusters */}
      <ClusterCard position={[-5, 1.5, -3]} color="#7c3aed" />
      <ClusterCard position={[-5.3, 1.8, -3.3]} color="#7c3aed" w={1.3} h={0.82} />
      <ClusterCard position={[-4.7, 1.2, -2.7]} color="#6d28d9" w={1.2} h={0.75} />

      <ClusterCard position={[5, 0.5, -4]} color="#0891b2" />
      <ClusterCard position={[5.3, 0.8, -4.3]} color="#0891b2" w={1.3} h={0.82} />
      <ClusterCard position={[4.7, 0.2, -3.7]} color="#0e7490" w={1.1} h={0.7} />

      <ClusterCard position={[0, 2.5, -6]} color="#ec4899" />
      <ClusterCard position={[0.3, 2.8, -6.3]} color="#ec4899" w={1.25} h={0.8} />
      <ClusterCard position={[-0.3, 2.2, -5.7]} color="#be185d" w={1.1} h={0.68} />

      <ClusterCard position={[-3, -1, -2]} color="#10b981" w={1.0} h={0.65} />
      <ClusterCard position={[3, -0.5, -1]} color="#f59e0b" w={0.9} h={0.58} />

      {/* Portal with swirl shader */}
      <PortalRing />

      {/* Agent orbs with Trail comet tails */}
      <AgentOrb radius={3.5} speed={0.25} color="#7c3aed" yOffset={0.5} />
      <AgentOrb radius={4.2} speed={-0.18} color="#0891b2" yOffset={-0.3} />
      <AgentOrb radius={3.0} speed={0.35} color="#ec4899" yOffset={0.8} />
      <AgentOrb radius={4.8} speed={0.14} color="#10b981" yOffset={0.2} />

      {/* Presence dots */}
      <PresenceDot color="#7c3aed" startX={-1} startZ={1} />
      <PresenceDot color="#0891b2" startX={2} startZ={-0.5} />
      <PresenceDot color="#ec4899" startX={0.5} startZ={1.5} />
    </>
  );
}

export function HyperCard3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 4, 12], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <WorkspaceScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Suspense>
    </Canvas>
  );
}
