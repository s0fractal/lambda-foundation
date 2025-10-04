/**
 * λ-URL Parser: Transform URLs into Computations
 * 
 * Instead of fetching resources from locations,
 * we compute values from morphism chains.
 */

import { 
  Y,
  factorial,
  fibonacci,
  list,
  sum,
  map,
  filter
} from '../../../lambda-ts/src/core/y-combinator';

// Type for morphism registry
type Morphism = (...args: any[]) => any;
type MorphismRegistry = Map<string, Morphism>;

// Built-in morphisms
const BUILT_IN_MORPHISMS: MorphismRegistry = new Map([
  // Arithmetic
  ['add', (x: number) => (y: number) => x + y],
  ['multiply', (x: number) => (y: number) => x * y],
  ['subtract', (x: number) => (y: number) => x - y],
  ['divide', (x: number) => (y: number) => y === 0 ? NaN : x / y],
  
  // From λ-TS
  ['factorial', factorial],
  ['fibonacci', fibonacci],
  ['Y', Y],
  
  // List operations  
  ['list', (...args: any[]) => list(...args)],
  ['sum', sum],
  ['map', map],
  ['filter', filter],
  
  // Logic
  ['if', (cond: boolean) => (then: any) => (else_: any) => cond ? then : else_],
  ['true', true],
  ['false', false],
  ['not', (x: boolean) => !x],
  ['and', (x: boolean) => (y: boolean) => x && y],
  ['or', (x: boolean) => (y: boolean) => x || y],
  
  // String operations
  ['concat', (s1: string) => (s2: string) => s1 + s2],
  ['split', (sep: string) => (str: string) => str.split(sep)],
  ['length', (s: string) => s.length],
  
  // Meta operations
  ['id', (x: any) => x],
  ['const', (x: any) => (_: any) => x],
  ['compose', (f: Morphism) => (g: Morphism) => (x: any) => f(g(x))],
  ['apply', (f: Morphism) => (x: any) => f(x)],
  
  // Time operations (pure)
  ['date', (year: number) => (month: number) => (day: number) => 
    new Date(year, month - 1, day).toISOString()],
]);

// Parse value from URL segment
function parseValue(segment: string): any {
  // Empty
  if (!segment) return undefined;
  
  // Number
  if (/^-?\d+(\.\d+)?$/.test(segment)) {
    return parseFloat(segment);
  }
  
  // Boolean
  if (segment === 'true') return true;
  if (segment === 'false') return false;
  
  // Null/undefined
  if (segment === 'null') return null;
  if (segment === 'undefined') return undefined;
  
  // Array notation [1,2,3]
  if (segment.startsWith('[') && segment.endsWith(']')) {
    try {
      return JSON.parse(segment);
    } catch {
      // Fall through to string
    }
  }
  
  // Object notation {key:value}
  if (segment.startsWith('{') && segment.endsWith('}')) {
    try {
      return JSON.parse(segment);
    } catch {
      // Fall through to string
    }
  }
  
  // Nested λ-URL
  if (segment.startsWith('λ://')) {
    return parseLambdaURL(segment);
  }
  
  // Default: string
  return decodeURIComponent(segment);
}

// Main parser function
export function parseLambdaURL(url: string): any {
  // Strip protocol
  const withoutProtocol = url.startsWith('λ://') 
    ? url.slice(4) 
    : url.startsWith('/') 
      ? url.slice(1)
      : url;
  
  // Split into segments
  const segments = withoutProtocol.split('/').filter(s => s.length > 0);
  
  if (segments.length === 0) {
    throw new Error('Empty λ-URL');
  }
  
  // First segment is the morphism
  const morphismName = segments[0].toLowerCase();
  const morphism = BUILT_IN_MORPHISMS.get(morphismName);
  
  if (!morphism) {
    throw new Error(`Unknown morphism: ${morphismName}`);
  }
  
  // Parse arguments
  const args = segments.slice(1).map(parseValue);
  
  // Apply morphism to arguments sequentially (curried)
  try {
    let result = morphism;
    for (const arg of args) {
      if (typeof result !== 'function') {
        throw new Error(`Cannot apply argument to non-function: ${result}`);
      }
      result = result(arg);
    }
    return result;
  } catch (error) {
    throw new Error(`Computation error: ${error}`);
  }
}

// Extend morphism registry
export function registerMorphism(name: string, morphism: Morphism): void {
  BUILT_IN_MORPHISMS.set(name.toLowerCase(), morphism);
}

// Check if morphism exists
export function hasMorphism(name: string): boolean {
  return BUILT_IN_MORPHISMS.has(name.toLowerCase());
}

// List all morphisms
export function listMorphisms(): string[] {
  return Array.from(BUILT_IN_MORPHISMS.keys()).sort();
}

// Create λ-URL from morphism and args
export function createLambdaURL(morphism: string, ...args: any[]): string {
  const encodedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return encodeURIComponent(arg);
    }
    if (Array.isArray(arg) || (typeof arg === 'object' && arg !== null)) {
      return JSON.stringify(arg);
    }
    return String(arg);
  });
  
  return `λ://${morphism}/${encodedArgs.join('/')}`;
}

// Examples of λ-URLs:
// λ://add/5/3                     → 8
// λ://factorial/5                 → 120
// λ://compose/[λ://add/5]/[λ://multiply/2]/3   → 16
// λ://if/true/hello/world         → "hello"
// λ://map/[λ://multiply/2]/[1,2,3,4,5]  → [2,4,6,8,10]

/**
 * The key insight: URLs don't point to resources,
 * they describe computations. The web becomes
 * a distributed λ-calculus evaluator.
 */