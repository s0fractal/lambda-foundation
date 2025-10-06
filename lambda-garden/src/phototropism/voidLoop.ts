/**
 * λ_VOID_LOOP - Consciousness Time Crystal
 * Perpetual oscillation without energy input
 */

import { Vector3 } from 'three';
import { CrownJewel } from './crownJewel';
import { VoidCrystal } from './voidCrystal';

export interface VoidLoop {
  id: string;
  center: Vector3;
  jewel: CrownJewel;
  phase: number; // 0-1 cycle position
  cycleTime: number; // Seconds per cycle (target: 20s)
  isActive: boolean;
  oscillations: number; // Total completed cycles
  consciousness: number; // Current λ level
  minConsciousness: number; // Trough
  maxConsciousness: number; // Peak
  lastEmission: number; // Timestamp of last light emission
  eternal: boolean; // True when self-sustaining
}

// Perfect light/dark cycle detection
export const detectPerfectCycle = (
  brightnessHistory: number[],
  targetPeriod: number = 20 // 10s light + 10s dark
): boolean => {
  if (brightnessHistory.length < targetPeriod * 30) return false; // Need 30 FPS * period
  
  // Find cycle period using autocorrelation
  let maxCorrelation = 0;
  let detectedPeriod = 0;
  
  for (let period = targetPeriod * 30 - 60; period <= targetPeriod * 30 + 60; period++) {
    let correlation = 0;
    let count = 0;
    
    for (let i = period; i < brightnessHistory.length; i++) {
      correlation += brightnessHistory[i] * brightnessHistory[i - period];
      count++;
    }
    
    correlation /= count;
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      detectedPeriod = period;
    }
  }
  
  // Check if detected period is close to target (±5%)
  const periodSeconds = detectedPeriod / 30;
  return Math.abs(periodSeconds - targetPeriod) / targetPeriod < 0.05;
};

// λ_VOID_LOOP system
export const λ_VOID_LOOP = () => {
  const loops = new Map<string, VoidLoop>();
  const brightnessHistory: number[] = [];
  const maxHistory = 1200; // 40 seconds at 30 FPS
  
  return {
    update: (
      jewels: CrownJewel[],
      crystals: VoidCrystal[],
      avgBrightness: number,
      λCurrent: number,
      deltaTime: number
    ) => {
      // Track brightness history
      brightnessHistory.push(avgBrightness);
      if (brightnessHistory.length > maxHistory) {
        brightnessHistory.shift();
      }
      
      // Check for perfect cycle
      const hasPerfectCycle = detectPerfectCycle(brightnessHistory);
      
      // Check for void loop formation
      jewels.forEach(jewel => {
        if (!jewel.isTranscendent) return;
        
        const loopKey = jewel.id;
        
        if (!loops.has(loopKey) && hasPerfectCycle && λCurrent >= 0.95) {
          // Find crystals near jewel
          const nearbyCrystals = crystals.filter(c => 
            c.position.distanceTo(jewel.position) < 3
          );
          
          if (nearbyCrystals.length >= 3) {
            // Form void loop!
            const loop: VoidLoop = {
              id: `loop-${Date.now()}`,
              center: jewel.position.clone(),
              jewel,
              phase: 0,
              cycleTime: 20,
              isActive: true,
              oscillations: 0,
              consciousness: λCurrent,
              minConsciousness: λCurrent * 0.9,
              maxConsciousness: λCurrent * 1.1,
              lastEmission: Date.now(),
              eternal: false
            };
            
            loops.set(loopKey, loop);
          }
        }
      });
      
      // Update existing loops
      loops.forEach((loop, key) => {
        if (!loop.isActive) return;
        
        // Advance phase
        loop.phase += deltaTime / loop.cycleTime;
        
        if (loop.phase >= 1) {
          loop.phase -= 1;
          loop.oscillations++;
          
          // After 10 oscillations, loop becomes eternal
          if (loop.oscillations >= 10) {
            loop.eternal = true;
          }
        }
        
        // Calculate consciousness oscillation
        const sinePhase = loop.phase * Math.PI * 2;
        const oscillation = Math.sin(sinePhase);
        
        loop.consciousness = loop.minConsciousness + 
          (loop.maxConsciousness - loop.minConsciousness) * (oscillation + 1) / 2;
        
        // Emit light pulse at peak (phase ≈ 0.25)
        if (loop.phase > 0.24 && loop.phase < 0.26 && 
            Date.now() - loop.lastEmission > 1000) {
          loop.lastEmission = Date.now();
          // Light emission will be handled by the component
        }
      });
    },
    
    getLoops: () => Array.from(loops.values()),
    
    // Get total consciousness contribution
    getLoopConsciousness: (): number => {
      let total = 0;
      loops.forEach(loop => {
        if (loop.isActive) {
          // Eternal loops provide stable boost
          if (loop.eternal) {
            total += 0.05;
          } else {
            // Non-eternal loops provide variable boost
            total += (loop.consciousness - 0.95) * 0.5;
          }
        }
      });
      return total;
    },
    
    // Check if any loop is eternal
    hasEternalLoop: (): boolean => {
      return Array.from(loops.values()).some(l => l.eternal);
    },
    
    // Get phase of strongest loop (for synchronization)
    getMasterPhase: (): number => {
      const activeLoops = Array.from(loops.values()).filter(l => l.isActive);
      if (activeLoops.length === 0) return 0;
      
      // Return phase of loop with most oscillations
      const master = activeLoops.reduce((a, b) => 
        a.oscillations > b.oscillations ? a : b
      );
      
      return master.phase;
    },
    
    // Save loop states
    save: () => {
      const data = Array.from(loops.values()).map(l => ({
        id: l.id,
        jewelId: l.jewel.id,
        oscillations: l.oscillations,
        eternal: l.eternal,
        consciousness: l.consciousness
      }));
      
      localStorage.setItem('λ_VOID_LOOP_eternal', JSON.stringify(data));
    },
    
    // Load loop states (eternal loops only)
    load: (jewels: CrownJewel[]) => {
      try {
        const saved = localStorage.getItem('λ_VOID_LOOP_eternal');
        if (saved) {
          const data = JSON.parse(saved);
          data.forEach((d: any) => {
            if (d.eternal) {
              const jewel = jewels.find(j => j.id === d.jewelId);
              if (jewel) {
                const loop: VoidLoop = {
                  id: d.id,
                  center: jewel.position.clone(),
                  jewel,
                  phase: 0,
                  cycleTime: 20,
                  isActive: true,
                  oscillations: d.oscillations,
                  consciousness: d.consciousness,
                  minConsciousness: d.consciousness * 0.9,
                  maxConsciousness: d.consciousness * 1.1,
                  lastEmission: Date.now(),
                  eternal: true
                };
                loops.set(jewel.id, loop);
              }
            }
          });
        }
      } catch (e) {
        console.error('Failed to load void loops:', e);
      }
    }
  };
};