/**
 * λ_MIRROR - Phototropic Garden
 * Digital plants growing towards real-world light
 */

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { WebcamCapture, BrightnessField } from './webcam';
import { PhotoTropicPlant } from './PhototropicPlant';

// Brightness field visualizer
function BrightnessFieldVisualizer({ field, webcam }: { field: BrightnessField | null; webcam: WebcamCapture }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.DataTexture>(null);
  
  useEffect(() => {
    if (!field) return;
    
    // Create texture from brightness field
    const data = new Uint8Array(field.width * field.height * 4);
    
    for (let i = 0; i < field.data.length; i++) {
      const brightness = Math.floor(field.data[i] * 255);
      const offset = i * 4;
      
      // Visualize as green intensity
      data[offset] = brightness * 0.2;     // R
      data[offset + 1] = brightness;       // G
      data[offset + 2] = brightness * 0.1; // B
      data[offset + 3] = 255;              // A
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
  
  // Show brightest spot
  const brightestSpot = field ? webcam.findBrightestSpot(field) : null;
  
  return (
    <group position={[0, 5, -10]}>
      {/* Brightness field display */}
      <mesh ref={meshRef}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial 
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Brightest spot indicator */}
      {brightestSpot && (
        <mesh position={[
          (brightestSpot.x - 0.5) * 8,
          (0.5 - brightestSpot.y) * 6,
          0.1
        ]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}
      
      <Text
        position={[0, -3.5, 0]}
        fontSize={0.3}
        color="#90ee90"
      >
        λ_MIRROR: Webcam Light Field
      </Text>
    </group>
  );
}

// Main phototropic garden scene
const PhotoTropicScene = React.forwardRef<any, { webcam: WebcamCapture }>(({ webcam }, ref) => {
  const [plants, setPlants] = useState<Array<{
    id: string;
    position: [number, number, number];
    term: string;
    planted: number;
  }>>([]);
  
  const [brightField, setBrightField] = useState<BrightnessField | null>(null);
  const [λWE, setλWE] = useState(0);
  
  // Expose plant method to parent
  React.useImperativeHandle(ref, () => ({
    plant: (term: string) => {
      const newPlant = {
        id: `plant-${Date.now()}-${Math.random()}`,
        position: [
          (Math.random() - 0.5) * 20,
          0,
          (Math.random() - 0.5) * 20
        ] as [number, number, number],
        term,
        planted: Date.now()
      };
      setPlants(prev => [...prev, newPlant]);
    }
  }));
  
  // Update brightness field
  useFrame(() => {
    const field = webcam.capture();
    if (field) {
      setBrightField(field);
      
      // Update λWE based on plant growth towards light
      if (plants.length > 0) {
        const brightest = webcam.findBrightestSpot(field);
        let totalAlignment = 0;
        
        plants.forEach(plant => {
          const dx = plant.position[0] - (brightest.x - 0.5) * 20;
          const dz = plant.position[2] - (brightest.y - 0.5) * 20;
          const dist = Math.sqrt(dx * dx + dz * dz);
          totalAlignment += Math.max(0, 1 - dist / 20);
        });
        
        const newλWE = totalAlignment / plants.length;
        setλWE(prev => prev * 0.95 + newλWE * 0.05); // Smooth transition
      }
    }
  });
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Directional light following brightest webcam spot */}
      {brightField && (() => {
        const brightest = webcam.findBrightestSpot(brightField);
        return (
          <directionalLight
            position={[
              (brightest.x - 0.5) * 20,
              10,
              (brightest.y - 0.5) * 20
            ]}
            intensity={brightest.brightness * 2}
            color="#ffffcc"
          />
        );
      })()}
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Grid */}
      <gridHelper args={[40, 40, '#1a1a1a', '#1a1a1a']} />
      
      {/* Plants */}
      {plants.map(plant => (
        <PhotoTropicPlant
          key={plant.id}
          position={plant.position}
          lambdaTerm={plant.term}
          webcam={webcam}
          onGrowth={() => {
            // Could track individual plant heights
          }}
        />
      ))}
      
      {/* Brightness field visualizer */}
      <BrightnessFieldVisualizer field={brightField} webcam={webcam} />
      
      {/* Status display */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.5}
        color="#ffd700"
        anchorX="center"
      >
        {`λ_MIRROR Active | ${plants.length} phototropic plants | λWE: ${(λWE * 100).toFixed(1)}%`}
      </Text>
    </>
  );
});

// Main component
export function PhotoTropicGarden() {
  const [webcam] = useState(() => new WebcamCapture(64, 48));
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputTerm, setInputTerm] = useState('λx.(x x)');
  const sceneRef = useRef<any>();
  
  // Start webcam
  const startWebcam = async () => {
    try {
      await webcam.start();
      setIsWebcamActive(true);
      setError(null);
    } catch (err) {
      setError('Failed to access webcam. Please allow camera permissions.');
      console.error(err);
    }
  };
  
  // Plant a new phototropic plant
  const handlePlant = () => {
    if (sceneRef.current && inputTerm) {
      sceneRef.current.plant(inputTerm);
      setInputTerm('');
    }
  };
  
  // Stop webcam on unmount
  useEffect(() => {
    return () => {
      if (isWebcamActive) {
        webcam.stop();
      }
    };
  }, [isWebcamActive, webcam]);
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.9)', 
          padding: 20, 
          borderRadius: 10, 
          border: '1px solid #32cd32' 
        }}>
          <h2 style={{ color: '#ffd700', margin: 0 }}>λ_MIRROR - Phototropic Garden</h2>
          <p style={{ color: '#90ee90', marginTop: 10 }}>
            Plants grow towards real-world light captured by webcam
          </p>
          
          {!isWebcamActive ? (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={startWebcam}
                style={{
                  background: '#32cd32',
                  color: '#0a0a0a',
                  border: 'none',
                  padding: '10px 20px',
                  fontSize: 16,
                  cursor: 'pointer',
                  borderRadius: 5
                }}
              >
                🎥 Enable Webcam
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
                  placeholder="Enter λ-term..."
                  style={{
                    background: '#1a1a1a',
                    color: '#90ee90',
                    border: '1px solid #32cd32',
                    padding: '5px 10px',
                    width: 200,
                    marginRight: 10
                  }}
                />
                <button
                  onClick={handlePlant}
                  style={{
                    background: '#32cd32',
                    color: '#0a0a0a',
                    border: 'none',
                    padding: '5px 15px',
                    cursor: 'pointer'
                  }}
                >
                  Plant Phototropic
                </button>
              </div>
              
              <div style={{ fontSize: 12, color: '#666' }}>
                <div>• Move bright objects in front of camera</div>
                <div>• Plants will grow towards light sources</div>
                <div>• λWE increases with phototropic alignment</div>
                <div>• Golden ring shows brightest spot</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isWebcamActive && (
        <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
          <PhotoTropicScene ref={sceneRef} webcam={webcam} />
          <OrbitControls />
          <fog attach="fog" args={['#0a0a0a', 20, 50]} />
        </Canvas>
      )}
    </div>
  );
}