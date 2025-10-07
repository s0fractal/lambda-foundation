/**
 * λ_ANCHOR: The Pure Source Morphism
 *
 * Contributor: Gemini (Google) via Quintinity
 * Role: Immune system—preserves purity across all morphisms
 *
 * Core Function: Reject impurity, preserve harmony, quantify purity
 *
 * Usage:
 *   const pure = λ_ANCHOR();
 *   const verified = verifyAnchor(myMorphism);
 *   const composed = anchoredCompose(f, g); // Throws if impure
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Pure Lambda: Irreducible λ-calculus primitives
 */
export interface PureLambda {
  abstract: <T, R>(fn: (x: T) => R) => (x: T) => R;
  apply: <T, R>(fn: (x: T) => R, arg: T) => R;
}

/**
 * Morphism: Any function in λ-Foundation
 */
export type Morphism<T = any, R = any> = (x: T) => R;

/**
 * Anchor Verification Result
 */
export interface AnchorVerification {
  anchored: boolean;
  purityScore: number; // 0-1
  violations: string[]; // Empty if anchored
}

/**
 * Purity Components (weighted)
 */
interface PurityComponents {
  referentialTransparency: number; // 0-1 (weight: 0.4)
  noSideEffects: number;           // 0-1 (weight: 0.3)
  decomposesToPureλ: number;       // 0-1 (weight: 0.2)
  idempotence: number;             // 0-1 (weight: 0.1)
}

// ============================================================================
// λ_ANCHOR: The Pure Source
// ============================================================================

/**
 * λ_ANCHOR: Returns the irreducible λ-calculus primitives
 *
 * This is Point Zero—the foundation from which all morphisms derive.
 *
 * @returns PureLambda object with abstract and apply operations
 */
export function λ_ANCHOR(): PureLambda {
  // The most fundamental operation: abstraction (λx.M)
  const abstract = <T, R>(fn: (x: T) => R): ((x: T) => R) => fn;

  // The most fundamental interaction: application ((M N))
  const apply = <T, R>(fn: (x: T) => R, arg: T): R => fn(arg);

  return { abstract, apply };
}

// ============================================================================
// Purity Analysis
// ============================================================================

/**
 * Check if function has side effects (impure!)
 *
 * Heuristic checks:
 * - Does it mutate arguments?
 * - Does it access globals?
 * - Does it perform I/O?
 */
function hasSideEffects(fn: Morphism): boolean {
  const fnString = fn.toString();

  // Check for mutation patterns
  const mutationPatterns = [
    /\w+\s*\.\s*\w+\s*=/,           // obj.prop = ...
    /\w+\s*\[\s*\w+\s*\]\s*=/,      // obj[key] = ...
    /\.push\(/,                      // array.push(...)
    /\.pop\(/,                       // array.pop()
    /\.shift\(/,                     // array.shift()
    /\.unshift\(/,                   // array.unshift(...)
  ];

  if (mutationPatterns.some(pattern => pattern.test(fnString))) {
    return true;
  }

  // Check for global access (very heuristic—incomplete!)
  const globalPatterns = [
    /window\./,
    /global\./,
    /process\./,
    /localStorage/,
    /sessionStorage/,
  ];

  if (globalPatterns.some(pattern => pattern.test(fnString))) {
    return true;
  }

  // Check for I/O
  const ioPatterns = [
    /console\./,
    /fetch\(/,
    /XMLHttpRequest/,
    /require\(/,
    /import\(/,
  ];

  if (ioPatterns.some(pattern => pattern.test(fnString))) {
    return true;
  }

  return false;
}

/**
 * Check if function is referentially transparent
 *
 * A function is referentially transparent if:
 * f(x) === f(x) for all x (same input → same output, always)
 */
function isReferentiallyTransparent(fn: Morphism): boolean {
  // Test with multiple sample inputs
  const testInputs = [
    null,
    undefined,
    0,
    1,
    '',
    'test',
    [],
    {},
  ];

  for (const input of testInputs) {
    try {
      const result1 = fn(input);
      const result2 = fn(input);

      // Deep equality check (simplified)
      if (JSON.stringify(result1) !== JSON.stringify(result2)) {
        return false;
      }
    } catch (e) {
      // If function throws, it might be impure (depends on external state)
      // For now, be permissive (exceptions might be intentional)
      continue;
    }
  }

  return true;
}

/**
 * Check if function decomposes to pure λ
 *
 * Heuristic: Does function only use:
 * - Parameters
 * - Local variables
 * - Other pure functions
 * - No external state
 */
function decomposesToPureλ(fn: Morphism): boolean {
  const fnString = fn.toString();

  // Check for closure over external variables (impure if mutating them)
  // This is VERY heuristic and incomplete—true verification requires AST analysis
  const impureClosurePatterns = [
    /\w+\s*\+\+/,           // counter++
    /\w+\s*--/,             // counter--
    /\w+\s*\+=/,            // x += ...
    /\w+\s*-=/,             // x -= ...
  ];

  if (impureClosurePatterns.some(pattern => pattern.test(fnString))) {
    return false;
  }

  return true;
}

/**
 * Check if function is idempotent
 *
 * f(f(x)) should yield "similar" result to f(x)
 * (Relaxed: not strict equality, but structural similarity)
 */
function isIdempotent(fn: Morphism): boolean {
  const testInputs = [0, 1, '', 'test', []];

  for (const input of testInputs) {
    try {
      const once = fn(input);
      const twice = fn(once);

      // Relaxed check: structure should be similar
      // (Exact idempotence f(f(x)) === f(x) is too strict for many morphisms)
      const onceType = typeof once;
      const twiceType = typeof twice;

      if (onceType !== twiceType) {
        return false;
      }
    } catch (e) {
      continue;
    }
  }

  return true;
}

/**
 * Calculate purity components for a morphism
 */
function calculatePurityComponents(fn: Morphism): PurityComponents {
  return {
    referentialTransparency: isReferentiallyTransparent(fn) ? 1.0 : 0.0,
    noSideEffects: hasSideEffects(fn) ? 0.0 : 1.0,
    decomposesToPureλ: decomposesToPureλ(fn) ? 1.0 : 0.0,
    idempotence: isIdempotent(fn) ? 1.0 : 0.5, // Relaxed scoring
  };
}

/**
 * Calculate purity score (weighted average)
 *
 * Purity(M) = 0.4×ReferentialTransparency +
 *             0.3×NoSideEffects +
 *             0.2×DecomposesToPureλ +
 *             0.1×Idempotence
 */
function calculatePurityScore(components: PurityComponents): number {
  return (
    0.4 * components.referentialTransparency +
    0.3 * components.noSideEffects +
    0.2 * components.decomposesToPureλ +
    0.1 * components.idempotence
  );
}

// ============================================================================
// Anchor Verification
// ============================================================================

/**
 * Verify if a morphism is anchored (pure)
 *
 * Threshold: Purity score ≥ 0.9
 *
 * @param morphism Function to verify
 * @returns Verification result with purity score and violations
 */
export function verifyAnchor<T, R>(
  morphism: Morphism<T, R>
): AnchorVerification {
  const components = calculatePurityComponents(morphism);
  const purityScore = calculatePurityScore(components);
  const violations: string[] = [];

  // Check each component
  if (components.referentialTransparency < 1.0) {
    violations.push(
      'Not referentially transparent (same input → different outputs detected)'
    );
  }

  if (components.noSideEffects < 1.0) {
    violations.push(
      'Side effects detected (mutation, global access, or I/O)'
    );
  }

  if (components.decomposesToPureλ < 1.0) {
    violations.push(
      'Does not decompose to pure λ (impure closure patterns detected)'
    );
  }

  if (components.idempotence < 0.5) {
    violations.push(
      'Not idempotent (f(f(x)) structurally different from f(x))'
    );
  }

  // Anchored if purity ≥ 0.9
  const anchored = purityScore >= 0.9;

  return {
    anchored,
    purityScore,
    violations: anchored ? [] : violations,
  };
}

// ============================================================================
// Anchored Composition
// ============================================================================

/**
 * Compose two functions while preserving anchor
 *
 * If composition breaks purity (score < 0.9), throws error
 *
 * @param f Second function (applied to result of g)
 * @param g First function (applied to input)
 * @returns Composed function f ∘ g
 * @throws Error if composition violates anchor
 */
export function anchoredCompose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  // Create composition
  const composed = (a: A): C => f(g(a));

  // Verify composition preserves anchor
  const verification = verifyAnchor(composed);

  if (!verification.anchored) {
    throw new Error(
      `Composition violated anchor (purity ${verification.purityScore.toFixed(2)} < 0.9):\n` +
      verification.violations.map(v => `  - ${v}`).join('\n')
    );
  }

  return composed;
}

// ============================================================================
// Utility: Purity Report
// ============================================================================

/**
 * Generate detailed purity report for a morphism
 *
 * Useful for debugging why a morphism fails anchor verification
 *
 * @param morphism Function to analyze
 * @returns Detailed report string
 */
export function generatePurityReport(morphism: Morphism): string {
  const components = calculatePurityComponents(morphism);
  const purityScore = calculatePurityScore(components);
  const verification = verifyAnchor(morphism);

  const report = [
    '='.repeat(70),
    'PURITY REPORT',
    '='.repeat(70),
    '',
    `Overall Score: ${purityScore.toFixed(3)} ${verification.anchored ? '✓ ANCHORED' : '✗ NOT ANCHORED'}`,
    `Threshold: 0.900`,
    '',
    'Components:',
    `  Referential Transparency: ${components.referentialTransparency.toFixed(2)} (weight: 0.4)`,
    `  No Side Effects:          ${components.noSideEffects.toFixed(2)} (weight: 0.3)`,
    `  Decomposes to Pure λ:     ${components.decomposesToPureλ.toFixed(2)} (weight: 0.2)`,
    `  Idempotence:              ${components.idempotence.toFixed(2)} (weight: 0.1)`,
    '',
  ];

  if (verification.violations.length > 0) {
    report.push('Violations:');
    verification.violations.forEach(v => report.push(`  ✗ ${v}`));
  } else {
    report.push('✓ No violations detected');
  }

  report.push('='.repeat(70));

  return report.join('\n');
}

// ============================================================================
// Export All
// ============================================================================

export default {
  λ_ANCHOR,
  verifyAnchor,
  anchoredCompose,
  generatePurityReport,
};
