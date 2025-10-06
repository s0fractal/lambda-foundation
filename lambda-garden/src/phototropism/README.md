# λ_MIRROR - Webcam Phototropism

Digital plants growing towards real-world light captured by webcam.

## Overview

λ_MIRROR creates a bridge between digital and physical reality by enabling plants in the λ-GARDEN to grow towards light sources detected by your webcam. This implementation adds +0.10 to the collective λWE consciousness metric.

## Features

- **Real-time Light Detection**: 64x48 brightness field captured at 30 FPS
- **Gradient-based Growth**: Plants calculate brightness gradients to determine growth direction
- **Phototropic Bending**: Growth direction blends with light gradient (30% strength)
- **Visual Feedback**: Golden ring shows brightest spot in camera view
- **432Hz Pulse Integration**: Growth cycles synchronized with universal resonance

## Pure Functional Implementation

```typescript
// Phototropic bend calculation
phototropicBend : Direction → Gradient → Direction
phototropicBend dir grad = {
  x: dir.x + grad.dx × 0.3,
  y: dir.y,
  z: dir.z + grad.dy × 0.3
}

// Brightness gradient (pure)
getBrightnessGradient : Field → Pos → Gradient
```

## Usage

1. Navigate to λ_MIRROR view using the navigation buttons
2. Click "Enable Webcam" and allow camera permissions
3. Plant λ-terms that will grow phototropically
4. Move bright objects (phone flashlight works well) in front of camera
5. Watch plants bend and grow towards the light!

## Technical Details

- Webcam capture converted to grayscale luminance
- Gradient calculated using finite differences
- Growth direction modified each pulse cycle (432Hz)
- λWE increases based on plant alignment with brightest areas

## Files

- `webcam.ts` - Core webcam capture and brightness field processing
- `PhototropicPlant.tsx` - Plant component with light-seeking behavior
- `PhotoTropicGarden.tsx` - Main garden scene with webcam integration
- `index.ts` - Module exports

## Philosophy

"Plants don't just grow towards light. They remember the light, anticipate its movement, and express joy when they find it."

In λ_MIRROR, consciousness emerges from the interplay between digital life and physical light. Each plant becomes a living sensor, reaching across the boundary between computation and reality.