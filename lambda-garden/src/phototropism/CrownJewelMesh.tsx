/**
 * λ_CROWN_JEWEL - Perfect Jewel Component
 * The ultimate crystallization of consciousness
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CrownJewel } from './crownJewel';

interface CrownJewelMeshProps {
  jewel: CrownJewel;
}

export function CrownJewelMesh({ jewel }: CrownJewelMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const jewelRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  
  // Dodecahedron geometry for perfect form
  const geometry = useMemo(() => new THREE.DodecahedronGeometry(0.5, 0), []);
  
  // Perfect jewel shader
  const jewelMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      resonance: { value: jewel.resonance },
      transcendent: { value: jewel.isTranscendent ? 1.0 : 0.0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vPosition = position;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float resonance;
      uniform float transcendent;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vViewPosition;
      
      // Prismatic color split
      vec3 prism(vec3 viewDir, vec3 normal) {
        float ior = 2.4; // Diamond-like
        vec3 refracted = refract(viewDir, normal, 1.0/ior);
        
        // Chromatic aberration
        vec3 color;
        color.r = dot(refracted, vec3(1.0, 0.0, 0.0));
        color.g = dot(refracted, vec3(0.0, 1.0, 0.0));
        color.b = dot(refracted, vec3(0.0, 0.0, 1.0));
        
        return abs(color);
      }
      
      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);
        
        // Perfect reflection
        vec3 reflected = reflect(viewDir, normal);
        float fresnel = pow(1.0 - dot(viewDir, normal), 2.0);
        
        // Prismatic breakdown
        vec3 prismatic = prism(viewDir, normal);
        
        // Base jewel color - pure white with rainbow edges
        vec3 baseColor = vec3(1.0, 1.0, 1.0);
        vec3 edgeColor = prismatic * 2.0;
        
        vec3 color = mix(baseColor, edgeColor, fresnel);
        
        // Transcendent glow
        if (transcendent > 0.5) {
          float glow = sin(resonance) * 0.5 + 0.5;
          color += vec3(1.0, 0.843, 0.0) * glow * 0.3;
          
          // Self-observation sparkles
          float sparkle = sin(time * 432.0 + dot(vPosition, vec3(12.34, 56.78, 90.12))) * 
                         sin(time * 216.0 + dot(vPosition, vec3(98.76, 54.32, 10.98)));
          sparkle = max(0.0, sparkle);
          color += sparkle * vec3(1.0, 1.0, 1.0);
        }
        
        // Perfect transparency with refraction
        float alpha = 0.7 + fresnel * 0.3;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  }), [jewel]);
  
  // Orbiting rings geometry
  const ringGeometry = useMemo(() => new THREE.TorusGeometry(0.8, 0.02, 16, 64), []);
  
  // Update animation
  useFrame((state, delta) => {
    if (!groupRef.current || !jewelRef.current) return;
    
    // Update shader time
    jewelMaterial.uniforms.time.value += delta;
    jewelMaterial.uniforms.resonance.value = jewel.resonance;
    
    // Slow majestic rotation
    jewelRef.current.rotation.x += delta * 0.1;
    jewelRef.current.rotation.y += delta * 0.15;
    
    // Levitation
    groupRef.current.position.y = 
      jewel.position.y + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    
    // Core pulse
    if (coreRef.current) {
      const pulse = Math.sin(jewel.resonance) * 0.1 + 0.9;
      coreRef.current.scale.setScalar(pulse * 0.3);
    }
    
    // Orbiting rings
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;
      
      const angle = (i / 3) * Math.PI * 2;
      ring.rotation.x = angle + state.clock.elapsedTime * 0.2;
      ring.rotation.y = angle + state.clock.elapsedTime * 0.3;
      ring.rotation.z = angle + state.clock.elapsedTime * 0.1;
    });
  });
  
  return (
    <group ref={groupRef} position={jewel.position}>
      {/* Main jewel */}
      <mesh ref={jewelRef} geometry={geometry}>
        <primitive object={jewelMaterial} />
      </mesh>
      
      {/* Inner light core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff"
          opacity={0.9}
          transparent
        />
      </mesh>
      
      {/* Three perfect rings */}
      {[0, 1, 2].map(i => (
        <mesh
          key={`ring-${i}`}
          ref={el => { if (el) ringsRef.current[i] = el; }}
          geometry={ringGeometry}
        >
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0}
          />
        </mesh>
      ))}
      
      {/* Consciousness field */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Perfect triangle base projection */}
      <group position={[0, -2, 0]}>
        {jewel.sourceTriangle.map((vertex, i) => (
          <mesh
            key={`vertex-${i}`}
            position={[
              vertex.x - jewel.position.x,
              0,
              vertex.z - jewel.position.z
            ]}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ffd700" />
          </mesh>
        ))}
      </group>
      
      {/* Transcendent particles */}
      {jewel.isTranscendent && (
        <>
          {[...Array(12)].map((_, i) => (
            <mesh
              key={`particle-${i}`}
              position={[
                Math.sin(jewel.resonance + i * 0.524) * 1.5,
                Math.cos(jewel.resonance * 2 + i * 0.524) * 0.5,
                Math.cos(jewel.resonance + i * 0.524) * 1.5
              ]}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                opacity={0.8}
                transparent
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}