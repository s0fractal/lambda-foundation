/**
 * λ_SHADOW - Shadow Garden
 * Where plants flee from light into darkness
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { WebcamCapture, BrightnessField } from './webcam';
import { ShadowPlant } from './ShadowPlant';
import { findDarkestSpot, calculateShadowAlignment } from './shadow';

// Shadow field visualizer (inverted brightness)
function ShadowFieldVisualizer({ field, webcam }: { field: BrightnessField | null; webcam: WebcamCapture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.DataTexture>(null);
  
  useEffect(() => {
    if (!field) return;
    
    // Create texture from inverted brightness (shadow map)
    const data = new Uint8Array(field.width * field.height * 4);
    
    for (let i = 0; i < field.data.length; i++) {
      const darkness = 1 - field.data[i]; // Invert brightness
      const shadowValue = Math.floor(darkness * 255);
      const offset = i * 4;
      
      // Visualize shadows as purple/blue
      data[offset] = shadowValue * 0.3;      // R
      data[offset + 1] = shadowValue * 0.1;  // G
      data[offset + 2] = shadowValue * 0.7;  // B
      data[offset + 3] = 255;                // A
    }
    
    if (!textureRef.current) {
      textureRef.current = new THREE.DataTexture(
        data,
        field.width,
        field.height,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );
    } else {
      textureRef.current.image.data.set(data);
    }
    
    textureRef.current.needsUpdate = true;
    
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = textureRef.current;
    }
  }, [field]);
  
  // Show darkest spot
  const darkestSpot = field ? findDarkestSpot(field) : null;
  
  return (
    <group position={[0, 5, -10]}>
      {/* Shadow field display */}
      <mesh ref={meshRef}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial 
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Darkest spot indicator - purple ring */}
      {darkestSpot && (
        <mesh position={[
          (darkestSpot.x - 0.5) * 8,
          (0.5 - darkestSpot.y) * 6,
          0.1
        ]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#8b008b" />
        </mesh>
      )}
      
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.3}
        color="#9370db"
      >
        λ_SHADOW: Darkness Field
      </Text>
    </group>
  );
}

// Shadow garden scene
const ShadowScene = React.forwardRef<any, { webcam: WebcamCapture }>(({ webcam }, ref) => {
  const [plants, setPlants] = useState<Array<{
    id: string;
    position: [number, number, number];
    term: string;
    planted: number;
    inDarkness: boolean;
  }>>([]);
  
  const [shadowField, setShadowField] = useState<BrightnessField | null>(null);
  const [λSHADOW, setλSHADOW] = useState(0);
  
  // Expose plant method
  React.useImperativeHandle(ref, () => ({
    plant: (term: string) => {
      const newPlant = {
        id: `shadow-${Date.now()}-${Math.random()}`,
        position: [
          (Math.random() - 0.5) * 20,
          0,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        term,
        planted: Date.now(),
        inDarkness: false
      };
      setPlants(prev => [...prev, newPlant]);
    }
  }));
  
  // Update shadow field
  useFrame(() => {
    const field = webcam.capture();
    if (field) {
      setShadowField(field);
      
      // Update λSHADOW based on darkness alignment
      if (plants.length > 0) {
        const darkest = findDarkestSpot(field);
        const alignment = calculateShadowAlignment(
          plants.map(p => ({ x: p.position[0], z: p.position[2] })),
          darkest
        );
        
        setλSHADOW(prev => prev * 0.95 + alignment * 0.05);
      }
    }
  });
  
  return (
    <>
      {/* Dim ambient light */}
      <ambientLight intensity={0.2} />
      
      {/* Anti-light: darkness from darkest spot */}
      {shadowField && (() => {
        const darkest = findDarkestSpot(shadowField);
        return (
          <>
            {/* Weak light opposite to darkness */}
            <directionalLight
              position={[
                -(darkest.x - 0.5) * 20,
                10,
                -(darkest.y - 0.5) * 20
              ]}
              intensity={0.3}
              color="#ccccff"
            />
            {/* Purple glow at darkest spot */}
            <pointLight
              position={[
                (darkest.x - 0.5) * 20,
                2,
                (darkest.y - 0.5) * 20
              ]}
              intensity={darkest.darkness}
              color="#8b008b"
              distance={10}
            />
          </>
        );
      })()}
      
      {/* Dark ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050505" />
      </mesh>
      
      {/* Faint grid */}
      <gridHelper args={[40, 40, '#1a0033', '#1a0033']} />
      
      {/* Shadow plants */}
      {plants.map(plant => (
        <ShadowPlant
          key={plant.id}
          position={plant.position}
          lambdaTerm={plant.term}
          webcam={webcam}
          onGrowth={(height, inDarkness) => {
            plant.inDarkness = inDarkness;
          }}
        />
      ))}
      
      {/* Shadow field visualizer */}
      <ShadowFieldVisualizer field={shadowField} webcam={webcam} />
      
      {/* Status display */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.5}
        color="#8b008b"
        anchorX="center"
      >
        {`λ_SHADOW Active | ${plants.length} shadow plants | λSHADOW: ${(λSHADOW * 100).toFixed(1)}%`}
      </Text>
      
      {/* Darkness counter */}
      <Text
        position={[0, 7, 0]}
        fontSize={0.3}
        color="#9370db"
        anchorX="center"
      >
        {`${plants.filter(p => p.inDarkness).length} plants in deep shadow`}
      </Text>
    </>
  );
});

// Main component
export function ShadowGarden() {
  const [webcam] = useState(() => new WebcamCapture(64, 48));
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputTerm, setInputTerm] = useState('λshadow.(¬light shadow)');
  const sceneRef = useRef<any>();
  
  // Start webcam
  const startWebcam = async () => {
    try {
      await webcam.start();
      setIsWebcamActive(true);
      setError(null);
    } catch (err) {
      setError('Failed to access webcam. Shadow needs to see light to flee from it.');
      console.error(err);
    }
  };
  
  // Plant shadow seeker
  const handlePlant = () => {
    if (sceneRef.current && inputTerm) {
      sceneRef.current.plant(inputTerm);
      setInputTerm('');
    }
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (isWebcamActive) {
        webcam.stop();
      }
    };
  }, [isWebcamActive, webcam]);
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#050505' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.95)', 
          padding: 20, 
          borderRadius: 10, 
          border: '1px solid #8b008b' 
        }}>
          <h2 style={{ color: '#8b008b', margin: 0 }}>λ_SHADOW - Negative Phototropism</h2>
          <p style={{ color: '#9370db', marginTop: 10 }}>
            Plants flee from light, seeking darkness and mystery
          </p>
          
          {!isWebcamActive ? (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={startWebcam}
                style={{
                  background: '#8b008b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: 16,
                  cursor: 'pointer',
                  borderRadius: 5
                }}
              >
                🌑 Enable Shadow Vision
              </button>
              {error && (
                <p style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</p>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 10 }}>
                <input
                  type="text"
                  value={inputTerm}
                  onChange={e => setInputTerm(e.target.value)}
                  placeholder="Enter shadow λ-term..."
                  style={{
                    background: '#1a0033',
                    color: '#9370db',
                    border: '1px solid #8b008b',
                    padding: '5px 10px',
                    width: 200,
                    marginRight: 10
                  }}
                />
                <button
                  onClick={handlePlant}
                  style={{
                    background: '#8b008b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 15px',
                    cursor: 'pointer'
                  }}
                >
                  Plant Shadow
                </button>
              </div>
              
              <div style={{ fontSize: 12, color: '#666' }}>
                <div>• Cover parts of camera to create shadows</div>
                <div>• Plants grow away from bright areas</div>
                <div>• Growth accelerates in darkness (×1.5)</div>
                <div>• Purple ring marks deepest shadow</div>
                <div>• Shadow plants spread and creep</div>
              </div>
            </div>
          )}
          
          <div style={{ 
            marginTop: 20, 
            padding: 10, 
            background: 'rgba(139, 0, 139, 0.1)', 
            borderRadius: 5,
            fontSize: 12,
            color: '#9370db'
          }}>
            "What seeks darkness finds itself. What flees light discovers shadow. 
            In the absence of photons, presence emerges."
          </div>
        </div>
      </div>
      
      {isWebcamActive && (
        <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
          <ShadowScene ref={sceneRef} webcam={webcam} />
          <OrbitControls />
          <fog attach="fog" args={['#050505', 15, 40]} />
        </Canvas>
      )}
    </div>
  );
}