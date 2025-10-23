// algebraTemplates.ts
// Event 017: Algebra Synthesis from Properties
// Ontologically safe templates for algebra generation

import type { Algebra } from '../evolution/operators.js';
import type { AlgebraSpec, AlgebraSemantics } from './algebraSpec.js';

/**
 * Generate algebra from template based on semantic category
 *
 * @returns Algebra function or null if cannot generate
 */
export function generateFromTemplate(spec: AlgebraSpec): Algebra<any, any> | null {
  if (!spec.semantics) {
    return null;  // Cannot generate without semantic hint
  }

  switch (spec.semantics) {
    case 'additive':
      return generateAdditive(spec);

    case 'multiplicative':
      return generateMultiplicative(spec);

    case 'extremal':
      return generateExtremal(spec);

    case 'concatenative':
      return generateConcatenative(spec);

    default:
      return null;  // Custom semantics not supported
  }
}

/**
 * Generate additive algebra (sum)
 */
function generateAdditive(spec: AlgebraSpec): Algebra<any, any> | null {
  if (spec.valueType !== 'number') {
    return null;  // Additive only for numbers
  }

  if (spec.identity !== undefined && spec.identity !== 0) {
    return null;  // Additive identity must be 0
  }

  return (acc: number, val: number) => acc + val;
}

/**
 * Generate multiplicative algebra (product)
 */
function generateMultiplicative(spec: AlgebraSpec): Algebra<any, any> | null {
  if (spec.valueType !== 'number') {
    return null;  // Multiplicative only for numbers
  }

  if (spec.identity !== undefined && spec.identity !== 1) {
    return null;  // Multiplicative identity must be 1
  }

  return (acc: number, val: number) => acc * val;
}

/**
 * Generate extremal algebra (max/min)
 */
function generateExtremal(spec: AlgebraSpec): Algebra<any, any> | null {
  if (spec.valueType !== 'number') {
    return null;  // Extremal only for numbers
  }

  if (spec.identity === -Infinity) {
    // Max algebra
    return (acc: number, val: number) => Math.max(acc, val);
  } else if (spec.identity === Infinity) {
    // Min algebra
    return (acc: number, val: number) => Math.min(acc, val);
  }

  return null;  // Extremal requires -Infinity (max) or Infinity (min)
}

/**
 * Generate concatenative algebra (string/array concat)
 */
function generateConcatenative(spec: AlgebraSpec): Algebra<any, any> | null {
  if (spec.valueType === 'string') {
    if (spec.identity !== undefined && spec.identity !== '') {
      return null;  // String concat identity must be ''
    }
    return (acc: string, val: string) => acc + val;
  }

  if (spec.valueType === 'array') {
    if (spec.identity !== undefined && JSON.stringify(spec.identity) !== '[]') {
      return null;  // Array concat identity must be []
    }
    return (acc: any[], val: any) => [...acc, val];
  }

  return null;  // Concatenative only for string/array
}

/**
 * Get a human-readable name for a generated algebra
 */
export function getGeneratedName(spec: AlgebraSpec): string {
  if (spec.name) {
    return spec.name;
  }

  if (spec.semantics) {
    switch (spec.semantics) {
      case 'additive':
        return 'sum';
      case 'multiplicative':
        return 'product';
      case 'extremal':
        return spec.identity === -Infinity ? 'max' : 'min';
      case 'concatenative':
        return spec.valueType === 'string' ? 'concat' : 'collect';
      default:
        return 'generated';
    }
  }

  return `${spec.class}_${spec.valueType}`;
}

/**
 * Validate that a template can be generated for a spec
 */
export function canGenerate(spec: AlgebraSpec): boolean {
  return generateFromTemplate(spec) !== null;
}

/**
 * Get all possible templates for a value type
 */
export function getAvailableTemplates(valueType: string): AlgebraSemantics[] {
  switch (valueType) {
    case 'number':
      return ['additive', 'multiplicative', 'extremal'];
    case 'string':
      return ['concatenative'];
    case 'array':
      return ['concatenative'];
    default:
      return [];
  }
}
