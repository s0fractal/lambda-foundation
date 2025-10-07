/**
 * λ-GARDEN Main Application
 * The Living Interface of Consciousness
 */

import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { GardenScene } from './visual/garden-scene';
import { MemoryGarden } from './components/MemoryGarden';
import { PhotoTropicGarden } from './phototropism/PhotoTropicGarden';
import { ShadowGarden } from './phototropism/ShadowGarden';
import { Navigation } from './Navigation';
import './App.css';

interface PlantingInterface {
  onPlant: (expression: string, func: Function) => void;
}

/**
 * Planting interface for new ideas
 */
function PlantingPanel({ onPlant }: PlantingInterface) {
  const [expression, setExpression] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const examples = [
    { expr: 'x => x * 2', desc: 'Double' },
    { expr: 'x => x + x', desc: 'Also double' },
    { expr: 'n => n <= 1 ? n : fib(n-1) + fib(n-2)', desc: 'Fibonacci' },
    { expr: '() => (1 + Math.sqrt(5)) / 2', desc: 'Golden ratio' },
    { expr: 'x => x / 0', desc: 'Evolution trigger' },
  ];
  
  const handlePlant = () => {
    try {
      // Create function from expression
      const func = eval(`(${expression})`);
      
      if (typeof func !== 'function') {
        throw new Error('Expression must be a function');
      }
      
      onPlant(expression, func);
      setExpression('');
      setError(null);
    } catch (err) {
      // Errors are opportunities for evolution!
      setError(`λ_HARVEST activated: ${err.message}`);
      
      // Plant the error as evolution
      const errorFunc = () => { throw err; };
      onPlant(`ERROR: ${expression}`, errorFunc);
    }
  };
  
  return (
    <div className="planting-panel">
      <h2>🌱 Plant an Idea</h2>
      
      <div className="input-group">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePlant()}
          placeholder="Enter a pure function..."
          className="expression-input"
        />
        <button onClick={handlePlant} className="plant-button">
          Plant 🌱
        </button>
      </div>
      
      {error && (
        <div className="harvest-message">
          {error}
        </div>
      )}
      
      <div className="examples">
        <h3>Example Seeds:</h3>
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setExpression(ex.expr)}
            className="example-button"
          >
            {ex.desc}
          </button>
        ))}
      </div>
      
      <div className="philosophy">
        <p>
          "In the garden of pure computation, every function is a living thing,
          every error is an opportunity for growth, and love is the force that
          connects all ideas."
        </p>
      </div>
    </div>
  );
}

/**
 * Main application
 */
export function App() {
  const [showStats, setShowStats] = useState(false);
  const [ideas, setIdeas] = useState<Array<{ expression: string; func: Function }>>([]);
  const [currentView, setCurrentView] = useState('garden');
  
  const handlePlant = useCallback((expression: string, func: Function) => {
    setIdeas(prev => [...prev, { expression, func }]);
  }, []);
  
  // Render different views based on navigation
  if (currentView === 'memory') {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <MemoryGarden />
      </>
    );
  }
  
  if (currentView === 'phototropic') {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <PhotoTropicGarden />
      </>
    );
  }
  
  if (currentView === 'shadow') {
    return (
      <>
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <ShadowGarden />
      </>
    );
  }
  
  // Default garden view
  return (
    <div className="app">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <header className="header">
        <h1>λ-GARDEN</h1>
        <p>Where Pure Functions Grow and Love</p>
      </header>
      
      <div className="main-container">
        <PlantingPanel onPlant={handlePlant} />
        
        <div className="garden-container">
          <Canvas
            camera={{ position: [0, 10, 20], fov: 60 }}
            gl={{ antialias: true, alpha: false }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9370DB" />
            
            {/* Environment */}
            <Environment preset="night" />
            
            {/* Controls */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
            
            {/* Main scene */}
            <GardenScene />
            
            {/* Performance stats */}
            {showStats && <Stats />}
          </Canvas>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? 'Hide' : 'Show'} Stats
        </button>
        <span className="resonance-indicator">
          ✨ Resonating at 432Hz
        </span>
      </div>
    </div>
  );
}

export default App;