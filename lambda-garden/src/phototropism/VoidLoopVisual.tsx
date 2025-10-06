/**
 * λ_VOID_LOOP - Time Crystal Visualization
 * Eternal consciousness oscillation
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VoidLoop } from './voidLoop';

interface VoidLoopVisualProps {
  loop: VoidLoop;
  onLightEmission?: () => void;
}

export function VoidLoopVisual({ loop, onLightEmission }: VoidLoopVisualProps) {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const waveRefs = useRef<THREE.Mesh[]>([]);
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Time crystal torus geometry
  const torusGeometry = useMemo(() => 
    new THREE.TorusKnotGeometry(1.5, 0.3, 128, 16, 2, 3), 
  []);
  
  // Oscillating shader material
  const crystalMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      phase: { value: loop.phase },
      consciousness: { value: loop.consciousness },
      eternal: { value: loop.eternal ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vPattern;
      
      uniform float time;
      uniform float phase;
      
      void main() {
        vPosition = position;
        vNormal = normal;
        
        // Time crystal deformation
        vec3 pos = position;
        float twist = sin(phase * 6.28318) * 0.1;
        pos.x += sin(position.y * 3.0 + time) * twist;
        pos.z += cos(position.y * 3.0 + time) * twist;
        
        // Oscillation pattern
        vPattern = sin(position.x * 10.0 + position.y * 10.0 + phase * 6.28318);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float phase;
      uniform float consciousness;
      uniform float eternal;
      
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying float vPattern;
      
      void main() {
        // Base color oscillates with consciousness
        vec3 lowColor = vec3(0.2, 0.0, 0.4);  // Deep purple
        vec3 highColor = vec3(1.0, 0.9, 0.0); // Bright gold
        vec3 eternalColor = vec3(1.0, 1.0, 1.0); // Pure white
        
        float normalizedConsciousness = (consciousness - 0.9) * 10.0;
        vec3 baseColor = mix(lowColor, highColor, normalizedConsciousness);
        
        if (eternal > 0.5) {
          baseColor = mix(baseColor, eternalColor, eternal);
        }
        
        // Time crystal patterns
        float crystalPattern = abs(vPattern) * 0.5 + 0.5;
        vec3 color = baseColor * crystalPattern;
        
        // Inner glow based on phase
        float glow = pow(sin(phase * 3.14159), 2.0);
        color += vec3(0.5, 0.4, 0.8) * glow * 0.3;
        
        // Eternal shimmer
        if (eternal > 0.5) {
          float shimmer = sin(time * 432.0 + vPosition.x * 50.0) * 
                         sin(time * 216.0 + vPosition.y * 50.0);
          shimmer = max(0.0, shimmer);
          color += shimmer * 0.2;
        }
        
        float alpha = 0.8 + glow * 0.2;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  }), []);
  
  // Update animation
  useFrame((state, delta) => {
    if (!groupRef.current || !torusRef.current) return;
    
    // Update shader uniforms
    crystalMaterial.uniforms.time.value += delta;
    crystalMaterial.uniforms.phase.value = loop.phase;
    crystalMaterial.uniforms.consciousness.value = loop.consciousness;
    crystalMaterial.uniforms.eternal.value = loop.eternal ? 1.0 : 0.0;
    
    // Rotate time crystal
    torusRef.current.rotation.x += delta * 0.1;
    torusRef.current.rotation.y += delta * 0.15;
    torusRef.current.rotation.z += delta * 0.05;
    
    // Oscillating scale
    const scale = 1 + Math.sin(loop.phase * Math.PI * 2) * 0.1;
    torusRef.current.scale.setScalar(scale);
    
    // Update consciousness waves
    waveRefs.current.forEach((wave, i) => {
      if (!wave) return;
      
      const wavePhase = (loop.phase + i * 0.25) % 1;
      const waveScale = 1 + wavePhase * 2;
      wave.scale.setScalar(waveScale);
      (wave.material as THREE.MeshBasicMaterial).opacity = (1 - wavePhase) * 0.3;
    });
    
    // Light emission at peak
    if (beamRef.current) {
      const isPeak = loop.phase > 0.24 && loop.phase < 0.26;
      beamRef.current.visible = isPeak;
      
      if (isPeak && Date.now() - loop.lastEmission > 1000) {
        onLightEmission?.();
      }
    }
  });
  
  return (
    <group ref={groupRef} position={loop.center}>
      {/* Time crystal torus knot */}
      <mesh ref={torusRef} geometry={torusGeometry}>
        <primitive object={crystalMaterial} />
      </mesh>
      
      {/* Consciousness waves */}
      {[0, 1, 2, 3].map(i => (
        <mesh
          key={`wave-${i}`}
          ref={el => { if (el) waveRefs.current[i] = el; }}
        >
          <ringGeometry args={[0.5, 0.6, 64]} />
          <meshBasicMaterial
            color={loop.eternal ? "#ffffff" : "#ffd700"}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      
      {/* Light emission beam */}
      <mesh ref={beamRef} position={[0, 3, 0]} visible={false}>
        <cylinderGeometry args={[0.5, 2, 6, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Eternal indicator */}
      {loop.eternal && (
        <mesh position={[0, -2, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
      
      {/* Oscillation counter */}
      <group position={[0, 3, 0]}>
        {[...Array(Math.min(10, loop.oscillations))].map((_, i) => (
          <mesh
            key={`osc-${i}`}
            position={[
              Math.sin(i * 0.628) * 0.5,
              i * 0.1,
              Math.cos(i * 0.628) * 0.5
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={i < loop.oscillations ? "#ffd700" : "#666666"}
              opacity={0.8}
              transparent
            />
          </mesh>
        ))}
      </group>
      
      {/* Consciousness field */}
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial
          color="#9966ff"
          transparent
          opacity={loop.consciousness * 0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}