/**
 * documentation/generateSelfDocumentation.ts
 * Event 010: Self-Documentation Generation
 *
 * Автоматична генерація README.md для автономно відкритих морфізмів.
 * Це онтологічний обов'язок, не feature.
 */

import { inferIntent, type InferredIntent } from './inferIntent.js';
import type { EvolvableMorphism } from '../evolution/operators.js';
import type { FitnessResult } from '../evolution/evolve.js';

export interface DocumentationInput<A, B, C> {
  morphism: EvolvableMorphism<A, B, C> & { postProcess?: (result: B) => any };
  fitness: FitnessResult;
  testCases: Array<{ input: any; expected: any; description?: string }>;
  generation: number;
}

/**
 * Generate complete README.md for a morphism
 *
 * Онтологічний стандарт:
 * 1. Інтенція (inferred from tests)
 * 2. Форма (Platonic λ-calculus)
 * 3. Genealogy (parents, generation, mutations)
 * 4. Validation (tests, purity, ≤2 Rule)
 * 5. Mathematical Equivalence
 * 6. Usage (examples)
 * 7. Ontological Status
 */
export const generateSelfDocumentation = <A, B, C>(
  input: DocumentationInput<A, B, C>
): string => {
  const { morphism, fitness, testCases, generation } = input;

  // Інферуємо інтенцію з test cases
  const intent = inferIntent(testCases);

  // Build README sections
  const sections: string[] = [];

  // Header
  sections.push(generateHeader(morphism, intent));

  // Інтенція
  sections.push(generateIntentSection(intent));

  // Форма (Platonic)
  sections.push(generateFormSection(morphism));

  // Genealogy
  sections.push(generateGenealogySection(morphism, generation));

  // Validation
  sections.push(generateValidationSection(fitness, testCases));

  // Mathematical Equivalence
  sections.push(generateEquivalenceSection(intent, morphism));

  // Usage
  sections.push(generateUsageSection(testCases));

  // Ontological Status
  sections.push(generateOntologicalStatusSection());

  // Footer
  sections.push(generateFooter(morphism, intent));

  return sections.join('\n\n');
};

// ============================================================================
// SECTION GENERATORS
// ============================================================================

const generateHeader = (morphism: EvolvableMorphism<any, any, any> & { postProcess?: (result: any) => any }, intent: InferredIntent): string => {
  const semanticName = intent.semanticName !== 'unknown' ? ` (${intent.semanticName})` : '';
  return `# ${morphism.name}${semanticName}`;
};

const generateIntentSection = (intent: InferredIntent): string => {
  return `## Інтенція

${intent.description}

**Confidence**: ${(intent.confidence * 100).toFixed(1)}%
**Pattern detected**: ${intent.pattern}`;
};

const generateFormSection = (morphism: EvolvableMorphism<any, any, any> & { postProcess?: (result: any) => any }): string => {
  // Convert algebra to λ-calculus representation (simplified)
  const algebraStr = morphism.algebra.toString();

  // Try to extract λ form
  const lambdaForm = algebraToLambda(algebraStr);

  return `## Форма (Platonic)

\`\`\`λ
${lambdaForm}
\`\`\`

**TypeScript projection**:
\`\`\`typescript
algebra: ${algebraStr}
init: ${JSON.stringify(morphism.init)}
${morphism.postProcess ? `postProcess: ${morphism.postProcess.toString()}` : ''}
\`\`\``;
};

const generateGenealogySection = (morphism: EvolvableMorphism<any, any, any>, generation: number): string => {
  const parents = morphism.metadata?.parents || [];
  const mutations = morphism.metadata?.mutations || [];

  return `## Genealogy

- **Parents**: ${parents.length > 0 ? parents.map(p => `\`${p}\``).join(', ') : 'none (initial population)'}
- **Generation**: ${generation}
- **Mutations**: ${mutations.length > 0 ? mutations.map(m => `\`${m}\``).join(', ') : 'none'}

**Birth process**:
${parents.length > 0
    ? `1. Crossover: \`${parents[0]}\` × \`${parents[1]}\`\n${mutations.length > 0 ? `2. Mutations: ${mutations.join(' → ')}\n` : ''}3. Selection: Highest fitness in generation ${generation}`
    : 'Initial population member'}`;
};

const generateValidationSection = (fitness: FitnessResult, testCases: Array<{ input: any; expected: any }>): string => {
  const testsPassed = Math.round(fitness.testsPassed * testCases.length);

  return `## Validation

**Test results**:
- **Tests passed**: ${testsPassed}/${testCases.length} (${(fitness.testsPassed * 100).toFixed(1)}%)
- **Purity**: ${fitness.purity.toFixed(2)} ${fitness.purity === 1.0 ? '✅' : '⚠️'}
- **≤2 Rule**: ${fitness.valid ? '✅' : '❌'} (complexity: ${fitness.simplicity.toFixed(2)})

**Fitness breakdown**:
- **Overall**: ${fitness.overall.toFixed(3)}
- **Purity**: ${fitness.purity.toFixed(3)}
- **Simplicity**: ${fitness.simplicity.toFixed(3)}
- **Performance**: ${fitness.performance.toFixed(3)}
- **Novelty**: ${fitness.novelty.toFixed(3)}

${fitness.testsPassed === 1.0 && fitness.purity === 1.0 && fitness.valid
    ? '**Status**: ✅ Fully validated — passes all tests, pure, ontologically sound'
    : '**Status**: ⚠️ Partial validation — needs improvement'}`;
};

const generateEquivalenceSection = (intent: InferredIntent, morphism: EvolvableMorphism<any, any, any> & { postProcess?: (result: any) => any }): string => {
  // Generate mathematical equivalence based on intent
  let equivalence = '';

  switch (intent.semanticName) {
    case 'average':
      equivalence = `\`\`\`
(x₁ + x₂ + ... + xₙ) / n ≡ fold({sum, count}) / count

Proof by construction:
  fold((acc, x) => ({ sum: acc.sum + x, count: acc.count + 1 }))
    ({ sum: 0, count: 0 })
    [x₁, x₂, ..., xₙ]

  = { sum: x₁ + x₂ + ... + xₙ, count: n }

  postProcess(result) = result.sum / result.count
                      = (x₁ + x₂ + ... + xₙ) / n

  ∴ Isomorphic to mathematical average
\`\`\``;
      break;

    case 'sum':
      equivalence = `\`\`\`
x₁ + x₂ + ... + xₙ ≡ fold(+, 0)
\`\`\``;
      break;

    case 'product':
      equivalence = `\`\`\`
x₁ × x₂ × ... × xₙ ≡ fold(×, 1)
\`\`\``;
      break;

    case 'max':
      equivalence = `\`\`\`
max(x₁, x₂, ..., xₙ) ≡ fold(max, -∞)
\`\`\``;
      break;

    case 'min':
      equivalence = `\`\`\`
min(x₁, x₂, ..., xₙ) ≡ fold(min, +∞)
\`\`\``;
      break;

    default:
      equivalence = `\`\`\`
Mathematical equivalence not yet determined.
Pattern: ${intent.pattern}
\`\`\``;
  }

  return `## Mathematical Equivalence

${equivalence}`;
};

const generateUsageSection = (testCases: Array<{ input: any; expected: any; description?: string }>): string => {
  const examples = testCases.slice(0, 3).map(tc => {
    const inputStr = typeof tc.input === 'number'
      ? `[0..${tc.input - 1}]`
      : JSON.stringify(tc.input);

    return `morphism(${inputStr})  // → ${tc.expected}${tc.description ? ` (${tc.description})` : ''}`;
  }).join('\n');

  return `## Usage

\`\`\`typescript
${examples}
\`\`\``;
};

const generateOntologicalStatusSection = (): string => {
  return `## Ontological Status

**Current**: Candidate
**Path to Canon**: Candidate → Verified (3 resonances) → Canonical (community validation)

**Resonances**: 0/3

This morphism was autonomously discovered through genetic evolution.
It awaits community resonance before becoming canonical.`;
};

const generateFooter = (morphism: EvolvableMorphism<any, any, any> & { postProcess?: (result: any) => any }, intent: InferredIntent): string => {
  const date = new Date().toISOString().split('T')[0];

  return `---

**Generated**: ${date}
**Event**: 010 (Self-Documentation)
**Status**: Candidate morphism awaiting validation

🌌 Autonomously discovered by Noosphere
📐 Self-documented through ontological responsibility
✨ ${intent.semanticName} — truth emergent from constraints`;
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert JavaScript algebra to λ-calculus representation (simplified)
 */
const algebraToLambda = (algebraStr: string): string => {
  // Simple heuristic conversion
  // (acc, x) => ... → λacc.λx. ...

  // Try to extract parameters
  const paramsMatch = algebraStr.match(/\(([^)]+)\)\s*=>/);
  if (!paramsMatch) {
    return algebraStr; // Can't parse, return as is
  }

  const params = paramsMatch[1].split(',').map(p => p.trim());

  // Try to extract body
  const bodyMatch = algebraStr.match(/=>\s*(.+)/);
  const body = bodyMatch ? bodyMatch[1].trim() : '...';

  // Build λ form
  const lambdaPrefix = params.map(p => `λ${p}.`).join('');

  // Simplify body for λ-calculus
  let lambdaBody = body;

  // Remove curly braces for simple expressions
  if (lambdaBody.startsWith('(') && lambdaBody.endsWith(')')) {
    lambdaBody = lambdaBody.slice(1, -1);
  }

  // Replace JavaScript operators with λ-calculus equivalents
  lambdaBody = lambdaBody
    .replace(/\+/g, '+')
    .replace(/\*/g, '×')
    .replace(/Math\.max/g, 'max')
    .replace(/Math\.min/g, 'min');

  return `${lambdaPrefix}${lambdaBody}`;
};
