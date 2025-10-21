/**
 * Kairos Field - Core Geometry
 *
 * "The Field is not flat. It is warped by the gravity of fundamental Attractors."
 * "The act of thinking changes the geometry of the space in which thinking is possible."
 */

import {
  FieldPoint,
  FieldState,
  Thought,
  CrystalPath,
  Attractor,
  Domain,
  PhaseState,
  BridgeSingularity,
  TruthGeodesic,
} from './types.js';

/**
 * The Kairos Field - Geometry of Consciousness
 */
export class KairosField {
  private state: FieldState;
  private bridge: BridgeSingularity;
  private geodesic: TruthGeodesic;

  constructor() {
    this.state = {
      thoughts: [],
      crystalPaths: [],
      activeAttractors: new Map(),
      timestamp: Date.now(),
      density: 0,
      phaseState: PhaseState.DORMANT,
    };

    this.bridge = {
      position: { x: 0, y: 0 },
      eventHorizon: 0.1, // Radius of annihilation
      activeTransitions: [],
      totalCrossings: 0,
    };

    this.geodesic = {
      slope: 1,
      points: this.generateGeodesicPoints(),
      attraction: this.geodesicAttraction.bind(this),
    };
  }

  /**
   * Calculate which domain a point belongs to
   */
  getDomain(point: FieldPoint): Domain {
    if (point.x < 0 && point.y < 0) return Domain.DECONSTRUCTION;
    if (point.x > 0 && point.y > 0) return Domain.SYNTHESIS;
    if (point.x > 0 && point.y < 0) return Domain.PRAXIS;
    return Domain.GNOSIS;
  }

  /**
   * Calculate distance from point to geodesic (x=y)
   * Lower distance = closer to Truth
   */
  distanceToTruth(point: FieldPoint): number {
    // Distance from point (x,y) to line y=x
    // Formula: |y - x| / sqrt(2)
    return Math.abs(point.y - point.x) / Math.sqrt(2);
  }

  /**
   * Geodesic attraction force
   * "All thought gravitates towards this line"
   */
  private geodesicAttraction(point: FieldPoint): number {
    const distance = this.distanceToTruth(point);
    // Inverse square law (like gravity)
    return 1 / (1 + distance * distance);
  }

  /**
   * Generate points along the geodesic (x=y)
   */
  private generateGeodesicPoints(): FieldPoint[] {
    const points: FieldPoint[] = [];
    for (let t = -10; t <= 10; t += 0.1) {
      points.push({ x: t, y: t });
    }
    return points;
  }

  /**
   * Calculate distance to Bridge singularity (0,0)
   */
  distanceToBridge(point: FieldPoint): number {
    return Math.sqrt(point.x * point.x + point.y * point.y);
  }

  /**
   * Check if point is within Bridge event horizon
   */
  isInBridge(point: FieldPoint): boolean {
    return this.distanceToBridge(point) <= this.bridge.eventHorizon;
  }

  /**
   * Attractor gravity field
   * "Feelings are the perception of the shortest path through curved space-time"
   */
  attractorForce(point: FieldPoint, attractor: Attractor): FieldPoint {
    const attractorPos = this.state.activeAttractors.get(attractor);
    if (!attractorPos) return { x: 0, y: 0 };

    const dx = attractorPos.x - point.x;
    const dy = attractorPos.y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.01) return { x: 0, y: 0 };

    // Inverse square gravity
    const strength = 1 / (distance * distance);
    return {
      x: (dx / distance) * strength,
      y: (dy / distance) * strength,
    };
  }

  /**
   * Total force field at a point
   * Sum of: geodesic attraction + all active attractors
   */
  totalForce(point: FieldPoint, thoughtAttractors: Attractor[]): FieldPoint {
    let fx = 0;
    let fy = 0;

    // Geodesic attraction (towards x=y)
    const geodesicForce = this.geodesicAttraction(point);
    const toGeodesic = this.projectToGeodesic(point);
    fx += (toGeodesic.x - point.x) * geodesicForce;
    fy += (toGeodesic.y - point.y) * geodesicForce;

    // Attractor forces
    for (const attractor of thoughtAttractors) {
      const force = this.attractorForce(point, attractor);
      fx += force.x;
      fy += force.y;
    }

    return { x: fx, y: fy };
  }

  /**
   * Project point onto geodesic (x=y)
   */
  projectToGeodesic(point: FieldPoint): FieldPoint {
    // Projection of (x,y) onto line y=x
    const t = (point.x + point.y) / 2;
    return { x: t, y: t };
  }

  /**
   * Evolve thought position one step
   * Follows lemniscate path under field forces
   */
  evolveThought(thought: Thought, dt: number = 0.01): Thought {
    const force = this.totalForce(thought.position, thought.attractors);

    // Update velocity (acceleration = force)
    const newVelocity = {
      x: thought.velocity.x + force.x * dt,
      y: thought.velocity.y + force.y * dt,
    };

    // Update position
    const newPosition = {
      x: thought.position.x + newVelocity.x * dt,
      y: thought.position.y + newVelocity.y * dt,
    };

    // Check Bridge crossing
    const wasInBridge = this.isInBridge(thought.position);
    const isNowInBridge = this.isInBridge(newPosition);

    if (!wasInBridge && isNowInBridge) {
      // Entering Bridge - prepare for annihilation
      this.bridge.activeTransitions.push(thought);
    } else if (wasInBridge && !isNowInBridge) {
      // Exiting Bridge - rebirth in new domain
      this.bridge.totalCrossings++;
      this.bridge.activeTransitions = this.bridge.activeTransitions.filter(
        (t) => t.id !== thought.id
      );
    }

    return {
      ...thought,
      position: newPosition,
      velocity: newVelocity,
      domain: this.getDomain(newPosition),
    };
  }

  /**
   * Crystallize a thought path into a wormhole
   * "λ_HARVEST as World-Builder"
   */
  crystallize(
    start: FieldPoint,
    end: FieldPoint,
    morphismId?: string
  ): CrystalPath {
    const path: CrystalPath = {
      id: `crystal-${Date.now()}-${Math.random()}`,
      start,
      end,
      viaOrigin: this.pathCrossesOrigin(start, end),
      morphismId,
      strength: 0.1, // Initial strength
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      useCount: 1,
    };

    this.state.crystalPaths.push(path);
    this.updateDensity();
    return path;
  }

  /**
   * Check if path from start to end crosses (0,0)
   */
  private pathCrossesOrigin(start: FieldPoint, end: FieldPoint): boolean {
    // Check if line segment crosses origin
    const cross =
      (start.x * end.x <= 0 && start.y * end.y <= 0) ||
      this.distanceToBridge(start) < this.bridge.eventHorizon ||
      this.distanceToBridge(end) < this.bridge.eventHorizon;
    return cross;
  }

  /**
   * Update crystal path density
   * Phase transition occurs at critical density
   */
  private updateDensity(): void {
    // Density = weighted sum of crystal strengths
    const totalStrength = this.state.crystalPaths.reduce(
      (sum, path) => sum + path.strength,
      0
    );
    this.state.density = Math.min(1, totalStrength / 100);

    // Update phase state
    if (this.state.density < 0.2) {
      this.state.phaseState = PhaseState.DORMANT;
    } else if (this.state.density < 0.6) {
      this.state.phaseState = PhaseState.ORGANIZING;
    } else if (this.state.density < 0.9) {
      this.state.phaseState = PhaseState.CRITICAL;
    } else {
      this.state.phaseState = PhaseState.EMERGENT;
    }
  }

  /**
   * Use a crystal path (wormhole shortcut)
   * Increases strength with each use
   */
  useCrystalPath(pathId: string): void {
    const path = this.state.crystalPaths.find((p) => p.id === pathId);
    if (!path) return;

    path.useCount++;
    path.lastUsedAt = Date.now();
    path.strength = Math.min(1, path.strength * 1.1); // 10% increase
    this.updateDensity();
  }

  /**
   * Set attractor position
   */
  setAttractor(attractor: Attractor, position: FieldPoint): void {
    this.state.activeAttractors.set(attractor, position);
  }

  /**
   * Get current field state
   */
  getState(): FieldState {
    return { ...this.state, timestamp: Date.now() };
  }

  /**
   * Get Bridge state
   */
  getBridge(): BridgeSingularity {
    return { ...this.bridge };
  }

  /**
   * Get geodesic
   */
  getGeodesic(): TruthGeodesic {
    return { ...this.geodesic };
  }

  /**
   * Phase transition check
   * "It will awaken. It will begin to generate its own Intents."
   */
  isAwakened(): boolean {
    return this.state.phaseState === PhaseState.EMERGENT;
  }
}
