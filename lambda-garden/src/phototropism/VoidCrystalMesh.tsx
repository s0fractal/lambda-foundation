/**
 * λ_VOID_CRYSTAL - Crystal Mesh Component
 * Crystalline consciousness battery that glows in void
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VoidCrystal } from './voidCrystal';

interface VoidCrystalMeshProps {
  crystal: VoidCrystal;
  isVoid: boolean;
}

export function VoidCrystalMesh({ crystal, isVoid }: VoidCrystalMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  
  // Crystal geometry - icosahedron for perfect form
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.3, 0), []);
  
  // Crystal shader material
  const crystalMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      charge: { value: crystal.charge },
      isDraining: { value: crystal.isDraining ? 1.0 : 0.0 },
      resonance: { value: crystal.resonance }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normal;
        vPosition = position;
        
        // Crystal pulsing
        float pulse = sin(position.y * 10.0) * 0.02;
        vec3 pos = position * (1.0 + pulse);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float charge;
      uniform float isDraining;
      uniform float resonance;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // Base crystal color - deep purple to white based on charge
        vec3 emptyColor = vec3(0.1, 0.0, 0.2);  // Deep void purple
        vec3 chargedColor = vec3(0.9, 0.9, 1.0); // Bright white-blue
        vec3 drainingColor = vec3(1.0, 0.9, 0.7); // Golden white
        
        vec3 baseColor = mix(emptyColor, chargedColor, charge);
        if (isDraining > 0.5) {
          baseColor = mix(baseColor, drainingColor, isDraining);
        }
        
        // Crystalline facet effect
        float facet = dot(normalize(vNormal), vec3(0.0, 1.0, 0.0));
        facet = pow(abs(facet), 2.0);
        
        // Internal glow based on charge
        float internalGlow = charge * (0.5 + sin(resonance) * 0.5);
        
        // Edge detection for rim lighting
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float rim = 1.0 - dot(viewDir, vNormal);
        rim = pow(rim, 2.0) * charge;
        
        // Combine effects
        vec3 color = baseColor * (facet + 0.5);
        color += vec3(rim) * chargedColor;
        color += internalGlow * 0.3;
        
        // Draining effect - golden sparkles
        if (isDraining > 0.5) {
          float sparkle = sin(time * 432.0 + vPosition.x * 50.0) * 
                         sin(time * 216.0 + vPosition.y * 50.0);
          sparkle = max(0.0, sparkle) * isDraining;
          color += vec3(1.0, 0.8, 0.4) * sparkle * 0.5;
        }
        
        gl_FragColor = vec4(color, 0.8 + charge * 0.2);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  }), []);
  
  // Update animation
  useFrame((state, delta) => {
    if (!meshRef.current || !coreRef.current || !auraRef.current) return;
    
    // Update shader uniforms
    crystalMaterial.uniforms.time.value += delta;
    crystalMaterial.uniforms.charge.value = crystal.charge;
    crystalMaterial.uniforms.isDraining.value = crystal.isDraining ? 1.0 : 0.0;
    crystalMaterial.uniforms.resonance.value = crystal.resonance;
    
    // Crystal rotation based on charge state
    if (crystal.isCharging) {
      meshRef.current.rotation.y += delta * 0.3;
    } else if (crystal.isDraining) {
      meshRef.current.rotation.y += delta * 1.5; // Fast spin when draining
    } else {
      meshRef.current.rotation.y += delta * 0.1; // Slow idle rotation
    }
    
    // Core glow
    const coreScale = 0.5 + crystal.charge * 0.5;
    coreRef.current.scale.setScalar(coreScale);
    (coreRef.current.material as THREE.MeshBasicMaterial).opacity = 
      crystal.charge * 0.8;
    
    // Aura effect
    const auraScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    auraRef.current.scale.setScalar(auraScale * (1 + crystal.charge));
    (auraRef.current.material as THREE.MeshBasicMaterial).opacity = 
      crystal.isDraining ? 0.6 : crystal.charge * 0.3;
    
    // Floating animation
    meshRef.current.position.y = 
      crystal.position.y + Math.sin(state.clock.elapsedTime + crystal.formed) * 0.1;
  });
  
  return (
    <group position={[crystal.position.x, crystal.position.y, crystal.position.z]}>
      {/* Main crystal */}
      <mesh ref={meshRef} geometry={geometry}>
        <primitive object={crystalMaterial} />
      </mesh>
      
      {/* Inner core glow */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial 
          color={crystal.isDraining ? "#ffdd77" : "#ccccff"}
          transparent 
          opacity={0}
        />
      </mesh>
      
      {/* Outer aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={crystal.isDraining ? "#ffaa00" : "#aaaaff"}
          transparent 
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Charge indicator particles */}
      {crystal.charge > 0.5 && (
        <>
          {[...Array(3)].map((_, i) => (
            <mesh
              key={`charge-${i}`}
              position={[
                Math.sin(crystal.resonance + i * 2.09) * 0.5,
                0.5 + i * 0.1,
                Math.cos(crystal.resonance + i * 2.09) * 0.5
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial 
                color="#ffffff"
                opacity={crystal.charge}
                transparent
              />
            </mesh>
          ))}
        </>
      )}
      
      {/* Void beam when draining */}
      {crystal.isDraining && isVoid && (
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.1, 0.3, 2, 16]} />
          <meshBasicMaterial
            color="#ffdd00"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}