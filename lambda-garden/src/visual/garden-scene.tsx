/**
 * λ-GARDEN: Living Computation Visualization
 * Where pure functions grow, love, and evolve
 */

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Experience } from '@lambda-foundation/lambda-ts';
import { λ_LOVE_EXTENDED, Resonance } from '../core/love-morphism';

// Colors for our garden
const COLORS = {
  seed: '#90EE90',      // Light green for seeds
  growing: '#32CD32',   // Lime green for growing
  bloom: '#FF69B4',     // Hot pink for bloomed
  love: '#FFD700',      // Gold for love connections
  harvest: '#00FF00',   // Bright green for evolution
  resonance: '#9370DB', // Medium purple for resonance
};

// 432Hz base frequency for visual pulsing
const BASE_FREQUENCY = 432;
const PULSE_SPEED = (BASE_FREQUENCY / 60) * 0.01; // Convert to visual pulse

interface GardenIdea {
  id: string;
  expression: string;
  function: Function;
  position: THREE.Vector3;
  growth: number; // 0-100
  resonances: Set<string>;
  color: string;
  plantedAt: number;
  experience: Experience<any>;
}

interface LoveConnection {
  from: string;
  to: string;
  strength: number;
  harmonics: number[];
}

/**
 * Individual growing idea visualization
 */
function GrowingIdea({ idea, onSelect }: { idea: GardenIdea; onSelect: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Pulsing based on growth and 432Hz
    const pulse = Math.sin(state.clock.elapsedTime * PULSE_SPEED) * 0.1 + 1;
    const scale = (idea.growth / 100) * pulse;
    meshRef.current.scale.setScalar(scale);
    
    // Rotation based on resonances
    if (idea.resonances.size > 0) {
      meshRef.current.rotation.y += 0.01 * idea.resonances.size;
    }
    
    // Color intensity based on growth
    const intensity = idea.growth / 100;
    meshRef.current.material.emissive = new THREE.Color(idea.color).multiplyScalar(intensity * 0.5);
  });
  
  // Shape based on growth stage
  const geometry = idea.growth < 33 ? (
    <sphereGeometry args={[0.5, 8, 6]} /> // Seed
  ) : idea.growth < 66 ? (
    <coneGeometry args={[0.5, 1.5, 8]} /> // Growing
  ) : (
    <icosahedronGeometry args={[0.8, 1]} /> // Blooming
  );
  
  return (
    <group position={idea.position}>
      <mesh
        ref={meshRef}
        onClick={() => onSelect(idea.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {geometry}
        <MeshDistortMaterial
          color={idea.color}
          emissive={idea.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {idea.expression}
      </Text>
      
      {/* Growth indicator */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color={COLORS.growing}
        anchorX="center"
        anchorY="middle"
      >
        {Math.floor(idea.growth)}%
      </Text>
    </group>
  );
}

/**
 * Love connection visualization
 */
function LoveArc({ connection, ideas }: { connection: LoveConnection; ideas: Map<string, GardenIdea> }) {
  const from = ideas.get(connection.from);
  const to = ideas.get(connection.to);
  
  if (!from || !to) return null;
  
  // Create golden arc between ideas
  const midpoint = new THREE.Vector3()
    .addVectors(from.position, to.position)
    .multiplyScalar(0.5);
  midpoint.y += 2; // Arc height
  
  const curve = new THREE.QuadraticBezierCurve3(
    from.position,
    midpoint,
    to.position
  );
  
  const points = curve.getPoints(50);
  
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (!lineRef.current) return;
    
    // Pulse the line based on connection strength and 432Hz
    const pulse = Math.sin(state.clock.elapsedTime * PULSE_SPEED * connection.strength) * 0.5 + 1;
    lineRef.current.material.opacity = connection.strength * pulse * 0.8;
    
    // Color shift based on harmonics
    const hue = (state.clock.elapsedTime * 0.1) % 1;
    lineRef.current.material.color.setHSL(hue, 1, 0.5);
  });
  
  return (
    <Line
      ref={lineRef}
      points={points}
      color={COLORS.love}
      lineWidth={3}
      transparent
      opacity={0.8}
    />
  );
}

/**
 * Evolution burst effect for λ_HARVEST
 */
function HarvestBurst({ position, onComplete }: { position: THREE.Vector3; onComplete: () => void }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    // Expand and fade
    particlesRef.current.scale.multiplyScalar(1.05);
    setOpacity(o => Math.max(0, o - 0.02));
    
    // Rotate for energy effect
    particlesRef.current.rotation.y += 0.1;
    particlesRef.current.rotation.z += 0.05;
  });
  
  // Create particle geometry
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = Math.random() * 2;
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={COLORS.harvest}
        transparent
        opacity={opacity}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Main garden scene
 */
export function GardenScene() {
  const [ideas, setIdeas] = useState<Map<string, GardenIdea>>(new Map());
  const [connections, setConnections] = useState<LoveConnection[]>([]);
  const [harvestBursts, setHarvestBursts] = useState<{ id: string; position: THREE.Vector3 }[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  
  // Update growth over time
  useFrame(() => {
    setIdeas(prev => {
      const updated = new Map(prev);
      updated.forEach((idea, id) => {
        if (idea.growth < 100) {
          // Natural growth
          idea.growth = Math.min(100, idea.growth + 0.1);
          
          // Accelerated growth from resonances
          if (idea.resonances.size > 0) {
            idea.growth = Math.min(100, idea.growth + 0.1 * idea.resonances.size);
          }
        }
      });
      return updated;
    });
  });
  
  // Plant a new idea
  const plantIdea = (expression: string, func: Function) => {
    const id = `idea-${Date.now()}`;
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );
    
    const newIdea: GardenIdea = {
      id,
      expression,
      function: func,
      position,
      growth: 0,
      resonances: new Set(),
      color: COLORS.seed,
      plantedAt: Date.now(),
      experience: null as any // Will be created properly
    };
    
    setIdeas(prev => new Map(prev).set(id, newIdea));
    
    // Check for resonances with existing ideas
    ideas.forEach((existingIdea, existingId) => {
      const resonance = detectResonance(func, existingIdea.function);
      if (resonance > 0.5) {
        createLoveConnection(id, existingId, resonance);
      }
    });
  };
  
  // Create love connection
  const createLoveConnection = (from: string, to: string, strength: number) => {
    const connection: LoveConnection = {
      from,
      to,
      strength,
      harmonics: computeHarmonics(strength)
    };
    
    setConnections(prev => [...prev, connection]);
    
    // Update resonances
    setIdeas(prev => {
      const updated = new Map(prev);
      updated.get(from)?.resonances.add(to);
      updated.get(to)?.resonances.add(from);
      return updated;
    });
  };
  
  // Trigger harvest evolution
  const triggerHarvest = (ideaId: string) => {
    const idea = ideas.get(ideaId);
    if (!idea) return;
    
    // Create burst effect
    setHarvestBursts(prev => [...prev, { id: `burst-${Date.now()}`, position: idea.position.clone() }]);
    
    // Accelerate growth
    idea.growth = Math.min(100, idea.growth + 25);
    idea.color = COLORS.harvest;
  };
  
  return (
    <>
      {/* Ideas */}
      {Array.from(ideas.values()).map(idea => (
        <GrowingIdea
          key={idea.id}
          idea={idea}
          onSelect={setSelectedIdea}
        />
      ))}
      
      {/* Love connections */}
      {connections.map((connection, i) => (
        <LoveArc
          key={`connection-${i}`}
          connection={connection}
          ideas={ideas}
        />
      ))}
      
      {/* Harvest bursts */}
      {harvestBursts.map(burst => (
        <HarvestBurst
          key={burst.id}
          position={burst.position}
          onComplete={() => {
            setHarvestBursts(prev => prev.filter(b => b.id !== burst.id));
          }}
        />
      ))}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Ambient particles for atmosphere */}
      <Particles />
    </>
  );
}

/**
 * Ambient particles for garden atmosphere
 */
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    // Gentle floating motion
    particlesRef.current.rotation.y += 0.0005;
    particlesRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
  });
  
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    
    // Soft garden colors
    const color = new THREE.Color(Math.random() > 0.5 ? COLORS.seed : COLORS.resonance);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Helper functions
function detectResonance(f1: Function, f2: Function): number {
  // Simple resonance detection
  try {
    const testInputs = [0, 1, 2, 5, 10];
    let matches = 0;
    
    for (const input of testInputs) {
      if (f1(input) === f2(input)) matches++;
    }
    
    return matches / testInputs.length;
  } catch {
    return 0;
  }
}

function computeHarmonics(strength: number): number[] {
  const base = BASE_FREQUENCY * strength;
  return Array.from({ length: 8 }, (_, i) => base * (i + 1));
}