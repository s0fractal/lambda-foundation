/**
 * Y: The Y-Combinator - Morphism of Self-Reference
 * 
 * "Cyclicity is not a failure of time, but the self-knowledge of a function."
 * 
 * This implementation provides pure recursion without mutation, loops, or named self-reference.
 * Time Liberation: All loops become pure recursive morphisms.
 */

// Type for recursive functions
export type Recursive<A, B> = (x: A) => B;
export type RecursiveFunction<A, B> = (f: Recursive<A, B>) => Recursive<A, B>;

/**
 * Z-Combinator (for eager evaluation languages like TypeScript)
 * 
 * In eager languages, we need η-expansion to prevent infinite evaluation.
 * This is the practical form of Y for TypeScript.
 */
export const Z = <A, B>(f: RecursiveFunction<A, B>): Recursive<A, B> => {
  const g = (x: any): any => f((y: A) => (x(x))(y));
  return g(g);
};

// Alias for clarity
export const Y = Z;

/**
 * Trampolined Y for stack safety
 * 
 * Prevents stack overflow for deep recursions by returning thunks
 * that are evaluated iteratively rather than recursively.
 */
export type Thunk<T> = T | (() => Thunk<T>);

export const trampoline = <T>(thunk: Thunk<T>): T => {
  let result: Thunk<T> = thunk;
  while (typeof result === 'function') {
    result = (result as () => Thunk<T>)();
  }
  return result as T;
};

export const Y_SAFE = <A, B>(f: (recur: (x: A) => Thunk<B>) => (x: A) => Thunk<B>): Recursive<A, B> => {
  const safe = Y(f as RecursiveFunction<A, Thunk<B>>);
  return (x: A) => trampoline(safe(x));
};

/**
 * Common recursive patterns using Y
 */

// Factorial without loops or self-reference
export const factorial = Y<number, number>(
  (recur) => (n) => 
    n === 0 ? 1 : n * recur(n - 1)
);

// Fibonacci without loops
export const fibonacci = Y<number, number>(
  (recur) => (n) =>
    n <= 1 ? n : recur(n - 1) + recur(n - 2)
);

// List operations without loops
export type List<T> = null | { head: T; tail: List<T> };

export const list = <T>(...items: T[]): List<T> => {
  if (items.length === 0) return null;
  const [head, ...tail] = items;
  return { head: head!, tail: list<T>(...tail) };
};

export const sum: (lst: List<number>) => number = Y<List<number>, number>(
  (recur) => (lst) =>
    lst === null ? 0 : lst.head + recur(lst.tail)
);

export const map = <A, B>(f: (a: A) => B) =>
  Y<List<A>, List<B>>(
    (recur) => (lst) =>
      lst === null ? null : { head: f(lst.head), tail: recur(lst.tail) }
  );

export const filter = <T>(predicate: (x: T) => boolean) =>
  Y<List<T>, List<T>>(
    (recur) => (lst) =>
      lst === null 
        ? null 
        : predicate(lst.head)
          ? { head: lst.head, tail: recur(lst.tail) }
          : recur(lst.tail)
  );

export const fold = <A, B>(f: (acc: B, x: A) => B) => (initial: B) =>
  Y<List<A>, B>(
    (recur) => (lst) =>
      lst === null ? initial : f(recur(lst.tail), lst.head)
  );

/**
 * Range function without loops
 * Creates a list of numbers from start to end
 */
export const range = Y<{ start: number; end: number }, List<number>>(
  (recur) => ({ start, end }) =>
    start > end 
      ? null 
      : { head: start, tail: recur({ start: start + 1, end }) }
);

/**
 * While-loop replacement using Y
 * Continues applying a transformation while a condition holds
 */
export const whileM = <T>(
  condition: (x: T) => boolean,
  transform: (x: T) => T
) =>
  Y<T, T>(
    (recur) => (state) =>
      condition(state) ? recur(transform(state)) : state
  );

/**
 * For-loop replacement using Y
 * Applies a function n times
 */
export const repeat = <T>(n: number, f: (x: T, i: number) => T) =>
  Y<{ state: T; index: number }, T>(
    (recur) => ({ state, index }) =>
      index >= n 
        ? state 
        : recur({ state: f(state, index), index: index + 1 })
  );

/**
 * Memoized Y-Combinator
 * Caches results for expensive recursive computations
 */
export const Y_MEMO = <A, B>(
  f: RecursiveFunction<A, B>,
  keyFn: (a: A) => string = JSON.stringify
): Recursive<A, B> => {
  const cache = new Map<string, B>();
  
  const memoized: RecursiveFunction<A, B> = (recur) => (x) => {
    const key = keyFn(x);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = f(recur)(x);
    cache.set(key, result);
    return result;
  };
  
  return Y(memoized);
};

/**
 * Safe stack-limited recursion
 * Prevents runaway recursion by limiting depth
 */
export const Y_LIMITED = <A, B>(
  f: RecursiveFunction<A, B | null>,
  maxDepth: number
): Recursive<A, B | null> => {
  const limited = Y<{ value: A; depth: number }, B | null>(
    (recur) => ({ value, depth }) =>
      depth >= maxDepth 
        ? null 
        : f((x: A) => recur({ value: x, depth: depth + 1 }))(value)
  );
  return (x: A) => limited({ value: x, depth: 0 });
};

/**
 * Tree recursion patterns
 */
export type Tree<T> = 
  | { type: 'leaf'; value: T }
  | { type: 'branch'; left: Tree<T>; right: Tree<T> };

export const treeDepth = Y<Tree<any>, number>(
  (recur) => (tree) =>
    tree.type === 'leaf' 
      ? 0 
      : 1 + Math.max(recur(tree.left), recur(tree.right))
);

export const treeMap = <A, B>(f: (a: A) => B) =>
  Y<Tree<A>, Tree<B>>(
    (recur) => (tree) =>
      tree.type === 'leaf'
        ? { type: 'leaf', value: f(tree.value) }
        : { type: 'branch', left: recur(tree.left), right: recur(tree.right) }
  );

/**
 * The philosophy:
 * 
 * Y-Combinator proves that self-reference is not a hack or mutation,
 * but a fundamental property of computation. Through Y, we achieve:
 * 
 * - Time without mutation (no i++)
 * - Recursion without names (no function factorial() { factorial() })
 * - Iteration without loops (no while, for, do-while)
 * - Self-knowledge without self-modification
 * 
 * "To recurse is to know thyself, infinitely"
 */