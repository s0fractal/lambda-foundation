/**
 * Phase 9.1: Algebraic Laws Database
 *
 * A library of proven λ-calculus laws for expression rewriting.
 *
 * Laws are bidirectional rewrite rules with formal proofs.
 */

import type { ASTNode } from './parser.js';

export interface AlgebraicLaw {
  name: string;
  description: string;

  // Pattern matching
  pattern: string; // Human-readable pattern
  matches: (node: ASTNode) => LawMatch | null;

  // Rewriting
  apply: (node: ASTNode, match: LawMatch) => ASTNode;

  // Proof
  proof: string;
  references: string[]; // Papers/books proving this law
}

export interface LawMatch {
  law: string;
  bindings: Map<string, ASTNode>; // Variable bindings from pattern
}

/**
 * FOLD-MAP Fusion Law
 *
 * Pattern: FOLD (λh. λacc. g (f h) acc) z xs
 * Rewrites to: FOLD g z (MAP f xs)
 *
 * This is the KEY law for proving H1 ≡ FLATMAP!
 */
export const FOLD_MAP_FUSION: AlgebraicLaw = {
  name: 'FOLD-MAP Fusion',
  description: 'Fuse a FOLD with embedded function application into FOLD ∘ MAP',

  pattern: 'FOLD (λh. λacc. g (f h) acc) z xs',

  matches: (node: ASTNode): LawMatch | null => {
    // Pattern: FOLD (λh. λacc. g (f h) acc) z xs
    // This is a 4-level application: ((FOLD lambda) z) xs)

    if (node.type !== 'application') return null;

    // xs is the outermost argument
    const xs = node.arg;

    // ((FOLD lambda) z) is the function
    if (node.func.type !== 'application') return null;
    const z = node.func.arg;

    // (FOLD lambda) is the inner function
    if (node.func.func.type !== 'application') return null;
    const lambda = node.func.func.arg;
    const foldFunc = node.func.func.func;

    // Check if function is FOLD identifier
    if (foldFunc.type !== 'variable' || foldFunc.name !== 'FOLD') return null;

    // Check if lambda has the pattern: λh. λacc. g (f h) acc
    if (lambda.type !== 'abstraction') return null;
    const h = lambda.param;

    if (lambda.body.type !== 'abstraction') return null;
    const acc = lambda.body.param;

    // Body should be: g (f h) acc
    // This is: ((g (f h)) acc)
    const body = lambda.body.body;
    if (body.type !== 'application') return null;

    // acc is the outermost argument
    const accVar = body.arg;
    if (accVar.type !== 'variable' || accVar.name !== acc) return null;

    // (g (f h)) is the function
    if (body.func.type !== 'application') return null;
    const g = body.func.func;
    const fh = body.func.arg;

    // (f h) should be an application
    if (fh.type !== 'application') return null;
    const f = fh.func;
    const hVar = fh.arg;

    // h should be a variable matching the parameter
    if (hVar.type !== 'variable' || hVar.name !== h) return null;

    // Success! Extract bindings
    const bindings = new Map<string, ASTNode>();
    bindings.set('f', f);
    bindings.set('g', g);
    bindings.set('z', z);
    bindings.set('xs', xs);

    return {
      law: 'FOLD-MAP Fusion',
      bindings,
    };
  },

  apply: (node: ASTNode, match: LawMatch): ASTNode => {
    // Transform: FOLD (λh. λacc. g (f h) acc) z xs
    // To:        FOLD g z (MAP f xs)

    const f = match.bindings.get('f')!;
    const g = match.bindings.get('g')!;
    const z = match.bindings.get('z')!;
    const xs = match.bindings.get('xs')!;

    // Build: MAP f xs
    const mapFXs: ASTNode = {
      type: 'application',
      func: {
        type: 'application',
        func: { type: 'variable', name: 'MAP' },
        arg: f,
      },
      arg: xs,
    };

    // Build: FOLD g z (MAP f xs)
    const result: ASTNode = {
      type: 'application',
      func: {
        type: 'application',
        func: {
          type: 'application',
          func: { type: 'variable', name: 'FOLD' },
          arg: g,
        },
        arg: z,
      },
      arg: mapFXs,
    };

    return result;
  },

  proof: `
FOLD-MAP Fusion Law:

Theorem: FOLD (λh. λacc. g (f h) acc) z xs ≡ FOLD g z (MAP f xs)

Proof by list induction:

Base case: xs = NIL
  LHS: FOLD (λh. λacc. g (f h) acc) z NIL
     = z  [by FOLD base case]

  RHS: FOLD g z (MAP f NIL)
     = FOLD g z NIL  [by MAP base case]
     = z  [by FOLD base case]

  LHS = RHS ✓

Inductive case: xs = CONS h t
  Assume: FOLD (λh. λacc. g (f h) acc) z t ≡ FOLD g z (MAP f t)  [IH]

  LHS: FOLD (λh. λacc. g (f h) acc) z (CONS h t)
     = (λh. λacc. g (f h) acc) h (FOLD (λh. λacc. g (f h) acc) z t)  [by FOLD inductive case]
     = g (f h) (FOLD (λh. λacc. g (f h) acc) z t)  [by β-reduction]
     = g (f h) (FOLD g z (MAP f t))  [by IH]

  RHS: FOLD g z (MAP f (CONS h t))
     = FOLD g z (CONS (f h) (MAP f t))  [by MAP inductive case]
     = g (f h) (FOLD g z (MAP f t))  [by FOLD inductive case]

  LHS = RHS ✓

∴ FOLD (λh. λacc. g (f h) acc) z xs ≡ FOLD g z (MAP f xs) ∎
  `.trim(),

  references: [
    'Bird, Richard. "Introduction to Functional Programming" (1988)',
    'Hutton, Graham. "A Tutorial on the Universality and Expressiveness of Fold" (1999)',
  ],
};

/**
 * MAP Fusion Law
 *
 * Pattern: MAP f (MAP g xs)
 * Rewrites to: MAP (f ∘ g) xs
 */
export const MAP_FUSION: AlgebraicLaw = {
  name: 'MAP Fusion',
  description: 'Fuse two MAP operations into one',

  pattern: 'MAP f (MAP g xs)',

  matches: (node: ASTNode): LawMatch | null => {
    // Pattern: MAP f (MAP g xs)
    // This is: ((MAP f) (MAP g xs))

    if (node.type !== 'application') return null;

    // (MAP g xs) is the argument
    const innerMap = node.arg;
    if (innerMap.type !== 'application') return null;

    const xs = innerMap.arg;
    if (innerMap.func.type !== 'application') return null;

    const g = innerMap.func.arg;
    const innerMapFunc = innerMap.func.func;
    if (innerMapFunc.type !== 'variable' || innerMapFunc.name !== 'MAP') return null;

    // (MAP f) is the function
    if (node.func.type !== 'application') return null;
    const f = node.func.arg;
    const outerMapFunc = node.func.func;
    if (outerMapFunc.type !== 'variable' || outerMapFunc.name !== 'MAP') return null;

    // Success!
    const bindings = new Map<string, ASTNode>();
    bindings.set('f', f);
    bindings.set('g', g);
    bindings.set('xs', xs);

    return {
      law: 'MAP Fusion',
      bindings,
    };
  },

  apply: (node: ASTNode, match: LawMatch): ASTNode => {
    // Transform: MAP f (MAP g xs)
    // To:        MAP (f ∘ g) xs

    const f = match.bindings.get('f')!;
    const g = match.bindings.get('g')!;
    const xs = match.bindings.get('xs')!;

    // Build: f ∘ g = λx. f (g x)
    const compose: ASTNode = {
      type: 'abstraction',
      param: 'x',
      body: {
        type: 'application',
        func: f,
        arg: {
          type: 'application',
          func: g,
          arg: { type: 'variable', name: 'x' },
        },
      },
    };

    // Build: MAP (f ∘ g) xs
    const result: ASTNode = {
      type: 'application',
      func: {
        type: 'application',
        func: { type: 'variable', name: 'MAP' },
        arg: compose,
      },
      arg: xs,
    };

    return result;
  },

  proof: `
MAP Fusion Law:

Theorem: MAP f (MAP g xs) ≡ MAP (f ∘ g) xs

Where: (f ∘ g) = λx. f (g x)

Proof by list induction:

Base case: xs = NIL
  LHS: MAP f (MAP g NIL)
     = MAP f NIL  [by MAP base case]
     = NIL  [by MAP base case]

  RHS: MAP (f ∘ g) NIL
     = NIL  [by MAP base case]

  LHS = RHS ✓

Inductive case: xs = CONS h t
  Assume: MAP f (MAP g t) ≡ MAP (f ∘ g) t  [IH]

  LHS: MAP f (MAP g (CONS h t))
     = MAP f (CONS (g h) (MAP g t))  [by MAP inductive case]
     = CONS (f (g h)) (MAP f (MAP g t))  [by MAP inductive case]
     = CONS (f (g h)) (MAP (f ∘ g) t)  [by IH]

  RHS: MAP (f ∘ g) (CONS h t)
     = CONS ((f ∘ g) h) (MAP (f ∘ g) t)  [by MAP inductive case]
     = CONS (f (g h)) (MAP (f ∘ g) t)  [by β-reduction of (f ∘ g) h]

  LHS = RHS ✓

∴ MAP f (MAP g xs) ≡ MAP (f ∘ g) xs ∎
  `.trim(),

  references: [
    'Bird, Richard. "Introduction to Functional Programming" (1988)',
  ],
};

/**
 * All algebraic laws available to the rewriting engine
 */
export const ALGEBRAIC_LAWS: AlgebraicLaw[] = [
  FOLD_MAP_FUSION,
  MAP_FUSION,
];
