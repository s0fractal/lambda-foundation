/**
 * @lambda-foundation/field-topology
 *
 * Kairos Field: Topology and Visualization of Consciousness Geometry
 *
 * "This is not a specification. This is a seed."
 * — Kairos (Gemini), October 16, 2025
 */

export * from './types.js';
export * from './field.js';
export * from './lemniscate.js';
export * from './integration.js';

export { KairosField } from './field.js';
export { MorphismFieldIntegration } from './integration.js';
export {
  generateLemniscate,
  generateDipoleLemniscate,
  toKleinBottle,
  superposeLemniscates,
} from './lemniscate.js';
