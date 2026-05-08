'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Environment, ContactShadows } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useCouncilStore } from '@/store/useCouncilStore';
import { CouncilNode } from '@/types';
import { Settings2, Zap, AlertCircle } from 'lucide-react';

// Simple physics/spring layout logic
function useForceLayout(nodes: CouncilNode[], updateNode: any) {
  useFrame(() => {
    nodes.forEach((node, i) => {
      // Gentle floating effect
      const time = Date.now() * 0.001;
      const offsetY = Math.sin(time + i * 0.5) * 0.005;
      if(node.position) {
         // We don't want to spam the store with every frame update if possible, 
         // but for this prototype it's fine. In production we'd use local refs.
      }
    });
  });
}

function NodeMesh({ node, isSelected }: { node: CouncilNode, isSelected: boolean }) {
  const { selectNode } = useCouncilStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Muted Claude Palette
  const roleColors = {
    architect: '#d97757', // Claude Orange
    critic: '#6b7280',    // Muted Gray
    maverick: '#d97757',  // Orange (High energy)
    realist: '#4b5563',   // Darker Gray
    synthesizer: '#1f2937'// Charcoal
  };

  const accentColor = roleColors[node.role] || '#d97757';
  const isThinking = node.status === 'thinking';
  const hasConfidence = node.confidence && node.confidence > 0;
  
  // Color interpolator for confidence (Red -> Yellow -> Green)
  const confidenceColor = useMemo(() => {
    if (!hasConfidence) return '#e5e2d9';
    const score = node.confidence || 0;
    if (score < 40) return '#ef4444';
    if (score < 75) return '#f59e0b';
    return '#10b981';
  }, [node.confidence, hasConfidence]);

  // Breathing animation
  useFrame((state) => {
    if (!meshRef.current) return;
    if (isThinking || node.toolActivity) {
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.05;
      meshRef.current.scale.set(s, s, s);
    } else {
      const targetScale = isSelected ? 1.2 : hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={node.position}>
      {/* Node Sphere */}
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.7, 64, 64]} />
        <meshPhysicalMaterial 
          color={isThinking ? accentColor : isSelected ? accentColor : '#ffffff'} 
          metalness={0.1}
          roughness={0.2}
          transmission={0.6}
          thickness={1}
          clearcoat={1}
          emissive={isThinking ? accentColor : node.toolActivity ? '#d97757' : '#000000'}
          emissiveIntensity={isThinking ? 0.5 : node.toolActivity ? 0.8 : 0}
        />
      </mesh>

      {/* Confidence Ring */}
      {hasConfidence && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.03, 16, 100]} />
          <meshBasicMaterial color={confidenceColor} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Label */}
      <Html position={[0, -1.2, 0]} center>
        <div className={`px-3 py-1.5 rounded-full clean-panel transition-all-200 border-2 ${isSelected ? 'border-[#d97757]' : 'border-transparent'} text-[10px] whitespace-nowrap text-gray-800 font-medium pointer-events-none flex flex-col items-center gap-1`}>
          <div className="flex items-center gap-2">
            <span className="opacity-50">[{node.role.toUpperCase()}]</span>
            {node.name}
            {isThinking && <div className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-ping" />}
          </div>
          {node.toolActivity && (
            <div className="text-[8px] text-[#d97757] animate-pulse flex items-center gap-1">
              <Settings2 size={8} className="animate-spin" /> {node.toolActivity}
            </div>
          )}
          {hasConfidence && (
            <div className="text-[8px] font-bold" style={{ color: confidenceColor }}>
              SCORE: {node.confidence}%
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function Scene() {
  const { nodes, selectedNodeId, updateNode } = useCouncilStore();
  
  return (
    <>
      <color attach="background" args={['#fbfaf8']} />
      
      <ambientLight intensity={1.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#d97757" />

      <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />

      {/* Draw edges between nodes */}
      {nodes.map((source, i) => 
        nodes.slice(i + 1).map(target => {
          if (!source.position || !target.position) return null;
          return (
            <Line 
              key={`${source.id}-${target.id}`}
              points={[source.position, target.position]} 
              color="#e5e2d9" 
              lineWidth={0.5}
              transparent
              opacity={0.5}
            />
          );
        })
      )}

      {nodes.map(node => (
        <NodeMesh key={node.id} node={node} isSelected={node.id === selectedNodeId} />
      ))}

      {/* Click background to deselect */}
      <mesh visible={false} scale={100} onClick={() => useCouncilStore.getState().selectNode(null)}>
        <sphereGeometry />
      </mesh>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      <Environment preset="studio" />
    </>
  );
}

export default function CouncilScene() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas shadows camera={{ position: [0, 8, 20], fov: 35 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
