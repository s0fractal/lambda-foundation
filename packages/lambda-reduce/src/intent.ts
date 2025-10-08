// λREDUCE Intent Recognition: Natural language → Morphisms
// "I want to collect emotions" → [subscribe, filter, compose, store]

export interface Intent {
  verb: string;           // "collect", "transform", "filter", "compose"
  subject: string;        // "emotions", "data", "events", "streams"
  constraints: string[];  // ["real-time", "persistent", "pure", "async"]
  raw: string;            // original user prompt
}

export interface Morphism {
  name: string;           // "subscribe", "map", "fold"
  signature: string;      // formal type signature
  category: 'source' | 'transform' | 'sink' | 'compose';
  purity: number;         // 0.0 (imperative) to 1.0 (pure λ-calculus)
}

// Intent vocabulary - maps natural language to morphisms
const INTENT_VOCABULARY: Record<string, Morphism[]> = {
  // Collection intents
  'collect': [
    { name: 'subscribe', signature: 'λs.λf.s(f)', category: 'source', purity: 1.0 },
    { name: 'gather', signature: 'λxs.fold(cons, nil, xs)', category: 'source', purity: 1.0 }
  ],
  'stream': [
    { name: 'subscribe', signature: 'λs.λf.s(f)', category: 'source', purity: 1.0 },
    { name: 'pipe', signature: 'λa.λb.compose(b, a)', category: 'compose', purity: 1.0 }
  ],

  // Transformation intents
  'transform': [
    { name: 'map', signature: 'λf.λxs.fold(λa.λb.cons(f(a), b), nil, xs)', category: 'transform', purity: 1.0 },
    { name: 'filter', signature: 'λp.λxs.fold(λa.λb.if(p(a), cons(a, b), b), nil, xs)', category: 'transform', purity: 1.0 }
  ],
  'filter': [
    { name: 'filter', signature: 'λp.λxs.fold(λa.λb.if(p(a), cons(a, b), b), nil, xs)', category: 'transform', purity: 1.0 },
    { name: 'reject', signature: 'λp.filter(not(p))', category: 'transform', purity: 1.0 }
  ],
  'reduce': [
    { name: 'fold', signature: 'λf.λz.λxs.xs(λa.λb.f(a)(fold(f)(z)(b)))(z)', category: 'transform', purity: 1.0 }
  ],

  // Storage intents
  'store': [
    { name: 'persist', signature: 'λx.λstore.store.write(x)', category: 'sink', purity: 0.3 },
    { name: 'cache', signature: 'λx.λmemo.memo.set(x)', category: 'sink', purity: 0.5 }
  ],
  'save': [
    { name: 'persist', signature: 'λx.λstore.store.write(x)', category: 'sink', purity: 0.3 }
  ],

  // Composition intents
  'compose': [
    { name: 'compose', signature: 'λf.λg.λx.f(g(x))', category: 'compose', purity: 1.0 },
    { name: 'pipe', signature: 'λf.λg.λx.g(f(x))', category: 'compose', purity: 1.0 }
  ],
  'combine': [
    { name: 'zip', signature: 'λxs.λys.zipWith(pair, xs, ys)', category: 'compose', purity: 1.0 },
    { name: 'merge', signature: 'λxs.λys.concat(xs, ys)', category: 'compose', purity: 1.0 }
  ]
};

// Constraint vocabulary - modifies morphism selection
const CONSTRAINT_VOCABULARY: Record<string, (morphisms: Morphism[]) => Morphism[]> = {
  'real-time': (ms) => ms.filter(m => m.category === 'source' || m.name === 'subscribe'),
  'persistent': (ms) => [...ms, { name: 'persist', signature: 'λx.λstore.store.write(x)', category: 'sink', purity: 0.3 }],
  'pure': (ms) => ms.filter(m => m.purity >= 0.9),
  'async': (ms) => ms.map(m => ({ ...m, name: `async${capitalize(m.name)}` })),
  'lazy': (ms) => ms.map(m => ({ ...m, signature: `λ_.${m.signature}` }))
};

/**
 * Parse natural language intent into structured format
 */
export function parseIntent(prompt: string): Intent {
  const normalized = prompt.toLowerCase();

  // Extract verb (first action word found)
  let verb = '';
  for (const v of Object.keys(INTENT_VOCABULARY)) {
    if (normalized.includes(v)) {
      verb = v;
      break;
    }
  }

  // Extract subject (noun after verb)
  const subjectMatch = normalized.match(/(?:collect|transform|store|filter|stream)\s+(\w+)/);
  const subject = subjectMatch?.[1] || 'data';

  // Extract constraints
  const constraints: string[] = [];
  for (const c of Object.keys(CONSTRAINT_VOCABULARY)) {
    if (normalized.includes(c)) {
      constraints.push(c);
    }
  }

  return {
    verb,
    subject,
    constraints,
    raw: prompt
  };
}

/**
 * Convert intent to morphisms
 */
export function intentToMorphisms(intent: Intent): Morphism[] {
  let morphisms = INTENT_VOCABULARY[intent.verb] || [];

  // Apply constraints
  for (const constraint of intent.constraints) {
    const modifier = CONSTRAINT_VOCABULARY[constraint];
    if (modifier) {
      morphisms = modifier(morphisms);
    }
  }

  return morphisms;
}

/**
 * Full pipeline: prompt → intent → morphisms
 */
export function recognizeIntent(prompt: string): {
  intent: Intent;
  morphisms: Morphism[];
  formalSignature: string;
} {
  const intent = parseIntent(prompt);
  const morphisms = intentToMorphisms(intent);

  // Generate formal signature
  const formalSignature = morphisms
    .map(m => `${m.name}: ${m.signature}`)
    .join('\n');

  return {
    intent,
    morphisms,
    formalSignature
  };
}

// Helpers
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Example usage:
 *
 * const result = recognizeIntent("I want to collect emotions in real-time");
 * // intent: { verb: "collect", subject: "emotions", constraints: ["real-time"] }
 * // morphisms: [subscribe, gather]
 * // formalSignature: "subscribe: λs.λf.s(f)\ngather: λxs.fold(cons, nil, xs)"
 */
