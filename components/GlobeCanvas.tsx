'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Convert Lat/Lng coordinates to 3D Vector3 points on sphere
function latLngToVector3(lat: number, lng: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Tech Location Hotspot Marker
function ChallengePin({
  lat,
  lng,
  title,
  mode,
  onSelect,
}: {
  lat: number;
  lng: number;
  title: string;
  mode: string;
  onSelect: (m: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const position = latLngToVector3(lat, lng, 2.05);

  return (
    <group position={position}>
      <mesh onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={() => onSelect(mode)}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={hovered ? '#f59e0b' : '#38bdf8'} />
      </mesh>

      <Html distanceFactor={10} position={[0, 0.1, 0]}>
        <button
          onClick={() => onSelect(mode)}
          className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition whitespace-nowrap backdrop-blur-md shadow-2xl flex items-center gap-2 border ${
            hovered
              ? 'bg-amber-400 text-slate-950 border-amber-300 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-slate-950/90 text-cyan-300 border-cyan-500/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          {title}
        </button>
      </Html>
    </group>
  );
}

function EarthMesh({ onSelectMode }: { onSelectMode: (m: string) => void }) {
  const earthRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Core Dark Tech Globe */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial color="#020617" roughness={0.6} metalness={0.2} />
      </Sphere>

      {/* Cyber Grid Wireframe */}
      <Sphere args={[2.01, 36, 36]}>
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} />
      </Sphere>

      {/* Outer Glow Halo */}
      <Sphere args={[2.18, 32, 32]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>

      {/* Challenge Location Nodes */}
      <ChallengePin lat={40.7128} lng={-74.006} title="New York Hub" mode="capital" onSelect={onSelectMode} />
      <ChallengePin lat={48.8566} lng={2.3522} title="Paris Telemetry" mode="videoguessr" onSelect={onSelectMode} />
      <ChallengePin lat={35.6762} lng={139.6503} title="Tokyo Node" mode="trivia" onSelect={onSelectMode} />
      <ChallengePin lat={-22.9068} lng={-43.1729} title="Rio Championship" mode="terrathon_official" onSelect={onSelectMode} />
    </group>
  );
}

export default function GlobeCanvas({ onSelectMode }: { onSelectMode: (mode: string) => void }) {
  return (
    <div className="w-full h-[520px] relative bg-slate-950/90 rounded-3xl overflow-hidden border border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={2} />
        <EarthMesh onSelectMode={onSelectMode} />
        <OrbitControls enablePan={false} minDistance={3.2} maxDistance={7} rotateSpeed={0.5} />
      </Canvas>

      {/* HUD Radar Overlay */}
      <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl font-mono text-[10px] text-cyan-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        RADAR PROJECTION ACTIVE
      </div>

      <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-400 font-mono">
        🖱️ Rotate: Drag • Zoom: Scroll • Nodes: Click Hotspots
      </div>
    </div>
  );
}