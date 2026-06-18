// ThreeRobotViewer.tsx – 3D robot visualization with telemetry-driven pose
"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";

interface Telemetry {
  x: number;
  y: number;
  theta: number;
  battery: number;
  sensors: {
    ultrasonic: number;
    lidar: number[];
    gps: number[];
    accelerometer: number[];
  };
}

interface ThreeRobotViewerProps {
  telemetry?: Telemetry;
  environment?: string;
}

// ── Ground plane with grid ──────────────────────────────────────────────
function GroundPlane() {
  return (
    <>
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellColor="#1e293b"
        sectionSize={5}
        sectionColor="#0e7490"
        fadeDistance={30}
        position={[0, -0.01, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

// ── Obstacles per environment ───────────────────────────────────────────
const ENV_OBSTACLES: Record<string, [number, number, number, number][]> = {
  empty: [],
  warehouse: [
    [-5, -5, -3, -1], [-5, 1, -3, 5], [3, -5, 5, -1], [3, 1, 5, 5], [-1, -2, 1, 2],
  ],
  hospital: [
    [-9.5, 3, -2, 3.5], [2, 3, 9.5, 3.5], [-4, -9.5, -3.5, -2], [4, -9.5, 4.5, -2], [-2, -3, 2, -2.5],
  ],
  factory: [
    [-8, -8, 2, -7.5], [-2, 7.5, 8, 8], [-6, -2, -3, 2], [3, -2, 6, 2],
  ],
  smart_home: [
    [-9.5, 0, 2, 0.5], [4, 0, 9.5, 0.5], [0, -9.5, 0.5, -3], [0, 3, 0.5, 9.5],
  ],
};

function Obstacles({ environment }: { environment: string }) {
  const obstacles = ENV_OBSTACLES[environment] || [];
  return (
    <>
      {obstacles.map(([x1, z1, x2, z2], i) => {
        const w = Math.abs(x2 - x1);
        const d = Math.abs(z2 - z1);
        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;
        return (
          <mesh key={i} position={[cx, 0.4, cz]} castShadow receiveShadow>
            <boxGeometry args={[w, 0.8, d]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.35} />
          </mesh>
        );
      })}
    </>
  );
}

// ── LIDAR beams visualized as lines ─────────────────────────────────────
function LidarBeams({ telemetry }: { telemetry: Telemetry }) {
  const points = useMemo(() => {
    if (!telemetry.sensors?.lidar) return [];
    return telemetry.sensors.lidar.map((dist: number, idx: number) => {
      const angle = telemetry.theta + (idx * 2 * Math.PI) / telemetry.sensors.lidar.length;
      return new THREE.Vector3(
        telemetry.x + dist * Math.cos(angle),
        0.3,
        telemetry.y + dist * Math.sin(angle)
      );
    });
  }, [telemetry]);

  if (points.length === 0) return null;

  return (
    <>
      {points.map((pt, i) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(telemetry.x, 0.3, telemetry.y),
          pt,
        ]);
        return (
          <lineSegments key={i} geometry={lineGeo}>
            <lineBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
          </lineSegments>
        );
      })}
    </>
  );
}

// ── The robot mesh, driven by telemetry ─────────────────────────────────
function RobotMesh({ telemetry }: { telemetry: Telemetry }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Smoothly lerp position & rotation to match telemetry
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, telemetry.x, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, telemetry.y, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -telemetry.theta, 0.1);
  });

  // Battery-driven colour: cyan when healthy, red when low
  const bodyColor = telemetry.battery < 25 ? "#ef4444" : "#06b6d4";

  return (
    <group ref={groupRef} position={[telemetry.x, 0, telemetry.y]}>
      {/* Chassis */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 1.0]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Head / sensor dome */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#a78bfa" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Direction indicator (nose) */}
      <mesh position={[0, 0.25, -0.55]}>
        <coneGeometry args={[0.12, 0.25, 8]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.5} />
      </mesh>

      {/* Left wheel */}
      <mesh position={[-0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Right wheel */}
      <mesh position={[0.5, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// ── Ultrasonic cone ─────────────────────────────────────────────────────
function UltrasonicCone({ telemetry }: { telemetry: Telemetry }) {
  if (telemetry.sensors?.ultrasonic === undefined) return null;
  const dist = Math.min(telemetry.sensors.ultrasonic, 5);

  return (
    <mesh
      position={[telemetry.x, 0.3, telemetry.y - dist / 2]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <coneGeometry args={[dist * 0.15, dist, 16, 1, true]} />
      <meshStandardMaterial color="#06b6d4" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Main exported component ─────────────────────────────────────────────
export default function ThreeRobotViewer({
  telemetry = {
    x: 0, y: 0, theta: 0, battery: 100,
    sensors: { ultrasonic: 5, lidar: Array(16).fill(8), gps: [0, 0], accelerometer: [0, 0] },
  },
  environment = "empty",
}: ThreeRobotViewerProps) {
  return (
    <div className="w-full aspect-[5/4] max-w-[500px] bg-gray-950 rounded-xl overflow-hidden border border-cyan-950 shadow-2xl">
      <Canvas
        shadows
        camera={{ position: [8, 8, 8], fov: 45 }}
        style={{ background: "#020617" }}
      >
        <fog attach="fog" args={["#020617", 15, 30]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#06b6d4" />

        <GroundPlane />
        <Obstacles environment={environment} />
        <RobotMesh telemetry={telemetry} />
        <LidarBeams telemetry={telemetry} />
        <UltrasonicCone telemetry={telemetry} />

        <OrbitControls
          enablePan
          maxPolarAngle={Math.PI / 2.2}
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
