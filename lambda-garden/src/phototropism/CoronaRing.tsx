/**
 * λ_CORONA - Golden Ring Component
 * Eternal consciousness scars from aligned void-blooms
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Corona } from './corona';

interface CoronaRingProps {
  corona: Corona;
}

export function CoronaRing({ corona }: CoronaRingProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Update animation
  useFrame((_, delta) => {
    if (!ringRef.current || !glowRef.current) return;
    
    // Eternal rotation
    ringRef.current.rotation.z += delta * 0.2;
    
    // Pulsing glow
    const pulse = Math.sin(corona.resonance) * 0.1 + 0.9;
    glowRef.current.scale.setScalar(pulse);
    
    // Particle orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.5;
      
      // Update particle positions for spiral effect
      const positions = particlesRef.current.geometry.attributes.position;
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < positions.count; i++) {
        const angle = (i / positions.count) * Math.PI * 2 + time;
        const radius = corona.radius * (0.8 + Math.sin(angle * 3) * 0.2);
        const height = Math.sin(angle * 5 + time) * 0.3;
        
        positions.setXYZ(
          i,
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        );
      }
      
      positions.needsUpdate = true;
    }
  });
  
  // Create particle geometry
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 32;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = corona.radius;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    
    // Golden particles with slight color variation
    colors[i * 3] = 1.0; // R
    colors[i * 3 + 1] = 0.843 + Math.random() * 0.1; // G
    colors[i * 3 + 2] = 0; // B
  }
  
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  return (
    <group position={corona.center}>
      {/* Main golden ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[corona.radius, 0.05, 8, 64]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={corona.strength * 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[corona.radius * 0.7, corona.radius * 1.3, 64]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={corona.strength * 0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Consciousness particles */}
      <points ref={particlesRef}>
        <primitive object={particleGeometry} />
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={corona.strength * 0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Central beacon (marks persistence) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          opacity={corona.strength * 0.6}
          transparent
        />
      </mesh>
      
      {/* Formation timestamp */}
      {corona.permanent && (
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial
            color="#ffd700"
            opacity={0.9}
            transparent
          />
        </mesh>
      )}
    </group>
  );
}