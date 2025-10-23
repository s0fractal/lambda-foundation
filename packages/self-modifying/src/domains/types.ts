// types.ts
// Event 015: Cross-Domain Type Definitions
// Defines structures for Tree, Graph, and other domains

/**
 * Tree domain
 * Hierarchical structure with value and children
 */
export interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

/**
 * Graph domain
 * Vertices with values and directed edges
 */
export interface Graph<T> {
  vertices: Array<{
    id: string;
    value: T;
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
}

/**
 * Graph traversal state (for coalgebra)
 */
export interface GraphState<T> {
  graph: Graph<T>;
  visited: Set<string>;
  queue: string[];  // For BFS traversal
}

/**
 * Domain type discriminator
 */
export type Domain = 'array' | 'tree' | 'graph' | 'stream';

/**
 * Domain-specific data
 */
export type DomainData<T> =
  | { domain: 'array'; data: T[] }
  | { domain: 'tree'; data: TreeNode<T> }
  | { domain: 'graph'; data: Graph<T> };
