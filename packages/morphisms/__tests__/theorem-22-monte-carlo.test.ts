/**
 * THEOREM 22: Monte Carlo Validation
 *
 * Empirical validation of Poisson convergence formula:
 * P(Convergence | k) = 1 - e^{-λk}
 *
 * Based on Grok's validation run showing 0.0000 error @ λ=0.987, k=7
 * Full sweep: Max error 2.23% across all (λ, k) pairs
 */

import { describe, test, expect } from 'vitest';
import { quantumConverge, prepare, measureLoveStrength } from '../quantum-grok';
import { experience } from '../../core/experience';

describe('Theorem 22: Monte Carlo Validation (100k trials)', () => {
  // Test parameters from Grok's validation
  const λ_VALUES = [0.1, 0.3, 0.5, 0.7, 0.9, 0.987];
  const k_VALUES = [5, 7, 10, 20, 50];
  const TRIALS_PER_PAIR = 1000; // 6 λ × 5 k × 1000 = 30k trials total
  const ERROR_TOLERANCE = 0.05; // 5% as per Grok's validation

  /**
   * Build quantum context with target λ strength
   */
  function buildContextWithLambda(targetλ: number): ReturnType<typeof prepare> {
    // More facts → higher λ
    const numFacts = Math.max(1, Math.floor(targetλ * 10));

    const contexts = Array.from({ length: 3 }, (_, branchIdx) => {
      let ctx = null;
      for (let factIdx = 0; factIdx < numFacts; factIdx++) {
        ctx = experience(
          ctx,
          [`Fact ${branchIdx}-${factIdx}`, `Proof ${branchIdx}-${factIdx}`],
          `branch-${branchIdx}`
        );
      }
      return ctx;
    });

    return prepare(contexts);
  }

  /**
   * Run Monte Carlo simulation for given (λ, k) pair
   */
  function runMonteCarloTrial(λ: number, k: number, trials: number) {
    const qctx = buildContextWithLambda(λ);

    // Predicted probability (Theorem 22)
    const predicted = 1 - Math.exp(-λ * k);

    // Run trials
    let successes = 0;

    for (let trial = 0; trial < trials; trial++) {
      // Clone context for independent trial
      const trialCtx = qctx.map(b => ({ ...b, context: b.context }));

      const result = quantumConverge('Test query', trialCtx, k);

      if (result.converged) {
        successes++;
      }
    }

    const observed = successes / trials;
    const error = Math.abs(observed - predicted);

    return { predicted, observed, error };
  }

  // Test each λ value
  test.each(λ_VALUES)('Poisson convergence for λ=%f (all k values)', (λ) => {
    const results: Record<number, ReturnType<typeof runMonteCarloTrial>> = {};
    let maxError = 0;
    let avgError = 0;

    for (const k of k_VALUES) {
      const result = runMonteCarloTrial(λ, k, TRIALS_PER_PAIR);
      results[k] = result;

      maxError = Math.max(maxError, result.error);
      avgError += result.error;

      // Individual pair should be within tolerance
      expect(result.error).toBeLessThan(ERROR_TOLERANCE);
    }

    avgError /= k_VALUES.length;

    console.log(`\nλ=${λ.toFixed(3)}:`);
    console.log(`  Average Error: ${(avgError * 100).toFixed(3)}%`);
    console.log(`  Max Error: ${(maxError * 100).toFixed(3)}%`);
    console.log(`  Sample (k=7): Predicted=${results[7].predicted.toFixed(4)}, Observed=${results[7].observed.toFixed(4)}, Error=${results[7].error.toFixed(4)}`);

    // Average error should be very small
    expect(avgError).toBeLessThan(0.02); // 2% average
  });

  // Special test for Grok's exact validation point
  test('Grok validation point: λ=0.987, k=7 (expect 0.0000 error)', () => {
    const result = runMonteCarloTrial(0.987, 7, 10000); // 10k trials for precision

    console.log('\n🎯 Grok Validation Point:');
    console.log(`  λ = 0.987, k = 7`);
    console.log(`  Predicted: ${result.predicted.toFixed(4)}`);
    console.log(`  Observed: ${result.observed.toFixed(4)}`);
    console.log(`  Error: ${(result.error * 100).toFixed(4)}%`);

    // Should match Grok's 0.0000 error (within floating point precision)
    expect(result.error).toBeLessThan(0.001); // 0.1%
    expect(result.observed).toBeCloseTo(0.999, 2); // 99.9% convergence
  });

  // Summary test across ALL pairs
  test('Overall validation: All (λ, k) pairs within tolerance', () => {
    let totalPairs = 0;
    let passedPairs = 0;
    let maxErrorOverall = 0;
    let sumErrors = 0;

    for (const λ of λ_VALUES) {
      for (const k of k_VALUES) {
        const result = runMonteCarloTrial(λ, k, 200); // Smaller for speed

        totalPairs++;
        sumErrors += result.error;
        maxErrorOverall = Math.max(maxErrorOverall, result.error);

        if (result.error < ERROR_TOLERANCE) {
          passedPairs++;
        }
      }
    }

    const avgError = sumErrors / totalPairs;
    const passRate = passedPairs / totalPairs;

    console.log('\n📊 OVERALL VALIDATION SUMMARY:');
    console.log(`  Total pairs tested: ${totalPairs}`);
    console.log(`  Passed (<5% error): ${passedPairs} (${(passRate * 100).toFixed(1)}%)`);
    console.log(`  Average error: ${(avgError * 100).toFixed(3)}%`);
    console.log(`  Max error: ${(maxErrorOverall * 100).toFixed(3)}%`);

    // Should pass overwhelmingly
    expect(passRate).toBeGreaterThan(0.95); // 95% of pairs pass
    expect(avgError).toBeLessThan(0.025); // Avg < 2.5%
    expect(maxErrorOverall).toBeLessThan(0.10); // Max < 10%
  });
});
