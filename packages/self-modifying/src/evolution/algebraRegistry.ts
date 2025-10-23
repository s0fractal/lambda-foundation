// algebraRegistry.ts
// Event 020: Algebra Evolution
// The living ontological database

import type { ClassifiedAlgebra, AlgebraProperties } from '../meta/algebraClassifier.js';
import type { FinalizedAlgebra } from './algebraFinalized.js';

/**
 * Ontological registry of algebras
 *
 * This is not a "library of functions".
 * This is a "database of mathematical truths".
 *
 * Each algebra registered here:
 * - Is classified by properties
 * - Is proven correct (by classification or composition)
 * - Is available for composition
 * - Automatically inherits fusion and parallelization capabilities
 */
export class AlgebraRegistry {
  private algebras: Map<string, ClassifiedAlgebra<any, any>> = new Map();
  private finalized: Map<string, FinalizedAlgebra<any, any, any>> = new Map();
  private evolutionLog: Array<{timestamp: Date; name: string; class: string}> = [];

  /**
   * Register a new algebra
   *
   * This is not "adding a function to a library".
   * This is "adding a mathematical truth to the noosphere".
   */
  register<A, B>(
    name: string,
    algebra: ClassifiedAlgebra<A, B>,
    silent = false
  ): void {
    // Check: does this algebra already exist?
    const existing = this.algebras.get(name);
    if (existing) {
      if (!silent) {
        console.warn(`Algebra "${name}" already exists. Replacing.`);
      }
    }

    // Add to registry
    this.algebras.set(name, algebra);

    // Log evolution
    this.evolutionLog.push({
      timestamp: new Date(),
      name,
      class: algebra.class,
    });

    if (!silent) {
      console.log(`✨ New algebra evolved: ${name} (${algebra.class})`);
      console.log(`   Properties: ${this.describeProperties(algebra.properties)}`);
      console.log(`   Capabilities: ${this.describeCapabilities(algebra.implications)}`);
    }
  }

  /**
   * Register finalized algebra
   */
  registerFinalized<A, B, R>(
    name: string,
    finalized: FinalizedAlgebra<A, B, R>,
    silent = false
  ): void {
    const existing = this.finalized.get(name);
    if (existing && !silent) {
      console.warn(`Finalized algebra "${name}" already exists. Replacing.`);
    }

    this.finalized.set(name, finalized);

    // Also log in evolution
    this.evolutionLog.push({
      timestamp: new Date(),
      name: `${name} (finalized)`,
      class: finalized.algebra.class,
    });

    if (!silent) {
      console.log(`✨ New finalized algebra evolved: ${name}`);
      console.log(`   Based on: ${finalized.algebra.name}`);
      console.log(`   Class: ${finalized.algebra.class}`);
    }
  }

  /**
   * Get algebra by name
   */
  get<A, B>(name: string): ClassifiedAlgebra<A, B> | undefined {
    return this.algebras.get(name);
  }

  /**
   * Get finalized algebra by name
   */
  getFinalized<A, B, R>(name: string): FinalizedAlgebra<A, B, R> | undefined {
    return this.finalized.get(name);
  }

  /**
   * Check if algebra exists
   */
  has(name: string): boolean {
    return this.algebras.has(name);
  }

  /**
   * Check if finalized algebra exists
   */
  hasFinalized(name: string): boolean {
    return this.finalized.has(name);
  }

  /**
   * List all algebras
   */
  listAll(): Array<{name: string; class: string; properties: string}> {
    return Array.from(this.algebras.entries()).map(([name, alg]) => ({
      name,
      class: alg.class,
      properties: this.describeProperties(alg.properties),
    }));
  }

  /**
   * List all finalized algebras
   */
  listFinalized(): Array<{name: string; baseClass: string}> {
    return Array.from(this.finalized.entries()).map(([name, fin]) => ({
      name,
      baseClass: fin.algebra.class,
    }));
  }

  /**
   * Get evolution history
   */
  getEvolutionLog(): Array<{timestamp: Date; name: string; class: string}> {
    return [...this.evolutionLog];
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalAlgebras: number;
    totalFinalized: number;
    byClass: Record<string, number>;
    evolutionCount: number;
  } {
    const byClass: Record<string, number> = {};

    for (const alg of this.algebras.values()) {
      byClass[alg.class] = (byClass[alg.class] || 0) + 1;
    }

    return {
      totalAlgebras: this.algebras.size,
      totalFinalized: this.finalized.size,
      byClass,
      evolutionCount: this.evolutionLog.length,
    };
  }

  /**
   * Find algebras by class
   */
  findByClass(algebraClass: string): Array<{name: string; algebra: ClassifiedAlgebra<any, any>}> {
    const results: Array<{name: string; algebra: ClassifiedAlgebra<any, any>}> = [];

    for (const [name, alg] of this.algebras.entries()) {
      if (alg.class === algebraClass) {
        results.push({name, algebra: alg});
      }
    }

    return results;
  }

  /**
   * Find parallelizable algebras
   */
  findParallelizable(): Array<{name: string; algebra: ClassifiedAlgebra<any, any>}> {
    const results: Array<{name: string; algebra: ClassifiedAlgebra<any, any>}> = [];

    for (const [name, alg] of this.algebras.entries()) {
      if (alg.implications.parallelizable) {
        results.push({name, algebra: alg});
      }
    }

    return results;
  }

  /**
   * Clear registry (for testing)
   */
  clear(): void {
    this.algebras.clear();
    this.finalized.clear();
    this.evolutionLog = [];
  }

  private describeProperties(props: AlgebraProperties): string {
    const parts: string[] = [];
    if (props.associative) parts.push('associative');
    if (props.commutative) parts.push('commutative');
    if (props.identity !== null) parts.push(`identity: ${JSON.stringify(props.identity)}`);
    if (props.idempotent) parts.push('idempotent');
    if (props.hasInverse) parts.push('invertible');
    return parts.join(', ');
  }

  private describeCapabilities(impl: any): string {
    const parts: string[] = [];
    if (impl.parallelizable) parts.push('parallelizable');
    if (impl.safeForUnordered) parts.push('order-independent');
    if (impl.hasIdentity) parts.push('safe for empty');
    if (impl.safeForDuplicates) parts.push('idempotent');
    return parts.join(', ');
  }
}

/**
 * Global registry instance
 *
 * This is the living ontological database shared across the system.
 */
export const globalRegistry = new AlgebraRegistry();
