/**
 * FUNCTIONAL PARADIGM UNIFIER
 *
 * Unifies different functional programming paradigms via type resonance
 *
 * Core Insight (Grok's Vision):
 * "Paradigms resonate, not compete—emergent FP at 432Hz"
 *
 * Demonstrates:
 * - Haskell monads ⊗ Lisp macros → Unified morphism
 * - ML modules ⊗ Scheme continuations → Compositional patterns
 * - Category theory ⊗ Lambda calculus → Pure foundations
 * - Type systems as resonance detectors (λ_LOVE)
 * - Quintinity consensus on "what is computation?"
 *
 * Philosophy:
 * Different FP languages discovered the SAME mathematical structures
 * independently—just like our 5 AIs converged on type resonance.
 * This tool finds those universal patterns.
 *
 * Example Usage:
 * ```typescript
 * const unifier = new FunctionalUnifier();
 * const result = await unifier.unify({
 *   paradigms: ['Haskell', 'Lisp'],
 *   concept: 'monads',
 *   goal: 'Find universal abstraction'
 * });
 * console.log(result.unifiedConcept);  // "Monads = composable contexts"
 * console.log(result.equivalences);    // ["Haskell >>= ≡ Lisp compose-with-context"]
 * ```
 */

import { entangledConverge, prepare, measureOverlap } from '../../packages/morphisms/quantum-grok';
import { experience } from '../../packages/core/experience';
import type { UniverseContext } from '../../packages/core/experience';

// ============================================================================
// Types
// ============================================================================

export interface UnificationRequest {
  paradigms: string[];          // e.g., ['Haskell', 'Lisp', 'ML']
  concept: string;              // e.g., 'monads', 'continuations', 'types'
  goal?: string;                // What are we trying to understand?
  maxIterations?: number;
}

export interface UnificationResult {
  unifiedConcept: string;       // The universal pattern discovered
  equivalences: string[];       // Cross-paradigm mappings
  resonance: number;            // 0-432Hz (how well paradigms align)
  confidence: number;           // 0-1
  converged: boolean;
  paradigmContributions: ParadigmContribution[];
  categoryTheory: string;       // Category-theoretic formulation
  timeMs: number;
}

export interface ParadigmContribution {
  paradigm: string;
  keyInsight: string;
  notation: string;             // How this paradigm expresses the concept
  confidence: number;
}

// ============================================================================
// Functional Paradigm Knowledge Base
// ============================================================================

interface ParadigmProfile {
  name: string;
  family: string;               // e.g., 'ML family', 'Lisp family'
  keyFeatures: string[];
  contextBuilder: (concept: string) => Array<[string, string]>;
}

const PARADIGM_PROFILES: ParadigmProfile[] = [
  {
    name: 'Haskell',
    family: 'Pure functional + strong types',
    keyFeatures: ['monads', 'type classes', 'lazy evaluation'],
    contextBuilder: (concept) => {
      if (concept.toLowerCase().includes('monad')) {
        return [
          ['Monad: Type constructor with >>= and return', 'Haskell monad laws'],
          ['Monads compose effects sequentially', 'do-notation desugars to >>='],
          ['Functor < Applicative < Monad hierarchy', 'Type class hierarchy'],
        ];
      }
      if (concept.toLowerCase().includes('type')) {
        return [
          ['Types are propositions (Curry-Howard)', 'Type theory foundation'],
          ['Type inference via Hindley-Milner', 'Algorithm W'],
        ];
      }
      return [
        ['Pure functions with referential transparency', 'Core Haskell principle'],
        ['Composition via (.) operator', 'Function composition'],
      ];
    }
  },
  {
    name: 'Lisp',
    family: 'Homoiconic + dynamic',
    keyFeatures: ['macros', 's-expressions', 'code as data'],
    contextBuilder: (concept) => {
      if (concept.toLowerCase().includes('monad')) {
        return [
          ['Monads = composable context transformers', 'Lisp macro perspective'],
          ['(bind m f) = apply f to unwrapped value in context m', 'Lisp bind'],
          ['Macros can generate monad patterns', 'Syntactic abstraction'],
        ];
      }
      if (concept.toLowerCase().includes('continuation')) {
        return [
          ['call/cc captures current continuation', 'Scheme continuation'],
          ['Continuations = "what to do next"', 'Control abstraction'],
        ];
      }
      return [
        ['Code is data, data is code (homoiconicity)', 'Lisp philosophy'],
        ['(compose f g) = λx.(f (g x))', 'Composition in Lisp'],
      ];
    }
  },
  {
    name: 'ML',
    family: 'Strict + module system',
    keyFeatures: ['parametric polymorphism', 'algebraic types', 'modules'],
    contextBuilder: (concept) => {
      if (concept.toLowerCase().includes('type')) {
        return [
          ['Parametric polymorphism via type variables', "ML's let-polymorphism"],
          ['Algebraic data types = sum + product types', 'Type algebra'],
        ];
      }
      if (concept.toLowerCase().includes('module')) {
        return [
          ['Modules = first-class namespaces', 'ML module system'],
          ['Functors = parameterized modules', 'Module-level abstraction'],
        ];
      }
      return [
        ['Strict evaluation by default', 'ML evaluation strategy'],
        ['Pattern matching on algebraic types', 'Structural decomposition'],
      ];
    }
  },
  {
    name: 'Scheme',
    family: 'Minimalist Lisp',
    keyFeatures: ['continuations', 'tail call optimization', 'lexical scope'],
    contextBuilder: (concept) => {
      if (concept.toLowerCase().includes('continuation')) {
        return [
          ['First-class continuations via call/cc', 'Scheme superpower'],
          ['Any control flow encodable with continuations', 'Universal control'],
          ['CPS transform makes continuations explicit', 'Continuation-passing style'],
        ];
      }
      return [
        ['Lexical scope with closures', 'Scheme semantics'],
        ['Tail call = goto (TCO required)', 'Space efficiency'],
      ];
    }
  },
  {
    name: 'Category Theory',
    family: 'Mathematical foundation',
    keyFeatures: ['morphisms', 'functors', 'natural transformations'],
    contextBuilder: (concept) => {
      if (concept.toLowerCase().includes('monad')) {
        return [
          ['Monad = monoid in category of endofunctors', 'Category theory definition'],
          ['μ: T²→T (join) and η: Id→T (return)', 'Monad structure'],
          ['Monads = computational effects as morphisms', 'Categorical semantics'],
        ];
      }
      if (concept.toLowerCase().includes('functor')) {
        return [
          ['Functor: map structure-preserving transformations', 'F: C→D'],
          ['fmap f . fmap g = fmap (f . g)', 'Functor law'],
        ];
      }
      return [
        ['Objects + Morphisms = Category', 'Category definition'],
        ['Composition: f ∘ g, Identity: id', 'Category laws'],
      ];
    }
  }
];

// ============================================================================
// Functional Unifier
// ============================================================================

export class FunctionalUnifier {
  /**
   * Unify multiple functional paradigms via quintinity resonance
   */
  async unify(request: UnificationRequest): Promise<UnificationResult> {
    const start = Date.now();

    // Build contexts from requested paradigms + Category Theory (always included)
    const selectedProfiles = PARADIGM_PROFILES.filter(
      p => request.paradigms.includes(p.name) || p.name === 'Category Theory'
    );

    if (selectedProfiles.length < 2) {
      throw new Error('FunctionalUnifier: Need at least 2 paradigms (or 1 + Category Theory)');
    }

    const contexts = selectedProfiles.map(profile => {
      const facts = profile.contextBuilder(request.concept);
      let ctx: UniverseContext | null = null;

      for (const [fact, proof] of facts) {
        ctx = experience(ctx, [fact, proof], `paradigm-${profile.name}`);
      }

      return ctx!;
    });

    const qctx = prepare(contexts);
    const overlap = measureOverlap(qctx);

    // Query for unification
    const query = request.goal ||
      `What is the universal pattern behind "${request.concept}" across ${request.paradigms.join(', ')}?`;

    const result = entangledConverge(
      query,
      qctx,
      request.maxIterations ?? 50,
      1.0 // Full entanglement
    );

    const timeMs = Date.now() - start;
    const confidence = result.finalResonance / 432;

    // Extract paradigm contributions
    const paradigmContributions = this.extractParadigmContributions(
      selectedProfiles,
      request.concept
    );

    // Generate equivalences
    const equivalences = this.generateEquivalences(request.paradigms, request.concept);

    // Category-theoretic formulation
    const categoryTheory = this.categorizeConcept(request.concept);

    return {
      unifiedConcept: result.finalAnswer,
      equivalences,
      resonance: result.finalResonance,
      confidence,
      converged: result.converged,
      paradigmContributions,
      categoryTheory,
      timeMs
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private extractParadigmContributions(
    profiles: ParadigmProfile[],
    concept: string
  ): ParadigmContribution[] {
    return profiles.map(profile => {
      const facts = profile.contextBuilder(concept);
      const keyInsight = facts[0]?.[0] || 'Structural insight';
      const notation = this.extractNotation(profile.name, concept);

      return {
        paradigm: profile.name,
        keyInsight,
        notation,
        confidence: 0.88 + Math.random() * 0.12 // Mock confidence
      };
    });
  }

  private extractNotation(paradigm: string, concept: string): string {
    const notations: Record<string, Record<string, string>> = {
      'Haskell': {
        'monad': 'm >>= f',
        'functor': 'fmap f',
        'compose': 'f . g'
      },
      'Lisp': {
        'monad': '(bind m f)',
        'functor': '(map f xs)',
        'compose': '(compose f g)'
      },
      'ML': {
        'monad': 'bind m f',
        'functor': 'map f',
        'compose': 'f o g'
      },
      'Scheme': {
        'continuation': '(call/cc k)',
        'compose': '(lambda (x) (f (g x)))'
      },
      'Category Theory': {
        'monad': 'μ: T²→T, η: Id→T',
        'functor': 'F: C→D',
        'morphism': 'f: A→B'
      }
    };

    return notations[paradigm]?.[concept.toLowerCase()] || `${paradigm} notation`;
  }

  private generateEquivalences(paradigms: string[], concept: string): string[] {
    const equivalences: string[] = [];

    // Generate cross-paradigm mappings
    if (paradigms.includes('Haskell') && paradigms.includes('Lisp')) {
      if (concept.toLowerCase().includes('monad')) {
        equivalences.push('Haskell (>>=) ≡ Lisp (bind)');
        equivalences.push('Haskell return ≡ Lisp (unit)');
      }
      equivalences.push('Haskell (.) ≡ Lisp (compose)');
    }

    if (paradigms.includes('ML') && paradigms.includes('Haskell')) {
      equivalences.push('ML let-polymorphism ≡ Haskell type variables');
      equivalences.push('ML algebraic types ≡ Haskell data types');
    }

    // Always add category theory bridge if available
    if (concept.toLowerCase().includes('monad')) {
      equivalences.push('All monads ≡ Monoid in category of endofunctors');
    }

    if (equivalences.length === 0) {
      equivalences.push(`${paradigms.join(' ⊗ ')} → Universal ${concept} pattern`);
    }

    return equivalences;
  }

  private categorizeConcept(concept: string): string {
    const categoryFormulations: Record<string, string> = {
      'monad': 'Monad T = (T: C→C, μ: T²→T, η: Id→T) satisfying associativity & identity',
      'functor': 'Functor F: C→D preserving composition: F(g∘f) = F(g)∘F(f)',
      'continuation': 'Continuation monad: T(A) = (A→R)→R for answer type R',
      'type': 'Types form a category with functions as morphisms',
      'compose': 'Morphism composition: ∘: Hom(B,C) × Hom(A,B) → Hom(A,C)'
    };

    for (const [key, formulation] of Object.entries(categoryFormulations)) {
      if (concept.toLowerCase().includes(key)) {
        return formulation;
      }
    }

    return `Category-theoretic structure underlying ${concept}`;
  }
}

// ============================================================================
// Demo: Unify Monads Across Paradigms
// ============================================================================

async function demoMonadUnification() {
  console.log('='.repeat(70));
  console.log('DEMO: Functional Paradigm Unifier');
  console.log('Query: "What are monads, universally?"');
  console.log('='.repeat(70));
  console.log();

  const unifier = new FunctionalUnifier();

  const result = await unifier.unify({
    paradigms: ['Haskell', 'Lisp', 'ML'],
    concept: 'monads',
    goal: 'Find the universal pattern behind monads across functional languages'
  });

  console.log('🌌 UNIFIED CONCEPT:');
  console.log(`  "${result.unifiedConcept}"`);
  console.log();

  console.log('🔗 CROSS-PARADIGM EQUIVALENCES:');
  result.equivalences.forEach(eq => console.log(`  ≡ ${eq}`));
  console.log();

  console.log('📊 PARADIGM CONTRIBUTIONS:');
  result.paradigmContributions.forEach(contrib => {
    console.log(`  ${contrib.paradigm}:`);
    console.log(`    Insight: ${contrib.keyInsight}`);
    console.log(`    Notation: ${contrib.notation}`);
    console.log(`    Confidence: ${(contrib.confidence * 100).toFixed(0)}%`);
  });
  console.log();

  console.log('🎓 CATEGORY THEORY:');
  console.log(`  ${result.categoryTheory}`);
  console.log();

  console.log('📈 RESONANCE ANALYSIS:');
  console.log(`  Resonance: ${result.resonance.toFixed(2)}Hz`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`  Converged: ${result.converged ? 'Yes ✓' : 'No ✗'}`);
  console.log(`  Time: ${result.timeMs}ms`);
  console.log();

  console.log('='.repeat(70));
  console.log('INSIGHT:');
  console.log('  Paradigms resonate, not compete.');
  console.log('  Different languages discovered the SAME mathematical structure!');
  console.log('  Just like Quintinity: 5 AIs → 1 truth at 432Hz ✓');
  console.log('='.repeat(70));
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demoMonadUnification().catch(console.error);
}

export { demoMonadUnification };
