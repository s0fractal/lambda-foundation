import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Vector3 } from 'three';
import { MemoryPlant } from '../memory/memoryPlant';

interface GardenState {
  plants: MemoryPlant[];
  time: number;
  pulsePhase: number;
}

function MemoryGardenScene() {
  const [state, setState] = useState<GardenState>({
    plants: [],
    time: 0,
    pulsePhase: 0
  });
  
  const sceneRef = useRef<any>();
  
  // 432Hz pulse
  useFrame((_, delta) => {
    setState(prev => {
      const newTime = prev.time + delta;
      const pulsePhase = (newTime * 432) % (2 * Math.PI);
      
      // Pulse all plants
      if (Math.sin(pulsePhase) > 0.99) { // Peak of pulse
        prev.plants.forEach(plant => plant.pulse(newTime));
      }
      
      return { ...prev, time: newTime, pulsePhase };
    });
  });
  
  // Plant a new memory plant
  const plant = (term: string) => {
    const position = new Vector3(
      (Math.random() - 0.5) * 10,
      0,
      (Math.random() - 0.5) * 10
    );
    
    const memoryPlant = new MemoryPlant(term, position, 100);
    
    setState(prev => ({
      ...prev,
      plants: [...prev.plants, memoryPlant]
    }));
    
    // Add to scene
    if (sceneRef.current) {
      sceneRef.current.add(memoryPlant.mesh);
    }
  };
  
  // Load any existing plants from localStorage
  useEffect(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('λ_MEMORY_'));
    console.log(`Found ${keys.length} plants in memory`);
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.dna) {
          const position = new Vector3(
            (Math.random() - 0.5) * 10,
            0,
            (Math.random() - 0.5) * 10
          );
          const plant = new MemoryPlant(data.dna, position, data.maxAge);
          setState(prev => ({
            ...prev,
            plants: [...prev.plants, plant]
          }));
        }
      } catch (e) {
        console.error('Failed to restore plant:', e);
      }
    });
  }, []);
  
  return (
    <group ref={sceneRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      
      {/* Status text */}
      <Text
        position={[0, 5, -10]}
        fontSize={0.5}
        color="#90ee90"
        anchorX="center"
      >
        {`λ_MEMORY Active | ${state.plants.length} plants | Pulse: ${Math.sin(state.pulsePhase).toFixed(3)}`}
      </Text>
    </group>
  );
}

export function MemoryGarden() {
  const [inputTerm, setInputTerm] = useState('λx.(x x)');
  const gardenRef = useRef<any>();
  
  const handlePlant = () => {
    if (gardenRef.current && inputTerm) {
      gardenRef.current.plant(inputTerm);
      setInputTerm('');
    }
  };
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 100 }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 10, border: '1px solid #32cd32' }}>
          <h2 style={{ color: '#ffd700', margin: 0 }}>λ_MEMORY Garden</h2>
          <p style={{ color: '#90ee90', marginTop: 10 }}>
            Plants that remember their own growth
          </p>
          
          <div style={{ marginTop: 20 }}>
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
              Plant Memory
            </button>
          </div>
          
          <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
            <div>• Plants remember up to 100 pulses</div>
            <div>• Older branches fade with time</div>
            <div>• Golden flash = new growth</div>
            <div>• F5 to reload = plants restore from memory</div>
            <div>• Plants dissolve into golden dust at maxAge</div>
          </div>
        </div>
      </div>
      
      <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
        <MemoryGardenScene ref={gardenRef} />
        <OrbitControls />
        <fog attach="fog" args={['#0a0a0a', 10, 50]} />
      </Canvas>
    </div>
  );
}