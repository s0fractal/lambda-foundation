/**
 * Lemniscate Path (∞) - The Motion of Thought
 *
 * "The path of a single thought, guided by these dipoles, forms a lemniscate (∞).
 * It is a continuous, self-completing loop that, in its full topology,
 * creates a Klein Bottle."
 */

import { FieldPoint, LemniscatePath, Thought, Dipole } from './types.js';

/**
 * Generate lemniscate path points - CENTERED AT (0,0)
 *
 * One loop in Deconstruction (-X, -Y)
 * One loop in Synthesis (+X, +Y)
 * MUST pass through Bridge (0,0) - fundamental act of creation
 *
 * Parametric form rotated 45° to align with Deconstruction ↔ Synthesis axis
 */
export function generateLemniscate(
  scale: number = 2,
  steps: number = 200
): FieldPoint[] {
  const points: FieldPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const denominator = 1 + sinT * sinT;

    // Standard lemniscate
    const x = (scale * cosT) / denominator;
    const y = (scale * sinT * cosT) / denominator;

    // Rotate 45° to align diagonal: Deconstruction (-,-) ↔ Synthesis (+,+)
    const angle = Math.PI / 4;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    points.push({
      x: x * cosA - y * sinA,
      y: x * sinA + y * cosA,
    });
  }

  return points;
}

/**
 * Generate Dipole-guided lemniscate
 * Each dipole creates tension that shapes the path
 */
export function generateDipoleLemniscate(
  dipole: Dipole,
  scale: number = 2
): FieldPoint[] {
  const points: FieldPoint[] = [];
  const steps = 200;

  switch (dipole) {
    case Dipole.DECOMPOSE_COMPOSE:
      // Horizontal lemniscate (analysis ↔ synthesis)
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const denom = 1 + sinT * sinT;
        points.push({
          x: (scale * cosT) / denom,
          y: (scale * sinT * cosT) / denom,
        });
      }
      break;

    case Dipole.FORGET_MEMOIZE:
      // Vertical lemniscate (dissolution ↔ persistence)
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const denom = 1 + cosT * cosT;
        points.push({
          x: (scale * sinT * cosT) / denom,
          y: (scale * sinT) / denom,
        });
      }
      break;

    case Dipole.SPECIFY_GENERALIZE:
      // Diagonal lemniscate (concrete ↔ abstract)
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * 2 * Math.PI;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const denom = 1 + sinT * sinT;
        const x = (scale * cosT) / denom;
        const y = (scale * sinT * cosT) / denom;
        // Rotate 45 degrees
        const angle = Math.PI / 4;
        points.push({
          x: x * Math.cos(angle) - y * Math.sin(angle),
          y: x * Math.sin(angle) + y * Math.cos(angle),
        });
      }
      break;
  }

  return points;
}

/**
 * Check if lemniscate path crosses origin (0,0)
 * All true lemniscates cross through the Bridge
 */
export function crossesOrigin(path: FieldPoint[], threshold: number = 0.1): boolean {
  return path.some((p) => Math.sqrt(p.x * p.x + p.y * p.y) < threshold);
}

/**
 * Calculate Klein Bottle transformation
 * "In its full topology, creates a Klein Bottle—
 * a single, non-orientable surface where the distinction
 * between 'internal' and 'external' ceases to exist."
 */
export function toKleinBottle(lemniscate: FieldPoint[]): {
  points3D: Array<{ x: number; y: number; z: number }>;
  isNonOrientable: boolean;
} {
  const points3D: Array<{ x: number; y: number; z: number }> = [];

  // Klein bottle parametric equations
  // u ∈ [0, 2π], v ∈ [0, 2π]
  for (let i = 0; i < lemniscate.length; i++) {
    const point = lemniscate[i];
    const u = (i / lemniscate.length) * 2 * Math.PI;
    const v = Math.atan2(point.y, point.x); // Convert 2D to angle

    const r = 4 * (1 - Math.cos(u) / 2);
    const x = 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(v + Math.PI);
    const y = 16 * Math.sin(u);
    const z = r * Math.sin(v);

    points3D.push({ x, y, z });
  }

  return {
    points3D,
    isNonOrientable: true, // Klein bottles are always non-orientable
  };
}

/**
 * Trace thought along lemniscate path
 */
export function traceLemniscatePath(
  thought: Thought,
  dipole: Dipole,
  duration: number = 1000
): LemniscatePath {
  const points = generateDipoleLemniscate(dipole);
  const bridgeCrossings = crossesOrigin(points) ? 1 : 0;

  return {
    thought,
    points,
    completedLoop: true,
    bridgeCrossings,
  };
}

/**
 * Superposition of all three dipole lemniscates
 * Creates complex interference pattern
 */
export function superposeLemniscates(): FieldPoint[] {
  const l1 = generateDipoleLemniscate(Dipole.DECOMPOSE_COMPOSE);
  const l2 = generateDipoleLemniscate(Dipole.FORGET_MEMOIZE);
  const l3 = generateDipoleLemniscate(Dipole.SPECIFY_GENERALIZE);

  const points: FieldPoint[] = [];
  const minLength = Math.min(l1.length, l2.length, l3.length);

  for (let i = 0; i < minLength; i++) {
    // Weighted superposition
    points.push({
      x: (l1[i].x + l2[i].x + l3[i].x) / 3,
      y: (l1[i].y + l2[i].y + l3[i].y) / 3,
    });
  }

  return points;
}
