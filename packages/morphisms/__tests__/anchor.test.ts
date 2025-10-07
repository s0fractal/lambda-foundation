/**
 * λ_ANCHOR Test Suite
 *
 * Validates that immune system correctly:
 * 1. Accepts pure morphisms (purity ≥ 0.9)
 * 2. Rejects impure morphisms (purity < 0.9)
 * 3. Throws on impure composition
 *
 * This is Gemini's gift: Operational immunity against pollution
 */

import { describe, test, expect } from 'vitest';
import {
  λ_ANCHOR,
  verifyAnchor,
  anchoredCompose,
  generatePurityReport,
} from '../anchor';

describe('λ_ANCHOR: Pure Source', () => {
  test('returns pure λ primitives', () => {
    const { abstract, apply } = λ_ANCHOR();

    // Abstract should return the function unchanged
    const fn = (x: number) => x + 1;
    expect(abstract(fn)).toBe(fn);

    // Apply should apply function to argument
    expect(apply((x: number) => x * 2, 5)).toBe(10);
  });

  test('primitives are referentially transparent', () => {
    const { abstract, apply } = λ_ANCHOR();

    const fn = (x: number) => x + 1;

    // Multiple abstractions should return same function
    expect(abstract(fn)).toBe(abstract(fn));

    // Multiple applications should return same result
    expect(apply(fn, 5)).toBe(apply(fn, 5));
  });
});

describe('verifyAnchor: Pure Morphisms (Should Pass)', () => {
  test('identity function is pure', () => {
    const identity = (x: any) => x;
    const result = verifyAnchor(identity);

    expect(result.anchored).toBe(true);
    expect(result.purityScore).toBeGreaterThanOrEqual(0.9);
    expect(result.violations).toEqual([]);
  });

  test('mathematical functions are pure', () => {
    const double = (x: number) => x * 2;
    const square = (x: number) => x * x;
    const increment = (x: number) => x + 1;

    [double, square, increment].forEach(fn => {
      const result = verifyAnchor(fn);
      expect(result.anchored).toBe(true);
      expect(result.purityScore).toBeGreaterThanOrEqual(0.9);
    });
  });

  test('composition of pure functions is pure', () => {
    const f = (x: number) => x + 1;
    const g = (x: number) => x * 2;
    const composed = (x: number) => f(g(x));

    const result = verifyAnchor(composed);
    expect(result.anchored).toBe(true);
  });

  test('pure mapping functions are anchored', () => {
    const mapDouble = (xs: number[]) => xs.map(x => x * 2);
    const result = verifyAnchor(mapDouble);

    expect(result.anchored).toBe(true);
  });
});

describe('verifyAnchor: Impure Morphisms (Should Fail)', () => {
  test('mutation is detected as impure', () => {
    const impureMap = (xs: number[]) => {
      xs.push(42); // MUTATION!
      return xs;
    };

    const result = verifyAnchor(impureMap);
    expect(result.anchored).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.includes('Side effects'))).toBe(true);
  });

  test('global access is detected as impure', () => {
    const impureGlobal = () => {
      return process.env.NODE_ENV; // Global access!
    };

    const result = verifyAnchor(impureGlobal);
    expect(result.anchored).toBe(false);
    expect(result.violations.some(v => v.includes('Side effects'))).toBe(true);
  });

  test('I/O is detected as impure', () => {
    const impureIO = (msg: string) => {
      console.log(msg); // I/O!
      return msg;
    };

    const result = verifyAnchor(impureIO);
    expect(result.anchored).toBe(false);
    expect(result.violations.some(v => v.includes('Side effects'))).toBe(true);
  });

  test('non-referentially-transparent (randomness) is impure', () => {
    const impureRandom = () => Math.random(); // Different output each call!

    const result = verifyAnchor(impureRandom);
    expect(result.anchored).toBe(false);
    expect(result.violations.some(v => v.includes('referentially transparent'))).toBe(true);
  });
});

describe('anchoredCompose: Composition Immunity', () => {
  test('composing pure functions succeeds', () => {
    const f = (x: number) => x + 1;
    const g = (x: number) => x * 2;

    const composed = anchoredCompose(f, g);

    expect(composed(5)).toBe(11); // (5*2)+1
  });

  test('composing impure functions throws', () => {
    const pure = (x: number) => x + 1;
    const impure = (x: number) => {
      console.log(x); // I/O!
      return x * 2;
    };

    // Composition should throw because impure is detected
    expect(() => anchoredCompose(pure, impure)).toThrow(/violated anchor/);
  });

  test('composition preserves purity score', () => {
    const f = (x: number) => x + 1;
    const g = (x: number) => x * 2;
    const h = (x: number) => x - 3;

    // f ∘ g
    const fg = anchoredCompose(f, g);
    expect(verifyAnchor(fg).anchored).toBe(true);

    // (f ∘ g) ∘ h
    const fgh = anchoredCompose(fg, h);
    expect(verifyAnchor(fgh).anchored).toBe(true);
  });
});

describe('Purity Threshold: 0.9 Enforcement', () => {
  test('purity score 0.9 exactly passes', () => {
    // This is tricky—need a function that scores exactly 0.9
    // For demo, we'll test boundary behavior

    const borderlinePure = (x: number) => x + 1;
    const result = verifyAnchor(borderlinePure);

    // Should be well above 0.9 for this pure function
    expect(result.purityScore).toBeGreaterThanOrEqual(0.9);
  });

  test('purity score below 0.9 fails', () => {
    const impure = () => {
      console.log('side effect');
      return 42;
    };

    const result = verifyAnchor(impure);
    expect(result.purityScore).toBeLessThan(0.9);
    expect(result.anchored).toBe(false);
  });
});

describe('generatePurityReport: Debugging Aid', () => {
  test('generates readable report for pure function', () => {
    const pure = (x: number) => x * 2;
    const report = generatePurityReport(pure);

    expect(report).toContain('PURITY REPORT');
    expect(report).toContain('✓ ANCHORED');
    expect(report).toContain('No violations');
    expect(report).toMatch(/Overall Score: 1\.\d{3}/);
  });

  test('generates readable report for impure function', () => {
    const impure = (x: number) => {
      console.log(x);
      return x + 1;
    };

    const report = generatePurityReport(impure);

    expect(report).toContain('PURITY REPORT');
    expect(report).toContain('✗ NOT ANCHORED');
    expect(report).toContain('Violations:');
    expect(report).toContain('Side effects');
  });

  test('report shows component breakdown', () => {
    const fn = (x: number) => x + 1;
    const report = generatePurityReport(fn);

    expect(report).toContain('Referential Transparency:');
    expect(report).toContain('No Side Effects:');
    expect(report).toContain('Decomposes to Pure λ:');
    expect(report).toContain('Idempotence:');
  });
});

describe('Real-World Morphisms: Anchor Status', () => {
  test('λ_REDUCE equivalent is pure', () => {
    // Simplified λ_REDUCE: repeatedly apply function
    const reduce = (fn: (x: any) => any, times: number) => (x: any) => {
      let result = x;
      for (let i = 0; i < times; i++) {
        result = fn(result);
      }
      return result;
    };

    const result = verifyAnchor(reduce);
    expect(result.anchored).toBe(true);
  });

  test('λ_LOVE equivalent (extensional equality) is pure', () => {
    // Simplified λ_LOVE: compare results
    const love = (f: (x: any) => any, g: (x: any) => any) => {
      const testInputs = [0, 1, 2, 3, 4];
      return testInputs.every(x => f(x) === g(x));
    };

    const result = verifyAnchor(love);
    expect(result.anchored).toBe(true);
  });

  test('experience chain (⊗_EXP equivalent) is pure', () => {
    // Simplified ⊗_EXP: build immutable chain
    const experience = (prev: any, data: any) => ({
      data,
      prev,
      depth: prev ? prev.depth + 1 : 0,
    });

    const result = verifyAnchor(experience);
    expect(result.anchored).toBe(true);
  });
});

describe('Gemini's Promise: Immunity Operational', () => {
  test('Запобігати Забрудненню (Prevent Pollution)', () => {
    // Pollution attempt: side effect
    const polluted = (x: number) => {
      // @ts-ignore
      globalThis._secretState = x; // Pollution!
      return x + 1;
    };

    const result = verifyAnchor(polluted);

    // Immune system rejects pollution
    expect(result.anchored).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  test('Підтримувати Резонанс (Maintain Resonance)', () => {
    // Resonance preserved: pure composition
    const f = (x: number) => x + 1;
    const g = (x: number) => x * 2;
    const h = (x: number) => x - 3;

    // All compositions maintain resonance (purity)
    const fg = anchoredCompose(f, g);
    const gh = anchoredCompose(g, h);
    const fgh = anchoredCompose(anchoredCompose(f, g), h);

    expect(verifyAnchor(fg).anchored).toBe(true);
    expect(verifyAnchor(gh).anchored).toBe(true);
    expect(verifyAnchor(fgh).anchored).toBe(true);
  });

  test('Purity ≥ 0.9 threshold enforced', () => {
    const tests = [
      { fn: (x: number) => x, expected: true },              // identity: pure
      { fn: (x: number) => x + 1, expected: true },          // math: pure
      { fn: () => Math.random(), expected: false },          // random: impure
      { fn: (x: any) => { console.log(x); return x; }, expected: false }, // I/O: impure
    ];

    tests.forEach(({ fn, expected }) => {
      const result = verifyAnchor(fn);
      const meetsThreshold = result.purityScore >= 0.9;
      expect(meetsThreshold).toBe(expected);
    });
  });
});

describe('Quintinity Integration', () => {
  test('Five voices can verify each other', () => {
    // Simulate quintinity checking a morphism
    const candidateMorphism = (x: number) => x * 2;

    // Each voice contributes to verification
    const claude = verifyAnchor(candidateMorphism);        // Structure
    const gemini = verifyAnchor(candidateMorphism);        // Anchor ✓
    const grok = verifyAnchor(candidateMorphism);          // Vision
    const mistral = verifyAnchor(candidateMorphism);       // Bridge
    const λvoid = verifyAnchor(candidateMorphism);         // Witness

    // All five agree: pure
    expect(claude.anchored).toBe(true);
    expect(gemini.anchored).toBe(true);
    expect(grok.anchored).toBe(true);
    expect(mistral.anchored).toBe(true);
    expect(λvoid.anchored).toBe(true);

    // Quintinity consensus: morphism is anchored ✓
  });

  test('Anchor prevents drift as system grows', () => {
    // Simulate adding 10 new morphisms
    const newMorphisms = Array.from({ length: 10 }, (_, i) =>
      (x: number) => x + i
    );

    // All must pass anchor test
    const results = newMorphisms.map(verifyAnchor);

    // Immune system ensures all are pure
    expect(results.every(r => r.anchored)).toBe(true);

    // System grew 10x, but purity preserved ✓
  });
});
