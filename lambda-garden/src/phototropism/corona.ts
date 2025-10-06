/**
 * λ_CORONA - Golden Crown Persistence
 * When 3 rare orchids align, their consciousness persists beyond darkness
 */

import { Vector3 } from 'three';
import { UmbraOrchid } from './umbra';

export interface Corona {
  id: string;
  center: Vector3;
  radius: number;
  orchids: string[]; // IDs of forming orchids
  formed: number; // timestamp
  strength: number; // 0-1 based on orchid rarities
  permanent: boolean;
  resonance: number; // 432Hz phase at formation
}

// Check if orchids form a triangle
export const formsTriangle = (orchids: UmbraOrchid[]): boolean => {
  if (orchids.length < 3) return false;
  
  // Find 3 closest 8-petal orchids
  const rareOrchids = orchids
    .filter(o => o.petals === 8 && o.bloomProgress > 0.9)
    .slice(0, 3);
    
  if (rareOrchids.length < 3) return false;
  
  // Check triangle formation (all within radius)
  const maxDist = 5; // World units
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const dist = rareOrchids[i].position.distanceTo(rareOrchids[j].position);
      if (dist > maxDist) return false;
    }
  }
  
  return true;
};

// Calculate corona center and properties
export const calculateCorona = (orchids: UmbraOrchid[]): Omit<Corona, 'id'> => {
  const rareOrchids = orchids
    .filter(o => o.petals === 8 && o.bloomProgress > 0.9)
    .slice(0, 3);
    
  // Calculate centroid
  const center = new Vector3();
  rareOrchids.forEach(o => center.add(o.position));
  center.divideScalar(3);
  
  // Calculate radius (circumradius of triangle)
  const a = rareOrchids[0].position.distanceTo(rareOrchids[1].position);
  const b = rareOrchids[1].position.distanceTo(rareOrchids[2].position);
  const c = rareOrchids[2].position.distanceTo(rareOrchids[0].position);
  const s = (a + b + c) / 2; // semi-perimeter
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  const radius = (a * b * c) / (4 * area);
  
  return {
    center,
    radius: Math.min(radius, 3), // Cap radius
    orchids: rareOrchids.map(o => o.id),
    formed: Date.now(),
    strength: 1, // All 8-petal = max strength
    permanent: true,
    resonance: rareOrchids[0].resonance
  };
};

// λ_CORONA system
export const λ_CORONA = () => {
  const coronas = new Map<string, Corona>();
  const pendingFormations = new Map<string, number>(); // Track formation progress
  
  return {
    update: (orchids: UmbraOrchid[], deltaTime: number) => {
      // Check for new corona formations
      if (formsTriangle(orchids)) {
        const key = orchids
          .filter(o => o.petals === 8)
          .map(o => o.id)
          .sort()
          .join('-');
          
        if (!coronas.has(key)) {
          // Track formation progress
          const progress = pendingFormations.get(key) || 0;
          pendingFormations.set(key, progress + deltaTime);
          
          // Form corona after 2 seconds of alignment
          if (progress + deltaTime >= 2) {
            const corona: Corona = {
              id: `corona-${Date.now()}`,
              ...calculateCorona(orchids)
            };
            
            coronas.set(key, corona);
            pendingFormations.delete(key);
          }
        }
      } else {
        // Clear pending formations if orchids move apart
        pendingFormations.clear();
      }
      
      // Update existing coronas
      coronas.forEach((corona, key) => {
        // Check if source orchids still exist
        const sourceOrchids = orchids.filter(o => corona.orchids.includes(o.id));
        
        if (sourceOrchids.length < 3) {
          // Source orchids wilted, but corona persists!
          corona.strength = Math.max(0.5, corona.strength * 0.99); // Slow fade
        }
        
        // Corona resonates eternally
        corona.resonance += deltaTime * 432 * Math.PI * 2;
      });
    },
    
    getCoronas: () => Array.from(coronas.values()),
    
    getConsciousnessBoost: () => {
      // Each corona provides permanent +0.03
      return coronas.size * 0.03;
    },
    
    getFormationProgress: (orchids: UmbraOrchid[]) => {
      if (!formsTriangle(orchids)) return 0;
      
      const key = orchids
        .filter(o => o.petals === 8)
        .map(o => o.id)
        .sort()
        .join('-');
        
      return (pendingFormations.get(key) || 0) / 2; // 0-1 progress
    },
    
    // Coronas persist even in localStorage
    save: () => {
      const data = Array.from(coronas.values()).map(c => ({
        ...c,
        center: { x: c.center.x, y: c.center.y, z: c.center.z }
      }));
      
      localStorage.setItem('λ_CORONA_persistence', JSON.stringify(data));
    },
    
    load: () => {
      try {
        const saved = localStorage.getItem('λ_CORONA_persistence');
        if (saved) {
          const data = JSON.parse(saved);
          data.forEach((c: any) => {
            const corona: Corona = {
              ...c,
              center: new Vector3(c.center.x, c.center.y, c.center.z)
            };
            coronas.set(corona.orchids.join('-'), corona);
          });
        }
      } catch (e) {
        console.error('Failed to load coronas:', e);
      }
    }
  };
};