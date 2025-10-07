/**
 * λ_SHADOW - Shadow-Seeking Plant Component
 * Grows away from light into darkness
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WebcamCapture } from './webcam';
import { λ_SHADOW } from './shadow';

interface ShadowPlantProps {
  position: [number, number, number];
  lambdaTerm: string;
  webcam: WebcamCapture;
  onGrowth?: (height: number, inDarkness: boolean) => void;
}

export function ShadowPlant({ position, lambdaTerm, webcam, onGrowth }: ShadowPlantProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Initialize shadow system
  const shadow = useMemo(() => λ_SHADOW(webcam), [webcam]);
  
  // Growth state with shadow properties
  const growthState = useRef({
    segments: [{
      position: new THREE.Vector3(...position),
      direction: new THREE.Vector3(0, 1, 0),
      thickness: 0.08,
      age: 0,
      darkness: 0
    }],
    height: 0,
    pulsePhase: 0,
    totalDarkness: 0
  });
  
  // Update geometry with shadow aesthetics
  const updateGeometry = () => {
    const { segments } = growthState.current;
    const points: number[] = [];
    const colors: number[] = [];
    
    segments.forEach((seg, i) => {
      const t = i / segments.length;
      
      // Add point
      points.push(seg.position.x, seg.position.y, seg.position.z);
      
      // Shadow colors - darker segments are more purple/blue
      const darkness = seg.darkness;
      const pulse = Math.sin(seg.age * 432 * 0.01) * 0.1;
      
      colors.push(
        0.1 + darkness * 0.3 + pulse,      // R - slight purple in darkness
        0.05 + (1 - darkness) * 0.2,       // G - less green in shadow
        0.2 + darkness * 0.6               // B - blue in darkness
      );
    });
    
    if (geometryRef.current && points.length >= 3) {
      geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      geometryRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }
  };
  
  // Shadow growth simulation
  useFrame((_, delta) => {
    const state = growthState.current;
    state.pulsePhase += delta * 432 * 2 * Math.PI;
    
    // Update shadow system
    shadow.update();
    
    // Grow during pulse peaks
    if (Math.sin(state.pulsePhase) > 0.98) {
      const lastSeg = state.segments[state.segments.length - 1];
      
      // Get shadow influence
      const worldPos = {
        x: lastSeg.position.x,
        z: lastSeg.position.z
      };
      
      // Apply shadow tropism
      const newDirection = shadow.modifyGrowth(worldPos, {
        x: lastSeg.direction.x,
        y: lastSeg.direction.y,
        z: lastSeg.direction.z
      });
      
      // Get growth multiplier from darkness
      const growthMult = shadow.getGrowthMultiplier(worldPos);
      
      // Normalize and apply
      const dir = new THREE.Vector3(newDirection.x, newDirection.y, newDirection.z);
      dir.normalize();
      
      // Shadow plants tend to creep and spread
      const spread = state.segments.length * 0.15;
      dir.x += Math.sin(spread) * 0.1;
      dir.z += Math.cos(spread) * 0.1;
      dir.normalize();
      
      // Create new segment
      const newPos = lastSeg.position.clone();
      newPos.add(dir.clone().multiplyScalar(0.04 * growthMult)); // Growth speed
      
      // Calculate darkness at new position
      const shadowField = shadow.getShadowField();
      let darkness = 0;
      if (shadowField) {
        const camX = (newPos.x + 10) / 20;
        const camZ = (newPos.z + 10) / 20;
        const px = Math.floor(camX * 64);
        const py = Math.floor(camZ * 48);
        if (px >= 0 && px < 64 && py >= 0 && py < 48) {
          darkness = shadowField[py * 64 + px];
        }
      }
      
      state.segments.push({
        position: newPos,
        direction: dir,
        thickness: Math.max(0.02, lastSeg.thickness * 0.97),
        age: 0,
        darkness
      });
      
      // Limit segments
      if (state.segments.length > 120) {
        state.segments.shift();
      }
      
      state.height = newPos.y - position[1];
      state.totalDarkness = (state.totalDarkness * 0.95) + (darkness * 0.05);
      
      // Update geometry
      updateGeometry();
      
      // Notify parent
      onGrowth?.(state.height, state.totalDarkness > 0.5);
    }
    
    // Age segments
    state.segments.forEach(seg => {
      seg.age += delta;
    });
  });
  
  // Shadow line material
  const material = useMemo(() => new THREE.LineBasicMaterial({
    vertexColors: true,
    linewidth: 3,
    transparent: true,
    opacity: 0.85
  }), []);
  
  return (
    <group position={position}>
      <line>
        <bufferGeometry ref={geometryRef} />
        <primitive object={material} />
      </line>
      
      {/* Dark aura at tip */}
      <mesh position={[0, growthState.current.height, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial 
          color="#4b0082" 
          opacity={0.4 + growthState.current.totalDarkness * 0.3} 
          transparent 
        />
      </mesh>
      
      {/* Shadow particles */}
      {growthState.current.totalDarkness > 0.7 && (
        <mesh position={[0, growthState.current.height + 0.2, 0]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial 
            color="#000033" 
            opacity={Math.sin(growthState.current.pulsePhase * 2) * 0.5 + 0.5} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
}