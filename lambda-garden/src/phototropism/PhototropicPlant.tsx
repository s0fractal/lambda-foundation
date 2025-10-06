/**
 * λ_MIRROR - Phototropic Plant Component
 * Grows towards light captured from webcam
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WebcamCapture, λ_PHOTOTROPISM } from './webcam';

interface PhotoTropicPlantProps {
  position: [number, number, number];
  lambdaTerm: string;
  webcam: WebcamCapture;
  onGrowth?: (height: number) => void;
}

export function PhotoTropicPlant({ position, webcam, onGrowth }: PhotoTropicPlantProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Initialize phototropism system
  const phototropism = useMemo(() => λ_PHOTOTROPISM(webcam), [webcam]);
  
  // Growth state
  const growthState = useRef({
    segments: [{
      position: new THREE.Vector3(...position),
      direction: new THREE.Vector3(0, 1, 0),
      thickness: 0.1,
      age: 0
    }],
    height: 0,
    pulsePhase: 0
  });
  
  // Generate plant geometry
  const updateGeometry = () => {
    const { segments } = growthState.current;
    const points: number[] = [];
    const colors: number[] = [];
    
    segments.forEach((seg, i) => {
      const t = i / segments.length;
      
      // Add point
      points.push(seg.position.x, seg.position.y, seg.position.z);
      
      // Color based on age and phototropic response
      const green = 0.3 + t * 0.4;
      const gold = Math.sin(seg.age * 432 * 0.01) * 0.2; // 432Hz pulse
      
      colors.push(
        gold * 0.8,           // R
        green + gold * 0.2,   // G
        gold * 0.1            // B
      );
    });
    
    if (geometryRef.current && points.length >= 3) {
      geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      geometryRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  };
  
  // Growth simulation
  useFrame((_, delta) => {
    const state = growthState.current;
    state.pulsePhase += delta * 432 * 2 * Math.PI; // 432Hz
    
    // Update phototropism
    phototropism.update();
    
    // Grow only during pulse peaks
    if (Math.sin(state.pulsePhase) > 0.98) {
      const lastSeg = state.segments[state.segments.length - 1];
      
      // Get phototropic influence
      const worldPos = {
        x: lastSeg.position.x,
        z: lastSeg.position.z
      };
      
      // Apply phototropism to growth direction
      const newDirection = phototropism.modifyGrowth(worldPos, {
        x: lastSeg.direction.x,
        y: lastSeg.direction.y,
        z: lastSeg.direction.z
      });
      
      // Normalize and apply some randomness
      const dir = new THREE.Vector3(newDirection.x, newDirection.y, newDirection.z);
      dir.normalize();
      dir.y = Math.max(0.5, dir.y); // Ensure upward growth
      
      // Add slight spiral
      const spiral = state.segments.length * 0.1;
      dir.x += Math.sin(spiral) * 0.05;
      dir.z += Math.cos(spiral) * 0.05;
      dir.normalize();
      
      // Create new segment
      const newPos = lastSeg.position.clone();
      newPos.add(dir.clone().multiplyScalar(0.05)); // Growth increment
      
      state.segments.push({
        position: newPos,
        direction: dir,
        thickness: Math.max(0.02, lastSeg.thickness * 0.98), // Taper
        age: 0
      });
      
      // Limit segments
      if (state.segments.length > 100) {
        state.segments.shift();
      }
      
      state.height = newPos.y - position[1];
      
      // Update geometry
      updateGeometry();
      
      // Notify parent
      onGrowth?.(state.height);
    }
    
    // Age all segments
    state.segments.forEach(seg => {
      seg.age += delta;
    });
  });
  
  // Line material with vertex colors
  const material = useMemo(() => new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 2,
    transparent: true,
    opacity: 0.9
  }), []);
  
  return (
    <group position={position}>
      <line>
        <bufferGeometry ref={geometryRef} />
        <primitive object={material} />
      </line>
      
      {/* Glow at tip */}
      <mesh position={[0, growthState.current.height, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffff00" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}