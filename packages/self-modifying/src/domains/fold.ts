// fold.ts
// Event 015: Universal Fold Across Domains
// Same algebra, different coalgebra

import type { Algebra, Coalgebra } from '../evolution/operators.js';
import type { TreeNode, Graph } from './types.js';
import { arrayCoalgebra, treeCoalgebra, graphCoalgebra, initGraphState } from './coalgebras.js';

/**
 * Universal fold implementation
 * Works on any domain that can be unfolded via coalgebra
 *
 * @param algebra - Function (acc: B, val: A) => B (domain-independent transformation)
 * @param init - Initial accumulator value
 * @param coalgebra - Function State => [A, State] | null (domain-specific unfolding)
 */
export const universalFold = <A, B, State>(
  algebra: Algebra<A, B>,  // (acc: B, val: A) => B
  init: B,
  coalgebra: (state: State) => [A, State] | null
) => {
  return (initialState: State): B => {
    let accumulator: B = init;
    let state: State | null = initialState;
    let iterations = 0;
    const maxIterations = 100000;

    while (state !== null && iterations < maxIterations) {
      const next = coalgebra(state);
      if (next === null) break;

      const [value, newState] = next;
      accumulator = algebra(accumulator, value);
      state = newState;
      iterations++;
    }

    return accumulator;
  };
};

/**
 * Fold on arrays (convenience wrapper)
 * Algebra<A, B> where A is value type, B is accumulator type
 */
export const foldArray = <A, B>(
  algebra: Algebra<A, B>,  // (acc: B, val: A) => B
  init: B
) => {
  return (arr: A[]): B => {
    return universalFold<A, B, A[]>(algebra, init, arrayCoalgebra as any)(arr);
  };
};

/**
 * Fold on trees (convenience wrapper)
 */
export const foldTree = <A, B>(
  algebra: Algebra<A, B>,
  init: B
) => {
  return (tree: TreeNode<A> | null): B => {
    if (!tree) return init;
    type TreeState = TreeNode<A> | TreeNode<A>[];
    return universalFold<A, B, TreeState>(algebra, init, treeCoalgebra as any)(tree);
  };
};

/**
 * Fold on graphs (convenience wrapper)
 */
export const foldGraph = <A, B>(
  algebra: Algebra<A, B>,
  init: B
) => {
  return (graph: Graph<A>): B => {
    const initialState = initGraphState(graph);
    type GraphStateType = typeof initialState;
    return universalFold<A, B, GraphStateType>(algebra, init, graphCoalgebra as any)(initialState);
  };
};

/**
 * Common algebras (domain-independent)
 * Algebra<A, B> signature: (acc: B, val: A) => B
 */
export const algebras = {
  sum: (acc: number, val: number) => acc + val,
  product: (acc: number, val: number) => acc * val,
  count: (acc: number, _val: any) => acc + 1,
  max: (acc: number, val: number) => Math.max(acc, val),
  min: (acc: number, val: number) => Math.min(acc, val),
  concat: (acc: string, val: string) => acc + val,
  collect: <T>(acc: T[], val: T) => [...acc, val],
  first: <T>(acc: T | null, val: T) => acc === null ? val : acc,  // Non-associative
};
