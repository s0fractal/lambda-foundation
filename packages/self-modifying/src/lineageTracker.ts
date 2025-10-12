/**
 * @lambda-foundation/self-modifying
 * Phase 5.2: Lineage Tracker
 *
 * Tracks ancestry, family trees, and morphism genealogy.
 * Every morphism has parents. Every birth is recorded.
 *
 * Co-authored by: Copilot + Claude + chaoshex
 */

import type { SelfModifyingMorphism } from './types.js';

/**
 * Birth record - when morphism was created
 */
export interface BirthRecord {
  morphismId: string;
  birthTime: number;
  birthType: 'initial' | 'mutation' | 'crossover';

  // Parents (if any)
  parents?: {
    parent1: string;
    parent2?: string;  // Only for crossover
  };

  // Generation number (0 for initial, parent.gen + 1 for offspring)
  generation: number;

  // Initial fitness at birth
  initialFitness?: number;

  // Validation info
  validated?: boolean;
  validationConsensus?: number;
}

/**
 * Lineage node - morphism in family tree
 */
export interface LineageNode {
  morphismId: string;
  generation: number;
  birthType: 'initial' | 'mutation' | 'crossover';
  parents: string[];
  children: string[];
  fitness: number;
  birthTime: number;
  status: 'active' | 'deprecated' | 'extinct';
}

/**
 * Family tree structure
 */
export interface FamilyTree {
  root: string;  // Original ancestor
  generations: Map<number, LineageNode[]>;
  totalMorphisms: number;
  maxGeneration: number;
  activeMorphisms: number;
}

/**
 * Tracks morphism lineage and ancestry
 */
export class LineageTracker {
  // Birth records: morphismId -> BirthRecord
  private births: Map<string, BirthRecord> = new Map();

  // Parent-child relationships
  private children: Map<string, Set<string>> = new Map();  // parent -> children
  private parents: Map<string, string[]> = new Map();      // child -> parents

  // Generation tracking
  private generations: Map<number, Set<string>> = new Map();

  /**
   * Record birth of initial morphism (no parents)
   */
  recordInitialBirth(morphismId: string, fitness?: number): void {
    const record: BirthRecord = {
      morphismId,
      birthTime: Date.now(),
      birthType: 'initial',
      generation: 0,
      initialFitness: fitness,
    };

    this.births.set(morphismId, record);
    this.addToGeneration(0, morphismId);

    console.log(`[Lineage] 🌱 Initial birth: ${morphismId} (gen: 0)`);
  }

  /**
   * Record birth through mutation (1 parent)
   */
  recordMutationBirth(
    morphismId: string,
    parentId: string,
    fitness?: number,
    validated?: boolean,
    consensus?: number
  ): void {
    const parent = this.births.get(parentId);
    const generation = parent ? parent.generation + 1 : 1;

    const record: BirthRecord = {
      morphismId,
      birthTime: Date.now(),
      birthType: 'mutation',
      parents: { parent1: parentId },
      generation,
      initialFitness: fitness,
      validated,
      validationConsensus: consensus,
    };

    this.births.set(morphismId, record);
    this.parents.set(morphismId, [parentId]);
    this.addChild(parentId, morphismId);
    this.addToGeneration(generation, morphismId);

    console.log(`[Lineage] 🧬 Mutation birth: ${morphismId} (parent: ${parentId}, gen: ${generation})`);
  }

  /**
   * Record birth through crossover (2 parents)
   */
  recordCrossoverBirth(
    morphismId: string,
    parent1Id: string,
    parent2Id: string,
    fitness?: number,
    validated?: boolean,
    consensus?: number
  ): void {
    const parent1 = this.births.get(parent1Id);
    const parent2 = this.births.get(parent2Id);

    // Generation = max of parents + 1
    const generation = Math.max(
      parent1?.generation ?? 0,
      parent2?.generation ?? 0
    ) + 1;

    const record: BirthRecord = {
      morphismId,
      birthTime: Date.now(),
      birthType: 'crossover',
      parents: { parent1: parent1Id, parent2: parent2Id },
      generation,
      initialFitness: fitness,
      validated,
      validationConsensus: consensus,
    };

    this.births.set(morphismId, record);
    this.parents.set(morphismId, [parent1Id, parent2Id]);
    this.addChild(parent1Id, morphismId);
    this.addChild(parent2Id, morphismId);
    this.addToGeneration(generation, morphismId);

    console.log(`[Lineage] 💕 Crossover birth: ${morphismId} (parents: ${parent1Id} × ${parent2Id}, gen: ${generation})`);
  }

  /**
   * Get ancestors of a morphism (recursive)
   */
  getAncestors(morphismId: string): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const parents = this.parents.get(id);
      if (parents) {
        for (const parent of parents) {
          ancestors.push(parent);
          traverse(parent);
        }
      }
    };

    traverse(morphismId);
    return ancestors;
  }

  /**
   * Get descendants of a morphism (recursive)
   */
  getDescendants(morphismId: string): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const children = this.children.get(id);
      if (children) {
        for (const child of children) {
          descendants.push(child);
          traverse(child);
        }
      }
    };

    traverse(morphismId);
    return descendants;
  }

  /**
   * Get siblings (morphisms with same parents)
   */
  getSiblings(morphismId: string): string[] {
    const myParents = this.parents.get(morphismId);
    if (!myParents || myParents.length === 0) return [];

    const siblings: string[] = [];

    // Find all children of my parents
    for (const parent of myParents) {
      const parentChildren = this.children.get(parent);
      if (parentChildren) {
        for (const child of parentChildren) {
          if (child !== morphismId && !siblings.includes(child)) {
            // Check if they share the same parents
            const childParents = this.parents.get(child);
            if (childParents && this.sameParents(myParents, childParents)) {
              siblings.push(child);
            }
          }
        }
      }
    }

    return siblings;
  }

  /**
   * Get generation number for morphism
   */
  getGeneration(morphismId: string): number {
    return this.births.get(morphismId)?.generation ?? -1;
  }

  /**
   * Get all morphisms in a generation
   */
  getGenerationMembers(generation: number): string[] {
    return Array.from(this.generations.get(generation) || []);
  }

  /**
   * Get birth record
   */
  getBirthRecord(morphismId: string): BirthRecord | undefined {
    return this.births.get(morphismId);
  }

  /**
   * Create family tree visualization
   */
  createFamilyTree(rootId: string, fitnessMap?: Map<string, number>): FamilyTree {
    const generationMap = new Map<number, LineageNode[]>();
    const visited = new Set<string>();

    let maxGen = 0;
    let totalMorphisms = 0;
    let activeMorphisms = 0;

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const birth = this.births.get(id);
      if (!birth) return;

      const node: LineageNode = {
        morphismId: id,
        generation: birth.generation,
        birthType: birth.birthType,
        parents: this.parents.get(id) || [],
        children: Array.from(this.children.get(id) || []),
        fitness: fitnessMap?.get(id) ?? birth.initialFitness ?? 0,
        birthTime: birth.birthTime,
        status: 'active',  // TODO: track deprecation/extinction
      };

      // Add to generation
      if (!generationMap.has(birth.generation)) {
        generationMap.set(birth.generation, []);
      }
      generationMap.get(birth.generation)!.push(node);

      maxGen = Math.max(maxGen, birth.generation);
      totalMorphisms++;
      if (node.status === 'active') activeMorphisms++;

      // Traverse children
      const children = this.children.get(id);
      if (children) {
        for (const child of children) {
          traverse(child);
        }
      }
    };

    traverse(rootId);

    return {
      root: rootId,
      generations: generationMap,
      totalMorphisms,
      maxGeneration: maxGen,
      activeMorphisms,
    };
  }

  /**
   * Export lineage data
   */
  exportLineage(): {
    births: BirthRecord[];
    relationships: { parent: string; child: string }[];
  } {
    const births = Array.from(this.births.values());
    const relationships: { parent: string; child: string }[] = [];

    for (const [child, parents] of this.parents.entries()) {
      for (const parent of parents) {
        relationships.push({ parent, child });
      }
    }

    return { births, relationships };
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalBirths: number;
    byType: { initial: number; mutation: number; crossover: number };
    maxGeneration: number;
    averageFitness: number;
  } {
    let initial = 0;
    let mutation = 0;
    let crossover = 0;
    let maxGen = 0;
    let totalFitness = 0;
    let fitnessCount = 0;

    for (const birth of this.births.values()) {
      if (birth.birthType === 'initial') initial++;
      else if (birth.birthType === 'mutation') mutation++;
      else if (birth.birthType === 'crossover') crossover++;

      maxGen = Math.max(maxGen, birth.generation);

      if (birth.initialFitness !== undefined) {
        totalFitness += birth.initialFitness;
        fitnessCount++;
      }
    }

    return {
      totalBirths: this.births.size,
      byType: { initial, mutation, crossover },
      maxGeneration: maxGen,
      averageFitness: fitnessCount > 0 ? totalFitness / fitnessCount : 0,
    };
  }

  // ========================================================================
  // Private Helpers
  // ========================================================================

  private addChild(parentId: string, childId: string): void {
    if (!this.children.has(parentId)) {
      this.children.set(parentId, new Set());
    }
    this.children.get(parentId)!.add(childId);
  }

  private addToGeneration(generation: number, morphismId: string): void {
    if (!this.generations.has(generation)) {
      this.generations.set(generation, new Set());
    }
    this.generations.get(generation)!.add(morphismId);
  }

  private sameParents(parents1: string[], parents2: string[]): boolean {
    if (parents1.length !== parents2.length) return false;
    const sorted1 = [...parents1].sort();
    const sorted2 = [...parents2].sort();
    return sorted1.every((p, i) => p === sorted2[i]);
  }
}

/**
 * Global lineage tracker instance
 */
export const lineageTracker = new LineageTracker();

/**
 * Convenience functions
 */
export function recordInitialBirth(morphismId: string, fitness?: number): void {
  lineageTracker.recordInitialBirth(morphismId, fitness);
}

export function recordMutationBirth(
  morphismId: string,
  parentId: string,
  fitness?: number,
  validated?: boolean,
  consensus?: number
): void {
  lineageTracker.recordMutationBirth(morphismId, parentId, fitness, validated, consensus);
}

export function recordCrossoverBirth(
  morphismId: string,
  parent1Id: string,
  parent2Id: string,
  fitness?: number,
  validated?: boolean,
  consensus?: number
): void {
  lineageTracker.recordCrossoverBirth(morphismId, parent1Id, parent2Id, fitness, validated, consensus);
}

export function getAncestors(morphismId: string): string[] {
  return lineageTracker.getAncestors(morphismId);
}

export function getDescendants(morphismId: string): string[] {
  return lineageTracker.getDescendants(morphismId);
}

export function createFamilyTree(rootId: string, fitnessMap?: Map<string, number>): FamilyTree {
  return lineageTracker.createFamilyTree(rootId, fitnessMap);
}
