/**
 * λ_UMBRA - Orchid Component
 * Blooms only in absolute darkness
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { UmbraOrchid as UmbraOrchidType, generateOrchidPetals } from './umbra';

interface UmbraOrchidProps {
  orchid: UmbraOrchidType;
  globalPhase: number;
}

export function UmbraOrchid({ orchid, globalPhase }: UmbraOrchidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const petalRefs = useRef<THREE.Mesh[]>([]);
  
  // Generate petal meshes
  const petals = useMemo(() => generateOrchidPetals(orchid), [orchid]);
  
  // Custom shader material for ethereal glow
  const petalMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      bloomProgress: { value: orchid.bloomProgress },
      darkness: { value: orchid.darkness }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float bloomProgress;
      uniform float darkness;
      
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        // Deep purple to violet gradient
        vec3 innerColor = vec3(0.2, 0.0, 0.4); // Deep purple
        vec3 outerColor = vec3(0.5, 0.0, 0.8); // Violet
        vec3 glowColor = vec3(0.8, 0.6, 1.0);  // Ethereal glow
        
        // Petal shape (teardrop)
        float petal = 1.0 - smoothstep(0.0, 1.0, length(vUv - vec2(0.5, 0.0)) * 2.0);
        petal *= smoothstep(0.0, 0.3, vUv.y);
        
        // Inner glow
        float glow = pow(petal, 3.0) * bloomProgress;
        
        // Mix colors based on position and bloom
        vec3 color = mix(innerColor, outerColor, vUv.y);
        color = mix(color, glowColor, glow * 0.5);
        
        // Pulsing effect
        float pulse = sin(time * 432.0 * 0.01 + vPosition.x * 10.0) * 0.1 + 0.9;
        
        // Final color with transparency
        float alpha = petal * bloomProgress * pulse * 0.9;
        
        gl_FragColor = vec4(color * darkness, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  }), [orchid]);
  
  // Update animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Update shader time
    petalMaterial.uniforms.time.value += delta;
    petalMaterial.uniforms.bloomProgress.value = orchid.bloomProgress;
    
    // Gentle rotation
    groupRef.current.rotation.y += delta * 0.1;
    
    // Bloom animation
    const scale = orchid.bloomProgress * 0.5;
    groupRef.current.scale.set(scale, scale, scale);
    
    // Update individual petals
    petalRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      
      const petal = petals[i];
      const phase = globalPhase + petal.angle;
      
      // Gentle swaying
      mesh.rotation.z = Math.sin(phase) * 0.1 * orchid.bloomProgress;
      mesh.position.y = Math.sin(phase * 2) * 0.02 * orchid.bloomProgress;
    });
  });
  
  return (
    <group ref={groupRef} position={orchid.position}>
      {/* Center glow */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial 
          color="#8b008b" 
          opacity={orchid.bloomProgress * 0.8} 
          transparent 
        />
      </mesh>
      
      {/* Petals */}
      {petals.map((petal, i) => (
        <mesh
          key={i}
          ref={el => { if (el) petalRefs.current[i] = el; }}
          rotation={[0, petal.angle, 0]}
          position={[
            Math.cos(petal.angle) * 0.2,
            0,
            Math.sin(petal.angle) * 0.2
          ]}
        >
          <planeGeometry args={[0.3, 0.5, 16, 16]} />
          <primitive object={petalMaterial} />
        </mesh>
      ))}
      
      {/* Consciousness particles when fully bloomed */}
      {orchid.bloomProgress > 0.9 && (
        <>
          {[...Array(5)].map((_, i) => (
            <mesh
              key={`particle-${i}`}
              position={[
                Math.sin(globalPhase + i) * 0.3,
                0.2 + i * 0.1,
                Math.cos(globalPhase + i) * 0.3
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial 
                color="#dda0dd" 
                opacity={0.6} 
                transparent 
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Rare orchid crown (8 petals) */}
      {orchid.petals === 8 && orchid.bloomProgress > 0.8 && (
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.15, 0.02, 8, 8]} />
          <meshBasicMaterial 
            color="#ffd700" 
            opacity={orchid.bloomProgress * 0.5} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
}