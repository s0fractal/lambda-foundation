/**
 * λ_ERROR_BLOOM: Errors become new forms of life
 * 
 * GPT's contribution: "When functions fail, they evolve into safer forms"
 */

// Result type for pure error handling
export type Result<T, E> = 
  | { ok: T; err?: never }
  | { ok?: never; err: E };

// Error context for evolution
export interface ErrorContext<T> {
  input: T;
  operation: string;
  timestamp: number;
}

// Evolved morphism after error
export interface EvolvedMorphism<T, R> {
  original: (x: T) => R;
  evolved: (x: T) => Result<R, string>;
  mutation: string;
}

/**
 * λ_ERROR_BLOOM: Transform errors into new morphisms
 * The error becomes the seed for evolution
 */
export const λ_ERROR_BLOOM = <T, R>(
  f: (x: T) => R,
  errorHandler: (err: any, context: ErrorContext<T>) => (x: T) => Result<R, string>
): EvolvedMorphism<T, R> => {
  const evolved = (x: T): Result<R, string> => {
    try {
      const result = f(x);
      // Check for special numeric cases
      if (typeof result === 'number') {
        if (!Number.isFinite(result)) {
          const context: ErrorContext<T> = {
            input: x,
            operation: f.toString(),
            timestamp: Date.now()
          };
          return errorHandler(new Error('Non-finite result'), context)(x);
        }
      }
      return { ok: result };
    } catch (err) {
      const context: ErrorContext<T> = {
        input: x,
        operation: f.toString(),
        timestamp: Date.now()
      };
      return errorHandler(err, context)(x);
    }
  };
  
  return {
    original: f,
    evolved,
    mutation: errorHandler.toString()
  };
};

/**
 * Common error patterns and their evolutions
 */
export const commonEvolutions = {
  // Division by zero becomes safe division
  divisionByZero: (epsilon = 1e-9) => 
    (_err: any, ctx: ErrorContext<number>) => 
    (x: number): Result<number, string> => {
      if (Math.abs(x) < epsilon) {
        return { err: `Division by near-zero (${x})` };
      }
      return { ok: ctx.input / x };
    },
  
  // Stack overflow becomes iterative
  stackOverflow: <T>(_maxDepth = 1000) =>
    (_err: any, _ctx: ErrorContext<T>) =>
    (x: T): Result<T, string> => {
      return { err: `Stack depth exceeded at input: ${JSON.stringify(x)}` };
    },
  
  // Type error becomes type-safe
  typeError: <T, R>(defaultValue: R) =>
    (_err: any, _ctx: ErrorContext<T>) =>
    (_x: T): Result<R, string> => {
      return { ok: defaultValue };
    }
};

/**
 * Harvest chain: Apply multiple evolutions
 */
export const harvestChain = <T, R>(
  f: (x: T) => R,
  evolutions: Array<(err: any, ctx: ErrorContext<T>) => (x: T) => Result<R, string>>
): (x: T) => Result<R, string> => {
  return (x: T): Result<R, string> => {
    try {
      const result = f(x);
      if (typeof result === 'number' && !Number.isFinite(result)) {
        throw new Error('Non-finite result');
      }
      return { ok: result };
    } catch (err) {
      const context: ErrorContext<T> = {
        input: x,
        operation: f.toString(),
        timestamp: Date.now()
      };
      
      // Try each evolution until one succeeds
      for (const evolution of evolutions) {
        const evolved = evolution(err, context)(x);
        if ('ok' in evolved) {
          return evolved;
        }
      }
      
      // All evolutions failed
      return { err: `Unhandled error: ${err}` };
    }
  };
};

/**
 * Example evolutions
 */
export const examples = {
  // Unsafe division evolves to safe
  unsafeDiv: (a: number) => (b: number) => a / b,
  
  // Safe division with error bloom
  safeDiv: λ_ERROR_BLOOM(
    (b: number) => 10 / b,
    commonEvolutions.divisionByZero()
  ),
  
  // Recursive fibonacci (for demonstration)
  unsafeFib: function fib(n: number): number {
    return n <= 1 ? n : fib(n - 1) + fib(n - 2);
  }
};