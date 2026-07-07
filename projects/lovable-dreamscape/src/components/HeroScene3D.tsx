import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Golden dust particles – 4K-density field                          */
/* ------------------------------------------------------------------ */
const GoldenDust = ({ count = 600 }: { count?: number }) => {
  const ref = useRef<THREE.Points>(null!);

  const [positions, sizes, opacities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const op = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sz[i] = Math.random() * 3 + 0.5;
      op[i] = Math.random() * 0.7 + 0.3;
    }
    return [pos, sz, op];
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.05;
    // Gentle vertical drift
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.0003;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#d4a754"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ------------------------------------------------------------------ */
/*  Purple nebula orbs – volumetric glow                              */
/* ------------------------------------------------------------------ */
const PurpleNebula = () => {
  const ref1 = useRef<THREE.Mesh>(null!);
  const ref2 = useRef<THREE.Mesh>(null!);
  const ref3 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref1.current) {
      ref1.current.position.x = Math.sin(t * 0.2) * 0.5 - 3;
      ref1.current.position.y = Math.cos(t * 0.15) * 0.3 + 1;
      ref1.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.1);
    }
    if (ref2.current) {
      ref2.current.position.x = Math.cos(t * 0.18) * 0.4 + 3;
      ref2.current.position.y = Math.sin(t * 0.12) * 0.5 - 0.5;
      ref2.current.scale.setScalar(1 + Math.cos(t * 0.25) * 0.08);
    }
    if (ref3.current) {
      ref3.current.position.y = Math.sin(t * 0.1) * 0.3 + 2.5;
      ref3.current.scale.setScalar(1 + Math.sin(t * 0.2) * 0.12);
    }
  });

  return (
    <>
      <mesh ref={ref1} position={[-3, 1, -4]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#6b21a8" transparent opacity={0.04} />
      </mesh>
      <mesh ref={ref2} position={[3, -0.5, -3]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.05} />
      </mesh>
      <mesh ref={ref3} position={[0, 2.5, -5]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#d4a754" transparent opacity={0.025} />
      </mesh>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Floating character card – textured plane in 3D space              */
/* ------------------------------------------------------------------ */
const FloatingCharacter = ({
  url,
  position,
  scale = 2.5,
  floatSpeed = 1,
  floatIntensity = 0.4,
  rotationIntensity = 0.2,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  floatSpeed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
}) => {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null!);

  // Calculate aspect ratio from texture
  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 1;

  return (
    <Float
      speed={floatSpeed}
      floatIntensity={floatIntensity}
      rotationIntensity={rotationIntensity}
    >
      <mesh ref={meshRef} position={position}>
        <planeGeometry args={[scale * aspect, scale]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </Float>
  );
};

/* ------------------------------------------------------------------ */
/*  Golden ring – orbiting accent                                     */
/* ------------------------------------------------------------------ */
const GoldenRing = ({ radius = 3, y = 0 }: { radius?: number; y?: number }) => {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.1;
    ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
  });

  return (
    <mesh ref={ref} position={[0, y, -2]}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color="#d4a754" transparent opacity={0.3} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/*  Sparkle burst – small bright flecks near characters               */
/* ------------------------------------------------------------------ */
const SparkleBurst = ({ center, count = 30 }: { center: [number, number, number]; count?: number }) => {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = center[0] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 1] = center[1] + (Math.random() - 0.5) * 2;
      pos[i * 3 + 2] = center[2] + (Math.random() - 0.5) * 1;
    }
    return pos;
  }, [center, count]);

  useFrame((state) => {
    if (!ref.current) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.001;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffd700"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ------------------------------------------------------------------ */
/*  Camera rig – subtle breathing motion                              */
/* ------------------------------------------------------------------ */
const CameraRig = () => {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.08) * 0.3;
    camera.position.y = Math.cos(t * 0.06) * 0.15;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

/* ------------------------------------------------------------------ */
/*  Scene content wrapper                                             */
/* ------------------------------------------------------------------ */
const SceneContent = () => {
  // Import the image URLs - we pass them as props from the parent
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#d4a754" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#7c3aed" />

      {/* Atmospheric elements */}
      <GoldenDust count={500} />
      <PurpleNebula />
      <GoldenRing radius={4} y={0} />
      <GoldenRing radius={2.5} y={0.5} />

      {/* Sparkle accents near character positions */}
      <SparkleBurst center={[-3.5, 0, 0]} count={20} />
      <SparkleBurst center={[3.5, 0, 0]} count={20} />
      <SparkleBurst center={[0, -0.5, 0]} count={25} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Character layer wrapper (needs Suspense for texture loading)      */
/* ------------------------------------------------------------------ */
const CharacterLayer = ({
  tigerDirectorUrl,
  tigerCubUrl,
  goldenCameraUrl,
}: {
  tigerDirectorUrl: string;
  tigerCubUrl: string;
  goldenCameraUrl: string;
}) => {
  return (
    <Suspense fallback={null}>
      {/* Main tiger director – center-left, prominent */}
      <FloatingCharacter
        url={tigerDirectorUrl}
        position={[-3.2, -0.3, 0.5]}
        scale={3.2}
        floatSpeed={1.2}
        floatIntensity={0.3}
        rotationIntensity={0.1}
      />

      {/* Tiger cub – center-right, smaller */}
      <FloatingCharacter
        url={tigerCubUrl}
        position={[3.2, -0.2, 0.3]}
        scale={2.6}
        floatSpeed={1.5}
        floatIntensity={0.5}
        rotationIntensity={0.15}
      />

      {/* Golden camera – top center, floating above */}
      <FloatingCharacter
        url={goldenCameraUrl}
        position={[0, 1.8, -0.5]}
        scale={2}
        floatSpeed={0.8}
        floatIntensity={0.6}
        rotationIntensity={0.05}
      />
    </Suspense>
  );
};

/* ------------------------------------------------------------------ */
/*  Main exported component                                           */
/* ------------------------------------------------------------------ */
export const HeroScene3D = ({
  tigerDirectorUrl,
  tigerCubUrl,
  goldenCameraUrl,
}: {
  tigerDirectorUrl: string;
  tigerCubUrl: string;
  goldenCameraUrl: string;
}) => {
  return (
    <div className="absolute inset-0 z-[1]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <SceneContent />
        <CharacterLayer
          tigerDirectorUrl={tigerDirectorUrl}
          tigerCubUrl={tigerCubUrl}
          goldenCameraUrl={goldenCameraUrl}
        />
      </Canvas>
    </div>
  );
};
