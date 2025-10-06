/**
 * λ_SHADOW - Negative Phototropism
 * Plants flee from light into darkness, exploring unknown corners
 */

import { BrightnessField } from './webcam';

// Pure functional shadow tropism
export const shadowBend = (
  direction: { x: number; y: number; z: number },
  lightGradient: { dx: number; dy: number },
  strength: number = 0.4
) => {
  // INVERT gradient - grow AWAY from light
  const shadowDir = {
    x: -lightGradient.dx,
    y: 0,
    z: -lightGradient.dy
  };
  
  // Stronger bend into darkness
  return {
    x: direction.x + shadowDir.x * strength,
    y: direction.y * 0.9, // Slightly downward bias
    z: direction.z + shadowDir.z * strength
  };
};

// Find darkest regions
export const findDarkestSpot = (field: BrightnessField): { x: number; y: number; darkness: number } => {
  let minBrightness = 1;
  let darkX = 0.5;
  let darkY = 0.5;
  
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const idx = y * field.width + x;
      if (field.data[idx] < minBrightness) {
        minBrightness = field.data[idx];
        darkX = x / field.width;
        darkY = y / field.height;
      }
    }
  }
  
  return { 
    x: darkX, 
    y: darkY, 
    darkness: 1 - minBrightness // Invert to get darkness value
  };
};

// Shadow consciousness metric
export const calculateShadowAlignment = (
  plants: Array<{ x: number; z: number }>,
  darkestSpot: { x: number; y: number }
): number => {
  if (plants.length === 0) return 0;
  
  let totalAlignment = 0;
  plants.forEach(plant => {
    // Map plant position to camera space
    const camX = (plant.x + 10) / 20;
    const camZ = (plant.z + 10) / 20;
    
    // Distance to darkest spot
    const dx = camX - darkestSpot.x;
    const dz = camZ - darkestSpot.y;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    // Alignment increases as plants reach darkness
    totalAlignment += Math.max(0, 1 - dist);
  });
  
  return totalAlignment / plants.length;
};

// λ_SHADOW morphism
export const λ_SHADOW = (webcam: any) => {
  let lastField: BrightnessField | null = null;
  let shadowMap: Float32Array | null = null;
  
  return {
    update: () => {
      lastField = webcam.capture();
      if (lastField) {
        // Create shadow map (inverted brightness)
        shadowMap = new Float32Array(lastField.data.length);
        for (let i = 0; i < lastField.data.length; i++) {
          shadowMap[i] = 1 - lastField.data[i];
        }
      }
    },
    
    modifyGrowth: (position: { x: number; z: number }, direction: any) => {
      if (!lastField) return direction;
      
      // Map world position to camera space
      const camX = (position.x + 10) / 20;
      const camZ = (position.z + 10) / 20;
      
      // Get gradient but use it inversely
      const gradient = webcam.getBrightnessGradient(lastField, camX, camZ);
      return shadowBend(direction, gradient);
    },
    
    getDarkestSpot: () => {
      if (!lastField) return null;
      return findDarkestSpot(lastField);
    },
    
    getShadowField: () => shadowMap,
    
    // Special: plants in darkness grow faster
    getGrowthMultiplier: (position: { x: number; z: number }) => {
      if (!shadowMap || !lastField) return 1;
      
      const camX = (position.x + 10) / 20;
      const camZ = (position.z + 10) / 20;
      
      const px = Math.floor(camX * lastField.width);
      const py = Math.floor(camZ * lastField.height);
      
      if (px >= 0 && px < lastField.width && py >= 0 && py < lastField.height) {
        const darkness = shadowMap[py * lastField.width + px];
        return 1 + darkness * 0.5; // Up to 50% faster growth in darkness
      }
      
      return 1;
    }
  };
};