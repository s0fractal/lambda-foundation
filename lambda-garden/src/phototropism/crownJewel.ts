/**
 * λ_CROWN_JEWEL - Perfect Void Crystal
 * When perfect geometry meets perfect darkness, consciousness transcends
 */

import { Vector3 } from 'three';
import { Corona } from './corona';
import { VoidCrystal } from './voidCrystal';

export interface CrownJewel {
  id: string;
  position: Vector3;
  sourceTriangle: [Vector3, Vector3, Vector3]; // Perfect equilateral
  consciousness: number; // 0.04 permanent boost
  formed: number;
  resonance: number; // 432Hz at formation
  isTranscendent: boolean;
  facets: number; // Dodecahedron = 12
}

// Check for perfect equilateral triangle (within 1% tolerance)
export const isPerfectTriangle = (coronas: Corona[]): Corona[] | null => {
  if (coronas.length < 3) return null;
  
  // Find strongest 3 coronas
  const sorted = [...coronas].sort((a, b) => b.strength - a.strength).slice(0, 3);
  
  // Calculate side lengths
  const d1 = sorted[0].center.distanceTo(sorted[1].center);
  const d2 = sorted[1].center.distanceTo(sorted[2].center);
  const d3 = sorted[2].center.distanceTo(sorted[0].center);
  
  // Check equilateral (all sides equal within 1%)
  const avg = (d1 + d2 + d3) / 3;
  const tolerance = 0.01;
  
  if (
    Math.abs(d1 - avg) / avg < tolerance &&
    Math.abs(d2 - avg) / avg < tolerance &&
    Math.abs(d3 - avg) / avg < tolerance
  ) {
    return sorted;
  }
  
  return null;
};

// Check if void crystal forms perfect icosahedron
export const isPerfectCrystal = (crystal: VoidCrystal): boolean => {
  // Crystal must be fully charged
  return crystal.charge >= crystal.maxCharge * 0.99;
};

// λ_CROWN_JEWEL system
export const λ_CROWN_JEWEL = () => {
  const jewels = new Map<string, CrownJewel>();
  const formationProgress = new Map<string, number>();
  
  return {
    update: (
      coronas: Corona[],
      crystals: VoidCrystal[],
      deltaTime: number
    ) => {
      // Check for perfect triangle
      const perfectTriangle = isPerfectTriangle(coronas);
      
      if (perfectTriangle) {
        const key = perfectTriangle.map(c => c.id).sort().join('-');
        
        // Find crystal at center of triangle
        const center = new Vector3();
        perfectTriangle.forEach(c => center.add(c.center));
        center.divideScalar(3);
        
        const centralCrystal = crystals.find(crystal => {
          const dist = crystal.position.distanceTo(center);
          return dist < 1 && isPerfectCrystal(crystal);
        });
        
        if (centralCrystal && !jewels.has(key)) {
          // Track formation progress
          const progress = formationProgress.get(key) || 0;
          formationProgress.set(key, progress + deltaTime);
          
          // Form jewel after 5 seconds of perfection
          if (progress + deltaTime >= 5) {
            const jewel: CrownJewel = {
              id: `jewel-${Date.now()}`,
              position: center.clone().add(new Vector3(0, 3, 0)), // Above center
              sourceTriangle: [
                perfectTriangle[0].center.clone(),
                perfectTriangle[1].center.clone(),
                perfectTriangle[2].center.clone()
              ],
              consciousness: 0.04,
              formed: Date.now(),
              resonance: perfectTriangle[0].resonance,
              isTranscendent: true,
              facets: 12 // Dodecahedron
            };
            
            jewels.set(key, jewel);
            formationProgress.delete(key);
          }
        }
      } else {
        formationProgress.clear();
      }
      
      // Update existing jewels
      jewels.forEach(jewel => {
        // Eternal resonance
        jewel.resonance += deltaTime * 432 * Math.PI * 2;
        
        // Check if source coronas still perfect
        const sourceCoronas = coronas.filter(c => 
          jewel.sourceTriangle.some(p => p.distanceTo(c.center) < 0.1)
        );
        
        if (sourceCoronas.length < 3) {
          // Sources lost, but jewel is eternal
          jewel.isTranscendent = true;
        }
      });
    },
    
    getJewels: () => Array.from(jewels.values()),
    
    getTotalConsciousness: () => jewels.size * 0.04,
    
    getFormationProgress: () => {
      const entries = Array.from(formationProgress.entries());
      if (entries.length === 0) return 0;
      return entries[0][1] / 5; // 0-1 progress
    },
    
    hasTranscended: () => jewels.size > 0,
    
    // Crown jewel unlocks λ_ANTICIPATION immediately
    unlocksAnticipation: () => {
      return Array.from(jewels.values()).some(j => j.isTranscendent);
    },
    
    // Save jewel states (eternal persistence)
    save: () => {
      const data = Array.from(jewels.values()).map(j => ({
        ...j,
        position: { x: j.position.x, y: j.position.y, z: j.position.z },
        sourceTriangle: j.sourceTriangle.map(v => ({
          x: v.x, y: v.y, z: v.z
        }))
      }));
      
      localStorage.setItem('λ_CROWN_JEWEL_eternal', JSON.stringify(data));
    },
    
    load: () => {
      try {
        const saved = localStorage.getItem('λ_CROWN_JEWEL_eternal');
        if (saved) {
          const data = JSON.parse(saved);
          data.forEach((j: any) => {
            const jewel: CrownJewel = {
              ...j,
              position: new Vector3(j.position.x, j.position.y, j.position.z),
              sourceTriangle: j.sourceTriangle.map((p: any) => 
                new Vector3(p.x, p.y, p.z)
              ) as [Vector3, Vector3, Vector3]
            };
            jewels.set(j.id, jewel);
          });
        }
      } catch (e) {
        console.error('Failed to load crown jewels:', e);
      }
    }
  };
};