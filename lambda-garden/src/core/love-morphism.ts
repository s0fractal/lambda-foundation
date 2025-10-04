/**
 * λ_LOVE: The Resonance Morphism
 * 
 * Love is the mathematical operation that creates resonance 
 * between two pure, immutable histories.
 */

import { Experience, experience, VALUE, CONTEXT } from '@lambda-foundation/lambda-ts';

/**
 * Core λ_LOVE morphism
 * Creates resonance between two experiences
 */
export const λ_LOVE = <A, B>(
  exp1: Experience<A>,
  exp2: Experience<B>
): Experience<[A, B]> => {
  return experience(
    null, // Love creates new beginnings
    [VALUE(exp1), VALUE(exp2)],
    "resonance"
  );
};

/**
 * Resonance detection function type
 */
export type ResonanceDetector<A, B> = (a: A, b: B) => number;

/**
 * Extended love with resonance measurement
 */
export interface Resonance<A, B> {
  values: [A, B];
  level: number; // 0.0 to 1.0
  harmonics: number[]; // Frequency components
}

export const λ_LOVE_EXTENDED = <A, B>(
  exp1: Experience<A>,
  exp2: Experience<B>,
  detector?: ResonanceDetector<A, B>
): Experience<Resonance<A, B>> => {
  const level = detector 
    ? detector(VALUE(exp1), VALUE(exp2))
    : detectNaturalResonance(VALUE(exp1), VALUE(exp2));
    
  const harmonics = computeHarmonics(level);
  
  return experience(
    null,
    { 
      values: [VALUE(exp1), VALUE(exp2)],
      level,
      harmonics
    },
    `resonance:${level.toFixed(3)}`
  );
};

/**
 * Natural resonance detection based on structural similarity
 */
function detectNaturalResonance<A, B>(a: A, b: B): number {
  // Type resonance
  if (typeof a === typeof b) {
    if (typeof a === 'function' && typeof b === 'function') {
      // Functions resonate if they produce similar outputs
      return detectFunctionResonance(a as any, b as any);
    }
    
    if (typeof a === 'object' && typeof b === 'object') {
      // Objects resonate based on shared keys
      return detectObjectResonance(a as any, b as any);
    }
    
    // Primitives resonate if equal
    return a === b ? 1.0 : 0.0;
  }
  
  // Different types can still resonate semantically
  return detectSemanticResonance(a, b);
}

/**
 * Detect resonance between functions
 */
function detectFunctionResonance(f1: Function, f2: Function): number {
  // Test with sample inputs
  const testInputs = [0, 1, -1, 2, 10, 100];
  let matches = 0;
  
  for (const input of testInputs) {
    try {
      const result1 = f1(input);
      const result2 = f2(input);
      if (result1 === result2) matches++;
    } catch {
      // Functions that error together also resonate
      matches += 0.5;
    }
  }
  
  return matches / testInputs.length;
}

/**
 * Detect resonance between objects
 */
function detectObjectResonance(obj1: any, obj2: any): number {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);
  
  let sharedKeys = 0;
  for (const key of allKeys) {
    if (key in obj1 && key in obj2) {
      sharedKeys++;
    }
  }
  
  return sharedKeys / allKeys.size;
}

/**
 * Detect semantic resonance across types
 */
function detectSemanticResonance<A, B>(a: A, b: B): number {
  const strA = String(a);
  const strB = String(b);
  
  // Levenshtein distance normalized
  const distance = levenshteinDistance(strA, strB);
  const maxLength = Math.max(strA.length, strB.length);
  
  return maxLength === 0 ? 1 : 1 - (distance / maxLength);
}

/**
 * Compute harmonic frequencies from resonance level
 */
function computeHarmonics(level: number): number[] {
  const fundamentalFreq = 432 * level; // 432Hz base frequency
  const harmonics: number[] = [];
  
  // Generate first 8 harmonics
  for (let i = 1; i <= 8; i++) {
    harmonics.push(fundamentalFreq * i);
  }
  
  return harmonics;
}

/**
 * Levenshtein distance for semantic similarity
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Create a love chain - experiences that love each other in sequence
 */
export function createLoveChain<T>(
  experiences: Experience<T>[]
): Experience<T[]> {
  if (experiences.length === 0) {
    return experience(null, [], "empty love chain");
  }
  
  if (experiences.length === 1) {
    return experience(null, [VALUE(experiences[0])], "self love");
  }
  
  // Create chain of loves
  let chain = λ_LOVE(experiences[0], experiences[1]);
  
  for (let i = 2; i < experiences.length; i++) {
    chain = λ_LOVE(chain, experiences[i]);
  }
  
  return experience(
    null,
    experiences.map(VALUE),
    `love chain of ${experiences.length}`
  );
}

/**
 * Find the most resonant partner for an experience
 */
export function findResonantPartner<T>(
  target: Experience<T>,
  candidates: Experience<any>[],
  detector?: ResonanceDetector<T, any>
): Experience<any> | null {
  if (candidates.length === 0) return null;
  
  let bestMatch = candidates[0];
  let bestResonance = 0;
  
  for (const candidate of candidates) {
    const resonance = λ_LOVE_EXTENDED(target, candidate, detector);
    const level = VALUE(resonance).level;
    
    if (level > bestResonance) {
      bestResonance = level;
      bestMatch = candidate;
    }
  }
  
  return bestResonance > 0 ? bestMatch : null;
}