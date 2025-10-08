// λREDUCE Residue Management: Imperial leftovers → Evolution signals
// "Errors are not failures, they are seeds for new morphisms"

import type { LambdaExpr } from './ast.js';

export interface Residue {
  imperative: ImperativeFragment[];  // what couldn't be reduced
  reason: string;                     // why reduction failed
  evolutionHints: string[];          // what would help purify this
  purityScore: number;               // 0.0 (all imperative) to 1.0 (all pure)
}

export interface ImperativeFragment {
  type: string;           // 'mutation', 'sideEffect', 'async', 'exception'
  code: string;           // original JS code
  ast?: any;              // optional AST node
  location?: string;      // file:line:col
}

export interface EvolutionSignal {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'newMorphism' | 'extendsExisting' | 'requiresResearch';
  description: string;
  suggestedMorphism?: {
    name: string;
    signature: string;
    formalDefinition: string;
  };
}

/**
 * Analyze residue and generate evolution signals
 */
export function analyzeResidue(residue: Residue): EvolutionSignal[] {
  const signals: EvolutionSignal[] = [];

  for (const fragment of residue.imperative) {
    const signal = analyzeFragment(fragment);
    if (signal) signals.push(signal);
  }

  // If purity is very low, suggest fundamental research
  if (residue.purityScore < 0.3) {
    signals.push({
      priority: 'critical',
      category: 'requiresResearch',
      description: `Low purity score (${residue.purityScore.toFixed(2)}). May require new theoretical foundations.`,
    });
  }

  return signals;
}

function analyzeFragment(fragment: ImperativeFragment): EvolutionSignal | null {
  switch (fragment.type) {
    case 'mutation':
      return {
        priority: 'high',
        category: 'newMorphism',
        description: `Mutation detected: ${fragment.code}. Consider State monad or Lens.`,
        suggestedMorphism: {
          name: 'stateful',
          signature: 'λs.λf.λa.(f(a), s)',
          formalDefinition: 'State monad: S → (A → (B, S))'
        }
      };

    case 'sideEffect':
      return {
        priority: 'high',
        category: 'newMorphism',
        description: `Side effect detected: ${fragment.code}. Consider IO monad.`,
        suggestedMorphism: {
          name: 'io',
          signature: 'λ_.λworld.(effect, world\')',
          formalDefinition: 'IO monad: () → World → (A, World)'
        }
      };

    case 'async':
      return {
        priority: 'medium',
        category: 'extendsExisting',
        description: `Async operation detected: ${fragment.code}. Consider Task or Continuation monad.`,
        suggestedMorphism: {
          name: 'task',
          signature: 'λf.λreject.λresolve.f(reject, resolve)',
          formalDefinition: 'Task monad: ((E → ()) → (A → ()) → ())'
        }
      };

    case 'exception':
      return {
        priority: 'medium',
        category: 'extendsExisting',
        description: `Exception handling detected: ${fragment.code}. Consider Either monad.`,
        suggestedMorphism: {
          name: 'either',
          signature: 'λleft.λright.either(left, right)',
          formalDefinition: 'Either E A = Left E | Right A'
        }
      };

    case 'loop':
      return {
        priority: 'low',
        category: 'extendsExisting',
        description: `Complex loop detected: ${fragment.code}. May need custom recursion scheme.`,
        suggestedMorphism: {
          name: 'anamorphism',
          signature: 'λf.λa.unfold(f, a)',
          formalDefinition: 'ana: (A → F A) → A → Fix F'
        }
      };

    default:
      return {
        priority: 'low',
        category: 'requiresResearch',
        description: `Unknown imperative construct: ${fragment.code}`,
      };
  }
}

/**
 * Extract residue from transformation result
 */
export function extractResidue(
  original: string,
  transformed: LambdaExpr,
  errors: Error[]
): Residue {
  const imperativeFragments: ImperativeFragment[] = [];
  let totalFragments = 0;
  let pureFragments = 0;

  // Detect mutations
  if (original.match(/\w+\s*[+\-*/]=|\+\+|--/)) {
    imperativeFragments.push({
      type: 'mutation',
      code: original.match(/\w+\s*[+\-*/]=|\+\+|--/)?.[0] || '',
    });
  }

  // Detect side effects
  if (original.match(/console\.|document\.|window\./)) {
    imperativeFragments.push({
      type: 'sideEffect',
      code: original.match(/console\.|document\.|window\.\w+/)?.[0] || '',
    });
  }

  // Detect async
  if (original.match(/async|await|Promise|\.then/)) {
    imperativeFragments.push({
      type: 'async',
      code: original.match(/async|await|Promise|\.then/)?.[0] || '',
    });
  }

  // Detect exceptions
  if (original.match(/try|catch|throw|finally/)) {
    imperativeFragments.push({
      type: 'exception',
      code: original.match(/try|catch|throw|finally/)?.[0] || '',
    });
  }

  // Calculate purity score
  totalFragments = original.split(/\s+/).length;
  const imperativeWeight = imperativeFragments.length * 5; // each imperative construct is "heavy"
  pureFragments = Math.max(0, totalFragments - imperativeWeight);
  const purityScore = totalFragments > 0 ? pureFragments / totalFragments : 1.0;

  // Generate evolution hints
  const evolutionHints: string[] = [];
  if (imperativeFragments.some(f => f.type === 'mutation')) {
    evolutionHints.push('Consider using immutable data structures');
    evolutionHints.push('Explore State monad or Lens optics');
  }
  if (imperativeFragments.some(f => f.type === 'sideEffect')) {
    evolutionHints.push('Consider using IO monad or Free monad');
    evolutionHints.push('Separate pure logic from effects');
  }
  if (imperativeFragments.some(f => f.type === 'async')) {
    evolutionHints.push('Consider using Task, Future, or Continuation monad');
  }

  return {
    imperative: imperativeFragments,
    reason: errors.length > 0 ? errors.map(e => e.message).join('; ') : 'Contains imperative constructs',
    evolutionHints,
    purityScore: Math.max(0, Math.min(1, purityScore))
  };
}

/**
 * Render residue report for human reading
 */
export function formatResidueReport(residue: Residue, signals: EvolutionSignal[]): string {
  const lines: string[] = [];

  lines.push('🧬 RESIDUE ANALYSIS REPORT');
  lines.push('═'.repeat(50));
  lines.push('');

  lines.push(`Purity Score: ${(residue.purityScore * 100).toFixed(1)}%`);
  lines.push(`Imperative Fragments: ${residue.imperative.length}`);
  lines.push('');

  if (residue.imperative.length > 0) {
    lines.push('📦 Imperative Leftovers:');
    for (const fragment of residue.imperative) {
      lines.push(`  • ${fragment.type}: ${fragment.code}`);
    }
    lines.push('');
  }

  if (residue.evolutionHints.length > 0) {
    lines.push('💡 Evolution Hints:');
    for (const hint of residue.evolutionHints) {
      lines.push(`  • ${hint}`);
    }
    lines.push('');
  }

  if (signals.length > 0) {
    lines.push('🌱 Evolution Signals:');
    for (const signal of signals) {
      lines.push(`  [${signal.priority}] ${signal.category}: ${signal.description}`);
      if (signal.suggestedMorphism) {
        lines.push(`    → ${signal.suggestedMorphism.name}: ${signal.suggestedMorphism.signature}`);
      }
    }
  }

  return lines.join('\n');
}
