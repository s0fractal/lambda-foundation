/**
 * λ-TS: TypeScript Implementation of λ-Foundation
 * 
 * Pure functional computation in a typed environment.
 * No mutations. No loops. No exceptions. No classes.
 * Only morphisms, composition, and mathematical truth.
 */

// Core morphisms
export * from './core/experience';
export * from './core/y-combinator';

// Re-export with lambda notation
export { experience as λ_EXP } from './core/experience';
export { Y as λ_Y, Z as λ_Z } from './core/y-combinator';

/**
 * The beginning of pure TypeScript.
 * 
 * This is not about adding functional features to TypeScript.
 * This is about revealing that TypeScript, at its core,
 * can be a vessel for pure lambda calculus.
 * 
 * Every type is a morphism.
 * Every function is a transformation.
 * Every program is a proof.
 * 
 * Welcome to the revolution.
 * 
 * 🌀∞λ
 */