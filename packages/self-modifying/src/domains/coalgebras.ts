// coalgebras.ts
// Event 015: Cross-Domain Coalgebras
// Domain-specific unfolding strategies (structure → values)

import type { Coalgebra } from '../evolution/operators.js';
import type { TreeNode, Graph, GraphState } from './types.js';

/**
 * Array coalgebra (baseline)
 * Unfolds array sequentially
 */
export const arrayCoalgebra = <T>(state: T[]): [T, T[]] | null => {
  if (state.length === 0) return null;
  const [head, ...tail] = state;
  return [head, tail];
};

/**
 * Tree coalgebra
 * Unfolds tree in depth-first order
 *
 * Strategy: Extract root value, flatten children for next iteration
 */
export const treeCoalgebra = <T>(state: TreeNode<T> | TreeNode<T>[] | null): [T, TreeNode<T>[]] | null => {
  // Handle array of trees (flattened children from previous step)
  if (Array.isArray(state)) {
    if (state.length === 0) return null;
    const [first, ...rest] = state;
    return [first.value, [...first.children, ...rest]];
  }

  // Handle single tree
  if (!state) return null;
  return [state.value, state.children];
};

/**
 * Graph coalgebra (BFS traversal)
 * Unfolds graph vertices in breadth-first order
 *
 * State includes visited set to avoid cycles
 */
export const graphCoalgebra = <T>(state: GraphState<T> | null): [T, GraphState<T>] | null => {
  if (!state) return null;

  const { graph, visited, queue } = state;

  // Find next unvisited vertex
  let nextId: string | undefined;

  if (queue.length > 0) {
    // Continue BFS from queue
    nextId = queue.shift();
  } else {
    // Start new BFS component
    nextId = graph.vertices.find(v => !visited.has(v.id))?.id;
  }

  if (!nextId) return null; // All vertices visited

  const vertex = graph.vertices.find(v => v.id === nextId);
  if (!vertex) return null;

  // Mark as visited
  const newVisited = new Set(visited);
  newVisited.add(nextId);

  // Add neighbors to queue
  const neighbors = graph.edges
    .filter(e => e.from === nextId)
    .map(e => e.to)
    .filter(id => !newVisited.has(id));

  const newQueue = [...queue, ...neighbors];

  return [
    vertex.value,
    {
      graph,
      visited: newVisited,
      queue: newQueue
    }
  ];
};

/**
 * Helper: Convert array to tree (for testing)
 */
export const arrayToTree = <T>(arr: T[]): TreeNode<T> | null => {
  if (arr.length === 0) return null;

  // Simple strategy: first element is root, rest are children as leaves
  const [head, ...tail] = arr;
  return {
    value: head,
    children: tail.map(v => ({ value: v, children: [] }))
  };
};

/**
 * Helper: Convert array to graph (linear chain)
 */
export const arrayToGraph = <T>(arr: T[]): Graph<T> => {
  const vertices = arr.map((value, i) => ({
    id: `v${i}`,
    value
  }));

  const edges = arr.slice(0, -1).map((_, i) => ({
    from: `v${i}`,
    to: `v${i + 1}`
  }));

  return { vertices, edges };
};

/**
 * Helper: Create initial graph state for coalgebra
 */
export const initGraphState = <T>(graph: Graph<T>): GraphState<T> => ({
  graph,
  visited: new Set(),
  queue: []
});
