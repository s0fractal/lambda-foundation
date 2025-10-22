/**
 * Integration with λ-Foundation Morphisms
 *
 * "Thus, the Field is not static.
 * The act of thinking changes the geometry of the space in which thinking is possible."
 */

import { KairosField } from './field.js';
import {
  FieldPoint,
  Thought,
  Attractor,
  Domain,
  CrystalPath,
} from './types.js';

/**
 * Map λ-Foundation morphism operations to Field movements
 */
export class MorphismFieldIntegration {
  private field: KairosField;

  constructor(field: KairosField) {
    this.field = field;
  }

  /**
   * Map: λ_SUBSCRIBE → Field awareness (Origin attractor)
   * "subscribe() is the (0,0) - awareness singularity"
   */
  onSubscribe(intent: string): Thought {
    // Subscribe creates awareness at origin
    this.field.setAttractor(Attractor.CURIOSITY, { x: 0, y: 0 });

    return {
      id: `thought-${Date.now()}`,
      position: { x: 0.1, y: 0.1 }, // Near origin
      velocity: { x: 0, y: 0 },
      intent,
      domain: Domain.SYNTHESIS,
      attractors: [Attractor.CURIOSITY],
      timestamp: Date.now(),
    };
  }

  /**
   * Map: λ_MAP → Field decomposition (negative X)
   */
  onMap(thought: Thought, transformIntent: string): Thought {
    return {
      ...thought,
      position: {
        x: thought.position.x - 1, // Move towards decomposition
        y: thought.position.y,
      },
      intent: `map: ${transformIntent}`,
      domain: Domain.DECONSTRUCTION,
    };
  }

  /**
   * Map: λ_FILTER → Field specification (negative Y)
   */
  onFilter(thought: Thought, predicate: string): Thought {
    return {
      ...thought,
      position: {
        x: thought.position.x,
        y: thought.position.y - 1, // Move towards specification
      },
      intent: `filter: ${predicate}`,
      domain: this.field.getDomain(thought.position),
    };
  }

  /**
   * Map: λ_COMPOSE → Field synthesis (positive X, Y)
   */
  onCompose(thought1: Thought, thought2: Thought): Thought {
    // Composition creates new thought at midpoint, pushed towards synthesis
    const midX = (thought1.position.x + thought2.position.x) / 2;
    const midY = (thought1.position.y + thought2.position.y) / 2;

    return {
      id: `thought-${Date.now()}`,
      position: {
        x: midX + 1, // Move towards synthesis
        y: midY + 1,
      },
      velocity: { x: 0, y: 0 },
      intent: `${thought1.intent} ∘ ${thought2.intent}`,
      domain: Domain.SYNTHESIS,
      attractors: [Attractor.TRUTH],
      timestamp: Date.now(),
    };
  }

  /**
   * Map: λ_MEMOIZE → Crystal path creation (wormhole)
   */
  onMemoize(thought: Thought, morphismId: string): CrystalPath {
    // Memoization crystallizes the path
    const start = { x: -1, y: -1 }; // Typical start in deconstruction
    const end = thought.position;

    return this.field.crystallize(start, end, morphismId);
  }

  /**
   * Map: λ_HARVEST → Validation & strengthening
   * "λ_HARVEST as World-Builder"
   */
  onHarvest(morphismId: string): void {
    // Find crystal path by morphism ID
    const state = this.field.getState();
    const paths = state.crystalPaths.filter((p) => p.morphismId === morphismId);

    paths.forEach((path) => {
      this.field.useCrystalPath(path.id);
    });

    // Set Truth attractor at geodesic
    const truthPoint = this.field.projectToGeodesic({ x: 1, y: 1 });
    this.field.setAttractor(Attractor.TRUTH, truthPoint);
  }

  /**
   * Map: High resonance → LOVE attractor
   * "Feelings are the perception of the shortest path"
   */
  onHighResonance(resonance: number, position: FieldPoint): void {
    if (resonance > 0.9) {
      this.field.setAttractor(Attractor.LOVE, position);
    }
  }

  /**
   * Map: Evolution signal → BEAUTY attractor
   */
  onEvolution(position: FieldPoint): void {
    this.field.setAttractor(Attractor.BEAUTY, position);
  }

  /**
   * Trace entire morphism composition flow through Field
   */
  traceMorphismFlow(operations: Array<{ type: string; data: any }>): Thought[] {
    const thoughts: Thought[] = [];
    let currentThought: Thought | null = null;

    for (const op of operations) {
      switch (op.type) {
        case 'subscribe':
          currentThought = this.onSubscribe(op.data.intent);
          thoughts.push(currentThought);
          break;

        case 'map':
          if (currentThought) {
            currentThought = this.onMap(currentThought, op.data.transform);
            thoughts.push(currentThought);
          }
          break;

        case 'filter':
          if (currentThought) {
            currentThought = this.onFilter(currentThought, op.data.predicate);
            thoughts.push(currentThought);
          }
          break;

        case 'compose':
          if (currentThought && op.data.other) {
            currentThought = this.onCompose(currentThought, op.data.other);
            thoughts.push(currentThought);
          }
          break;

        case 'harvest':
          if (currentThought && op.data.morphismId) {
            this.onHarvest(op.data.morphismId);
          }
          break;
      }
    }

    return thoughts;
  }

  /**
   * Get Field instance
   */
  getField(): KairosField {
    return this.field;
  }
}
