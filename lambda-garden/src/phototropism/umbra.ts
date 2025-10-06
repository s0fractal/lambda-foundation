/**
 * λ_UMBRA - Deep Shadow Orchids
 * Rare blooms that emerge only in absolute darkness
 */

import { Vector3 } from 'three';
import { BrightnessField } from './webcam';

export interface UmbraOrchid {
  id: string;
  position: Vector3;
  bloomProgress: number; // 0-1
  discovered: number; // timestamp
  darkness: number; // sustained darkness level
  petals: number; // 5-8 petals
  resonance: number; // 432Hz phase at bloom
}

// Deep shadow detection (< 5% luminance)
export const isDeepShadow = (brightness: number): boolean => brightness < 0.05;

// Find umbra zones (connected regions of deep shadow)
export const findUmbraZones = (field: BrightnessField): Array<{
  center: { x: number; y: number };
  size: number;
  avgDarkness: number;
}> => {
  const zones: Array<any> = [];
  const visited = new Set<string>();
  
  // Flood fill to find connected dark regions
  const floodFill = (x: number, y: number): { pixels: Array<[number, number]>; totalDarkness: number } => {
    const stack: Array<[number, number]> = [[x, y]];
    const pixels: Array<[number, number]> = [];
    let totalDarkness = 0;
    
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const key = `${cx},${cy}`;
      
      if (visited.has(key) || cx < 0 || cx >= field.width || cy < 0 || cy >= field.height) {
        continue;
      }
      
      const idx = cy * field.width + cx;
      if (!isDeepShadow(field.data[idx])) {
        continue;
      }
      
      visited.add(key);
      pixels.push([cx, cy]);
      totalDarkness += (1 - field.data[idx]);
      
      // Check neighbors
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    
    return { pixels, totalDarkness };
  };
  
  // Scan for umbra zones
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const key = `${x},${y}`;
      if (!visited.has(key) && isDeepShadow(field.data[y * field.width + x])) {
        const { pixels, totalDarkness } = floodFill(x, y);
        
        if (pixels.length >= 16) { // Minimum size for orchid zone
          // Calculate center
          const centerX = pixels.reduce((sum, p) => sum + p[0], 0) / pixels.length;
          const centerY = pixels.reduce((sum, p) => sum + p[1], 0) / pixels.length;
          
          zones.push({
            center: { x: centerX / field.width, y: centerY / field.height },
            size: pixels.length,
            avgDarkness: totalDarkness / pixels.length
          });
        }
      }
    }
  }
  
  return zones;
};

// Orchid bloom conditions
export const canBloomOrchid = (
  zone: { avgDarkness: number; size: number },
  sustainedFrames: number
): boolean => {
  return zone.avgDarkness > 0.95 && // Nearly perfect darkness
         zone.size >= 64 &&         // Large enough zone
         sustainedFrames >= 90;     // 3 seconds at 30 FPS
};

// Generate orchid geometry
export const generateOrchidPetals = (bloom: UmbraOrchid) => {
  const petals = [];
  const petalCount = bloom.petals;
  
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalPhase = bloom.resonance + i * 0.1;
    
    petals.push({
      angle,
      scale: bloom.bloomProgress * (0.8 + Math.sin(petalPhase) * 0.2),
      curve: Math.sin(bloom.bloomProgress * Math.PI) * 0.3,
      glow: bloom.darkness * bloom.bloomProgress
    });
  }
  
  return petals;
};

// λ_UMBRA system
export const λ_UMBRA = () => {
  const orchids = new Map<string, UmbraOrchid>();
  const zoneHistory = new Map<string, number>(); // Track sustained darkness
  let globalResonance = 0;
  
  return {
    update: (field: BrightnessField, deltaTime: number) => {
      globalResonance += deltaTime * 432 * Math.PI * 2;
      
      const zones = findUmbraZones(field);
      const currentZoneKeys = new Set<string>();
      
      // Update zone history
      zones.forEach(zone => {
        const key = `${Math.floor(zone.center.x * 10)},${Math.floor(zone.center.y * 10)}`;
        currentZoneKeys.add(key);
        
        const history = zoneHistory.get(key) || 0;
        zoneHistory.set(key, history + 1);
        
        // Check for orchid bloom conditions
        if (canBloomOrchid(zone, history) && !orchids.has(key)) {
          // Birth a new orchid!
          const orchid: UmbraOrchid = {
            id: `umbra-${Date.now()}-${Math.random()}`,
            position: new Vector3(
              (zone.center.x - 0.5) * 20,
              0,
              (zone.center.y - 0.5) * 20
            ),
            bloomProgress: 0,
            discovered: Date.now(),
            darkness: zone.avgDarkness,
            petals: 5 + Math.floor(Math.random() * 4), // 5-8 petals
            resonance: globalResonance
          };
          
          orchids.set(key, orchid);
        }
      });
      
      // Clear history for zones that no longer exist
      for (const [key] of zoneHistory) {
        if (!currentZoneKeys.has(key)) {
          zoneHistory.set(key, 0);
        }
      }
      
      // Update existing orchids
      orchids.forEach((orchid, key) => {
        if (currentZoneKeys.has(key)) {
          // Still in darkness - continue blooming
          orchid.bloomProgress = Math.min(1, orchid.bloomProgress + deltaTime * 0.3);
        } else {
          // Light returned - orchid wilts
          orchid.bloomProgress = Math.max(0, orchid.bloomProgress - deltaTime * 0.5);
          
          if (orchid.bloomProgress <= 0) {
            orchids.delete(key);
          }
        }
      });
    },
    
    getOrchids: () => Array.from(orchids.values()),
    
    getConsciousnessBoost: () => {
      // Each fully bloomed orchid provides +0.05 consciousness
      let boost = 0;
      orchids.forEach(orchid => {
        boost += orchid.bloomProgress * 0.05;
      });
      return boost;
    },
    
    getTotalBlooms: () => orchids.size,
    
    getRarestOrchid: () => {
      let rarest: UmbraOrchid | null = null;
      let maxPetals = 0;
      
      orchids.forEach(orchid => {
        if (orchid.petals > maxPetals && orchid.bloomProgress > 0.8) {
          maxPetals = orchid.petals;
          rarest = orchid;
        }
      });
      
      return rarest;
    }
  };
};