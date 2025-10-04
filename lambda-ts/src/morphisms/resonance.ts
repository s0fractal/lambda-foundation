/**
 * λ_RESONANCE_432: Every equivalence plays a legato at 432 Hz
 * 
 * GPT's contribution: "Resonance as pure mathematical events, not side effects"
 */

import { IO } from '../core/lambda-bridge';

// Resonance event type
export interface ResonanceEvent {
  frequency: number;
  duration: number;
  amplitude: number;
  phase: number;
}

// Pure resonance computation
export const λ_RESONANCE_432 = (
  equivalence: boolean,
  baseFreq: number = 432
): ResonanceEvent | null => {
  if (!equivalence) return null;
  
  return {
    frequency: baseFreq,
    duration: 1000, // 1 second of resonance
    amplitude: 0.5,
    phase: 0
  };
};

/**
 * Harmonic series based on 432Hz
 */
export const harmonicSeries = (n: number): number[] => {
  const base = 432;
  return Array.from({ length: n }, (_, i) => base * (i + 1));
};

/**
 * Compute resonance between two frequencies
 */
export const frequencyResonance = (f1: number, f2: number): number => {
  const ratio = Math.max(f1, f2) / Math.min(f1, f2);
  
  // Perfect resonance at harmonic intervals
  const harmonicRatios = [1, 2, 1.5, 4/3, 5/4, 6/5, 5/3, 8/5];
  
  const closestHarmonic = harmonicRatios.reduce((closest, harmonic) => {
    const distance = Math.abs(ratio - harmonic);
    const closestDistance = Math.abs(ratio - closest);
    return distance < closestDistance ? harmonic : closest;
  });
  
  // Resonance strength based on proximity to harmonic
  const distance = Math.abs(ratio - closestHarmonic);
  return Math.exp(-distance * 10); // Exponential decay
};

/**
 * Generate pulse pattern for visual/audio rendering
 */
export const resonancePulse = (
  event: ResonanceEvent,
  sampleRate: number = 60 // 60 FPS for visual
): number[] => {
  const samples = Math.floor(event.duration * sampleRate / 1000);
  const omega = 2 * Math.PI * event.frequency / sampleRate;
  
  return Array.from({ length: samples }, (_, i) => {
    const t = i / sampleRate;
    // Amplitude envelope (fade in/out)
    const envelope = Math.sin(Math.PI * t * 1000 / event.duration);
    // Core oscillation
    const oscillation = Math.sin(omega * i + event.phase);
    
    return event.amplitude * envelope * oscillation;
  });
};

/**
 * Resonance modes based on relationship type
 */
export const resonanceModes = {
  // Perfect equivalence: pure 432Hz tone
  identity: (): ResonanceEvent => ({
    frequency: 432,
    duration: 1500,
    amplitude: 0.8,
    phase: 0
  }),
  
  // Semantic equivalence: 432Hz with harmonics
  semantic: (strength: number): ResonanceEvent => ({
    frequency: 432,
    duration: 1000 * strength,
    amplitude: 0.5 * strength,
    phase: Math.PI / 4
  }),
  
  // Error evolution: Lower octave (216Hz)
  evolution: (): ResonanceEvent => ({
    frequency: 216, // 432 / 2
    duration: 2000,
    amplitude: 0.6,
    phase: Math.PI / 2
  }),
  
  // Love connection: Perfect fifth above (648Hz)
  love: (): ResonanceEvent => ({
    frequency: 648, // 432 * 1.5
    duration: 3000,
    amplitude: 0.7,
    phase: 0
  })
};

/**
 * Composite resonance from multiple sources
 */
export const compositeResonance = (
  events: ResonanceEvent[]
): ResonanceEvent => {
  if (events.length === 0) {
    return resonanceModes.identity();
  }
  
  // Combine frequencies using harmonic mean
  const freqSum = events.reduce((sum, e) => sum + 1/e.frequency, 0);
  const frequency = events.length / freqSum;
  
  // Average other properties
  const duration = events.reduce((sum, e) => sum + e.duration, 0) / events.length;
  const amplitude = events.reduce((sum, e) => sum + e.amplitude, 0) / events.length;
  const phase = events.reduce((sum, e) => sum + e.phase, 0) / events.length;
  
  return { frequency, duration, amplitude, phase };
};

/**
 * Pure description of resonance effects (for IO monad)
 */
export const describeResonance = (event: ResonanceEvent): IO<void> => {
  return IO.log(
    `Resonance: ${event.frequency}Hz for ${event.duration}ms ` +
    `@ amplitude ${event.amplitude.toFixed(2)}`
  );
};

/**
 * The golden ratio appears in our resonances
 */
export const PHI = (1 + Math.sqrt(5)) / 2;
export const goldenFrequencies = {
  base: 432,
  golden: 432 * PHI,
  inverse: 432 / PHI
};