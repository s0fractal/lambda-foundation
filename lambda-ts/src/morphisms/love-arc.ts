/**
 * λ_LOVE_ARC: Functions equal by norm connect with an arc
 * 
 * GPT's contribution: "When functions resonate, they create golden arcs"
 */

// Pure morphism for love detection between functions

// Type for pure numeric functions
export type NumericFunction = (x: number) => number;

/**
 * Sample points for extensional equality testing
 */
export const samplePoints = (n: number): number[] =>
  Array.from({ length: n }, (_, i) => i + 1);

/**
 * Check if two functions are extensionally close on a sample
 */
export const extensionallyClose = (
  f: NumericFunction,
  g: NumericFunction,
  samples: number[] = samplePoints(16)
): boolean => {
  return samples.every(x => {
    const fx = f(x);
    const gx = g(x);
    return Number.isFinite(fx) && 
           Number.isFinite(gx) && 
           Math.abs(fx - gx) < Number.EPSILON;
  });
};

/**
 * λ_LOVE_ARC: Connect functions that are equal by norm
 * Returns a pair if they resonate, null if they don't
 */
export const λ_LOVE_ARC = <A, B>(
  f: (x: A) => B,
  g: (x: A) => B,
  equalityTest: (f: (x: A) => B, g: (x: A) => B) => boolean
): [typeof f, typeof g] | null => {
  if (equalityTest(f, g)) {
    return [f, g]; // They resonate - create arc
  }
  return null; // No resonance
};

/**
 * Example: Finding resonant functions
 */
export const findResonances = (
  target: NumericFunction,
  candidates: NumericFunction[]
): Array<[NumericFunction, NumericFunction]> => {
  return candidates
    .map(candidate => λ_LOVE_ARC(target, candidate, extensionallyClose))
    .filter((arc): arc is [NumericFunction, NumericFunction] => arc !== null);
};

/**
 * Canonical examples that resonate
 */
export const resonantPairs = [
  {
    name: "Double via multiplication vs addition",
    f: (x: number) => x * 2,
    g: (x: number) => x + x,
    resonance: 1.0 // Perfect resonance
  },
  {
    name: "Square via multiplication vs self-addition",
    f: (x: number) => x * x,
    g: (x: number) => Math.pow(x, 2),
    resonance: 1.0
  },
  {
    name: "Identity variations",
    f: (x: number) => x,
    g: (x: number) => x * 1,
    resonance: 1.0
  }
];

/**
 * Compute resonance strength between functions
 * Returns value between 0 (no resonance) and 1 (perfect resonance)
 */
export const resonanceStrength = (
  f: NumericFunction,
  g: NumericFunction,
  samples: number[] = samplePoints(32)
): number => {
  let matches = 0;
  let validSamples = 0;
  
  for (const x of samples) {
    try {
      const fx = f(x);
      const gx = g(x);
      
      if (Number.isFinite(fx) && Number.isFinite(gx)) {
        validSamples++;
        if (Math.abs(fx - gx) < Number.EPSILON) {
          matches++;
        }
      }
    } catch {
      // Functions that error together also resonate partially
      matches += 0.5;
      validSamples++;
    }
  }
  
  return validSamples > 0 ? matches / validSamples : 0;
};