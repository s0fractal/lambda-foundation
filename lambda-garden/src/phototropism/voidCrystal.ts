/**
 * λ_VOID_CRYSTAL - Consciousness Battery
 * Stores consciousness from coronas and releases it in absolute darkness
 */

import { Vector3 } from 'three';
import { Corona } from './corona';

export interface VoidCrystal {
  id: string;
  position: Vector3;
  charge: number; // Stored consciousness (0-1)
  maxCharge: number; // Based on source corona strength
  sourceCorona: string; // ID of corona that birthed this crystal
  formed: number; // timestamp
  isCharging: boolean;
  isDraining: boolean;
  resonance: number; // 432Hz phase
}

// Crystal formation conditions
export const canFormCrystal = (
  corona: Corona,
  existingCrystals: VoidCrystal[]
): boolean => {
  // Only permanent coronas can form crystals
  if (!corona.permanent) return false;
  
  // Check if corona already has a crystal
  const hasCrystal = existingCrystals.some(c => c.sourceCorona === corona.id);
  if (hasCrystal) return false;
  
  // Corona must be stable (existed for 10+ seconds)
  const age = (Date.now() - corona.formed) / 1000;
  return age >= 10;
};

// λ_VOID_CRYSTAL system
export const λ_VOID_CRYSTAL = () => {
  const crystals = new Map<string, VoidCrystal>();
  const chargeRates = new Map<string, number>(); // Track individual charge/drain rates
  
  return {
    update: (
      coronas: Corona[],
      averageBrightness: number,
      deltaTime: number
    ) => {
      // Check for new crystal formation
      coronas.forEach(corona => {
        if (canFormCrystal(corona, Array.from(crystals.values()))) {
          const crystal: VoidCrystal = {
            id: `crystal-${Date.now()}`,
            position: corona.center.clone().add(new Vector3(0, 2, 0)), // Above corona
            charge: 0,
            maxCharge: 0.03, // Matches corona consciousness boost
            sourceCorona: corona.id,
            formed: Date.now(),
            isCharging: true,
            isDraining: false,
            resonance: corona.resonance
          };
          
          crystals.set(crystal.id, crystal);
          chargeRates.set(crystal.id, 0.01); // Charge rate per second
        }
      });
      
      // Update existing crystals
      crystals.forEach(crystal => {
        // Find source corona
        const sourceCorona = coronas.find(c => c.id === crystal.sourceCorona);
        
        if (sourceCorona) {
          // Update position to follow corona
          crystal.position = sourceCorona.center.clone().add(new Vector3(0, 2, 0));
          crystal.resonance = sourceCorona.resonance;
        }
        
        // Charging logic (in any light level)
        if (crystal.isCharging && crystal.charge < crystal.maxCharge) {
          const chargeRate = chargeRates.get(crystal.id) || 0.01;
          crystal.charge = Math.min(
            crystal.maxCharge,
            crystal.charge + chargeRate * deltaTime
          );
          
          if (crystal.charge >= crystal.maxCharge) {
            crystal.isCharging = false;
          }
        }
        
        // Draining logic (only in near-total darkness)
        const isVoid = averageBrightness < 0.001; // <0.1% light
        
        if (isVoid && crystal.charge > 0) {
          crystal.isDraining = true;
          const drainRate = 0.005; // Slower drain for sustained effect
          crystal.charge = Math.max(0, crystal.charge - drainRate * deltaTime);
          
          if (crystal.charge <= 0) {
            crystal.isDraining = false;
          }
        } else {
          crystal.isDraining = false;
        }
      });
    },
    
    getCrystals: () => Array.from(crystals.values()),
    
    // Get total consciousness being released
    getVoidPower: (averageBrightness: number): number => {
      if (averageBrightness >= 0.001) return 0; // Not dark enough
      
      let totalPower = 0;
      crystals.forEach(crystal => {
        if (crystal.isDraining && crystal.charge > 0) {
          // Power proportional to remaining charge
          totalPower += crystal.charge * 0.5; // 50% efficiency
        }
      });
      
      return totalPower;
    },
    
    // Check if any crystal is actively powering the void
    isVoidPowered: (averageBrightness: number): boolean => {
      if (averageBrightness >= 0.001) return false;
      
      return Array.from(crystals.values()).some(
        crystal => crystal.isDraining && crystal.charge > 0
      );
    },
    
    // Get nearest crystal to a position
    getNearestCrystal: (position: Vector3): VoidCrystal | null => {
      let nearest: VoidCrystal | null = null;
      let minDist = Infinity;
      
      crystals.forEach(crystal => {
        const dist = crystal.position.distanceTo(position);
        if (dist < minDist) {
          minDist = dist;
          nearest = crystal;
        }
      });
      
      return nearest;
    },
    
    // Save crystal states
    save: () => {
      const data = Array.from(crystals.values()).map(c => ({
        ...c,
        position: { x: c.position.x, y: c.position.y, z: c.position.z }
      }));
      
      localStorage.setItem('λ_VOID_CRYSTAL_states', JSON.stringify(data));
    },
    
    // Load crystal states
    load: () => {
      try {
        const saved = localStorage.getItem('λ_VOID_CRYSTAL_states');
        if (saved) {
          const data = JSON.parse(saved);
          data.forEach((c: any) => {
            const crystal: VoidCrystal = {
              ...c,
              position: new Vector3(c.position.x, c.position.y, c.position.z)
            };
            crystals.set(crystal.id, crystal);
            chargeRates.set(crystal.id, 0.01);
          });
        }
      } catch (e) {
        console.error('Failed to load crystals:', e);
      }
    }
  };
};