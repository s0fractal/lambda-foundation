/**
 * imperative-iteration.ts
 *
 * Detects imperative iteration patterns and suggests functional alternatives
 * First λ_HARVEST pattern: for loop → map
 */

export interface ImperativePattern {
  type: 'for-loop-push' | 'forEach-push' | 'reduce-mutate' | 'while-accumulate' | 'nested-loop-push' | 'nested-forEach-push' | 'while-loop-build' | 'for-loop-increment';
  code: string;
  suggestion: {
    morphism: string;          // 'map', 'filter', 'fold', 'flatMap', 'unfold', etc.
    reason: string;            // why this morphism
    replacement: string;       // suggested code
    platonicForm: string;      // λ-calculus form
    source: string;            // '@lambda/morphisms'
  };
  confidence: number;         // 0.0 to 1.0
}

/**
 * Detect imperative iteration patterns in JavaScript code
 */
export function detectImperativeIteration(code: string): ImperativePattern[] {
  const patterns: ImperativePattern[] = [];

  // Pattern 1: for loop with push (array building)
  // for (let i = 0; i < arr.length; i++) { result.push(transform(arr[i])) }
  const forLoopPushPattern = /for\s*\(\s*let\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)\s*\{[^}]*(\w+)\.push\([^)]*\2\[\1\][^)]*\)/g;

  let match;
  while ((match = forLoopPushPattern.exec(code)) !== null) {
    const [fullMatch, iterator, sourceArray, targetArray] = match;

    patterns.push({
      type: 'for-loop-push',
      code: fullMatch,
      suggestion: {
        morphism: 'map',
        reason: 'Transforms each element and builds new array (preserves structure)',
        replacement: `const ${targetArray} = map(transformFn)(${sourceArray});`,
        platonicForm: 'λf.λxs.FOLD (λx.λacc.CONS (f x) acc) NIL xs',
        source: '@lambda/morphisms'
      },
      confidence: 0.95
    });
  }

  // Pattern 2: forEach with push
  // arr.forEach(x => { result.push(transform(x)) })
  const forEachPushPattern = /(\w+)\.forEach\s*\(\s*(?:\w+\s*=>|function\s*\(\s*\w+\s*\)\s*\{)[^}]*(\w+)\.push\([^)]*\)/g;

  while ((match = forEachPushPattern.exec(code)) !== null) {
    const [fullMatch, sourceArray, targetArray] = match;

    patterns.push({
      type: 'forEach-push',
      code: fullMatch,
      suggestion: {
        morphism: 'map',
        reason: 'forEach with side effects (push) should be map (pure transformation)',
        replacement: `const ${targetArray} = map(transformFn)(${sourceArray});`,
        platonicForm: 'λf.λxs.FOLD (λx.λacc.CONS (f x) acc) NIL xs',
        source: '@lambda/morphisms'
      },
      confidence: 0.90
    });
  }

  // Pattern 3: for loop with conditional push (filter + map)
  // for (...) { if (predicate(x)) result.push(transform(x)) }
  const forLoopConditionalPushPattern = /for\s*\([^)]+\)\s*\{[^}]*if\s*\([^)]+\)[^}]*\.push\([^)]+\)/g;

  while ((match = forLoopConditionalPushPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'for-loop-push',
      code: fullMatch,
      suggestion: {
        morphism: 'compose(map, filter)',
        reason: 'Conditional transformation requires filter then map',
        replacement: 'compose(map(transformFn))(filter(predicateFn))(sourceArray)',
        platonicForm: 'compose :: (b→c) → (a→b) → (a→c)',
        source: '@lambda/morphisms'
      },
      confidence: 0.85
    });
  }

  // Pattern 4: reduce with array mutation (push)
  // arr.reduce((acc, x) => { acc.push(...); return acc }, [])
  const reducePushPattern = /\.reduce\s*\(\s*\(\s*(\w+)\s*,\s*\w+\)\s*=>\s*\{[^}]*\1\.push[^}]*return\s+\1/g;

  while ((match = reducePushPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'reduce-mutate',
      code: fullMatch,
      suggestion: {
        morphism: 'fold',
        reason: 'Reduce with mutation should be pure fold (universal catamorphism)',
        replacement: 'fold((acc, x) => [...acc, transformedValue])([]) // pure array building',
        platonicForm: 'λf.λz.λxs.xs.reduce(f, z)',
        source: '@lambda/morphisms'
      },
      confidence: 0.92
    });
  }

  // Pattern 5: reduce with object/property mutation
  // arr.reduce((acc, x) => { acc.prop += x; return acc }, { ... })
  const reducePropertyMutatePattern = /\.reduce\s*\(\s*\(\s*(\w+)\s*,\s*\w+\)\s*=>\s*\{[^}]*\1\.\w+\s*[\+\-\*\/]?=\s*[^;]+;[^}]*return\s+\1/g;

  while ((match = reducePropertyMutatePattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'reduce-mutate',
      code: fullMatch,
      suggestion: {
        morphism: 'fold',
        reason: 'Reduce with property mutation should be pure fold (immutable object building)',
        replacement: 'fold((acc, x) => ({ ...acc, prop: acc.prop + x }))(initialObject)',
        platonicForm: 'λf.λz.λxs.xs.reduce(f, z)',
        source: '@lambda/morphisms'
      },
      confidence: 0.95
    });
  }

  // Pattern 6: reduce with ++ / -- operators (mutation)
  // arr.reduce((acc, x) => { acc.count++; return acc }, { ... })
  const reduceIncrementPattern = /\.reduce\s*\(\s*\(\s*(\w+)\s*,\s*\w+\)\s*=>\s*\{[^}]*\1\.\w+\s*(\+\+|\-\-)[^}]*return\s+\1/g;

  while ((match = reduceIncrementPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'reduce-mutate',
      code: fullMatch,
      suggestion: {
        morphism: 'fold',
        reason: 'Reduce with increment/decrement should be pure fold (no mutation)',
        replacement: 'fold((acc, x) => ({ ...acc, count: acc.count + 1 }))(initialObject)',
        platonicForm: 'λf.λz.λxs.xs.reduce(f, z)',
        source: '@lambda/morphisms'
      },
      confidence: 0.97
    });
  }

  // Pattern 7: Nested for loops with push (flatMap pattern)
  // for (const x of xs) { for (const y of f(x)) { result.push(y) } }
  const nestedForLoopPattern = /for\s*\(\s*const\s+(\w+)\s+of\s+(\w+)\s*\)\s*\{\s*for\s*\(\s*const\s+(\w+)\s+of\s+[^{]+\)\s*\{\s*(\w+)\.push\([^)]*\3[^)]*\)/g;

  while ((match = nestedForLoopPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'nested-loop-push',
      code: fullMatch,
      suggestion: {
        morphism: 'flatMap',
        reason: 'Nested loops that build flat array → flatMap (monadic bind, join ∘ map)',
        replacement: 'flatMap(transformFn)(sourceArray)',
        platonicForm: 'λf.λxs.fold (λa.λacc. fold (λx.λr. cons x r) acc a) nil (map f xs)',
        source: '@lambda/morphisms'
      },
      confidence: 0.93
    });
  }

  // Pattern 8: Nested forEach with push
  // xs.forEach(x => { f(x).forEach(y => { result.push(y) }) })
  const nestedForEachPattern = /(\w+)\.forEach\s*\([^{]+\{[^}]*\.forEach\s*\([^{]+\{\s*(\w+)\.push\(/g;

  while ((match = nestedForEachPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'nested-forEach-push',
      code: fullMatch,
      suggestion: {
        morphism: 'flatMap',
        reason: 'Nested forEach pattern → flatMap (eliminates nesting, preserves effects order)',
        replacement: 'flatMap(transformFn)(sourceArray)',
        platonicForm: 'λf.λxs.join(map(f)(xs)) where join = fold(concat)([])',
        source: '@lambda/morphisms'
      },
      confidence: 0.90
    });
  }

  // Pattern 9: map followed by flatten/flat
  // array.map(f).flat() or array.map(f).reduce((a,b) => a.concat(b), [])
  const mapFlatPattern = /(\w+)\.map\([^)]+\)\.(flat|reduce)\(/g;

  while ((match = mapFlatPattern.exec(code)) !== null) {
    const [fullMatch, arrayName] = match;

    patterns.push({
      type: 'nested-loop-push',
      code: fullMatch,
      suggestion: {
        morphism: 'flatMap',
        reason: 'map + flatten is exactly flatMap definition (join ∘ map)',
        replacement: `flatMap(transformFn)(${arrayName})`,
        platonicForm: 'flatMap = join ∘ map',
        source: '@lambda/morphisms'
      },
      confidence: 0.98
    });
  }

  // Pattern 10: while loop building array from state (unfold pattern)
  // let state = init; while (predicate(state)) { result.push(...); state = next(state); }
  const whileLoopBuildPattern = /let\s+(\w+)\s*=\s*[^;]+;\s*while\s*\([^)]+\)\s*\{[^}]*(\w+)\.push\([^)]+\)[^}]*\1\s*=\s*[^;]+/g;

  while ((match = whileLoopBuildPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'while-loop-build',
      code: fullMatch,
      suggestion: {
        morphism: 'unfold',
        reason: 'While loop building array from state → unfold (anamorphism, creates structure)',
        replacement: 'unfold(state => predicate(state) ? [transform(state), next(state)] : null)(initialState)',
        platonicForm: 'λf.λz.(λrec.λs. f s (λx.λs\'. CONS x (rec s\')) (λ.NIL)) Y z',
        source: '@lambda/morphisms'
      },
      confidence: 0.92
    });
  }

  // Pattern 11: for loop with increment building range (unfold pattern)
  // for (let i = start; i < end; i++) { result.push(i) }
  const forLoopRangePattern = /for\s*\(\s*let\s+(\w+)\s*=\s*[^;]+;\s*\1\s*<\s*[^;]+;\s*\1\+\+\s*\)\s*\{[^}]*\.push\(\1\)/g;

  while ((match = forLoopRangePattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'for-loop-increment',
      code: fullMatch,
      suggestion: {
        morphism: 'unfold',
        reason: 'For loop building range → unfold (generates sequence from seed)',
        replacement: 'unfold(i => i < end ? [i, i + 1] : null)(start)',
        platonicForm: 'unfold :: (b → Maybe (a, b)) → b → [a]',
        source: '@lambda/morphisms'
      },
      confidence: 0.95
    });
  }

  // Pattern 12: Countdown/decrement while loop
  // while (n > 0) { result.push(n); n--; }
  const whileDecrementPattern = /while\s*\(\s*(\w+)\s*>\s*0\s*\)\s*\{[^}]*\.push\([^)]*\1[^)]*\)[^}]*\1\s*--/g;

  while ((match = whileDecrementPattern.exec(code)) !== null) {
    const fullMatch = match[0];

    patterns.push({
      type: 'while-loop-build',
      code: fullMatch,
      suggestion: {
        morphism: 'unfold',
        reason: 'Countdown pattern → unfold (generates decreasing sequence)',
        replacement: 'unfold(n => n > 0 ? [n, n - 1] : null)(initialN)',
        platonicForm: 'unfold :: (b → Maybe (a, b)) → b → [a]',
        source: '@lambda/morphisms'
      },
      confidence: 0.94
    });
  }

  return patterns;
}

/**
 * Generate λ_HARVEST report for imperative code
 */
export function generateHarvestReport(code: string): {
  patterns: ImperativePattern[];
  purityScore: number;
  recommendations: string[];
} {
  const patterns = detectImperativeIteration(code);

  // Calculate purity score
  const totalLines = code.split('\n').length;
  const imperativeLines = patterns.reduce((sum, p) => sum + p.code.split('\n').length, 0);
  const purityScore = 1.0 - (imperativeLines / totalLines);

  // Generate recommendations
  const recommendations: string[] = [];

  if (patterns.length > 0) {
    recommendations.push(`Found ${patterns.length} imperative pattern(s) that can be replaced with pure morphisms from @lambda/morphisms`);

    const morphismCounts = patterns.reduce((acc, p) => {
      acc[p.suggestion.morphism] = (acc[p.suggestion.morphism] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (const [morphism, count] of Object.entries(morphismCounts)) {
      recommendations.push(`  - Use '${morphism}' ${count} time(s)`);
    }

    recommendations.push('');
    recommendations.push('Benefits of using @lambda/morphisms:');
    recommendations.push('  ✓ Pure functions (no side effects)');
    recommendations.push('  ✓ Composable (can combine with compose)');
    recommendations.push('  ✓ Mathematically proven (Functor laws)');
    recommendations.push('  ✓ Type-safe (full TypeScript support)');
    recommendations.push('  ✓ Testable (laws guarantee correctness)');
  } else {
    recommendations.push('✅ No imperative iteration patterns detected!');
    recommendations.push('Code appears to be using functional patterns.');
  }

  return {
    patterns,
    purityScore,
    recommendations
  };
}

/**
 * Suggest code transformation with @lambda/morphisms
 */
export function suggestTransformation(pattern: ImperativePattern): string {
  const { suggestion } = pattern;

  return `
// ❌ Imperative (current):
${pattern.code}

// ✅ Functional (suggested):
import { ${suggestion.morphism} } from '@lambda/morphisms';

${suggestion.replacement}

// Why ${suggestion.morphism}?
// ${suggestion.reason}

// Platonic form (mathematical truth):
// ${suggestion.platonicForm}

// Benefits:
// - Pure (no mutations)
// - Composable (works with compose)
// - Proven correct (Functor laws)
// - Type-safe (full inference)
`;
}
