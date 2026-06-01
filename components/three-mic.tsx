"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Mic() {
  const ref = useRef<Group>(null);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.55;
  });

  const gold = { color: "#C89428", metalness: 0.88, roughness: 0.16 } as const;
  const darkGold = { color: "#8B6210", metalness: 0.92, roughness: 0.1 } as const;

  return (
    <group ref={ref}>
      {/* ── Mic head ── */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      {/* Wireframe grid overlay on head for vintage look */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.57, 10, 10]} />
        <meshStandardMaterial color="#6B4E08" wireframe metalness={0.95} roughness={0.05} />
      </mesh>

      {/* ── Neck ── */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.72, 20]} />
        <meshStandardMaterial {...darkGold} />
      </mesh>

      {/* ── Body grip ── */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 1.22, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>

      {/* Grip ridges */}
      {[-0.52, -0.14, 0.24].map((y, i) => (
        <mesh key={i} position={[0, -0.35 + y, 0]}>
          <torusGeometry args={[0.235, 0.024, 10, 36]} />
          <meshStandardMaterial {...darkGold} />
        </mesh>
      ))}

      {/* ── Base ── */}
      <mesh position={[0, -1.03, 0]}>
        <cylinderGeometry args={[0.38, 0.46, 0.16, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>
    </group>
  );
}

export default function ThreeMic() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} color="#FFE8A0" />
      <directionalLight position={[4, 6, 4]} intensity={5} color="#FFD060" />
      <directionalLight position={[-3, 2, 1]} intensity={2} color="#FFF5DC" />
      <pointLight position={[0, -3, 3]} intensity={2} color="#FFAA00" />
      <Mic />
    </Canvas>
  );
}
