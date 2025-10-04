/**
 * λBRIDGE: Universal Adapter for Purity Protection
 * 
 * "To transform the world, we must touch it without becoming contaminated."
 * 
 * This module provides the IO monad and effect management system
 * that allows λ-Foundation to interact with the impure world
 * while maintaining complete purity.
 */

// IO is a thunk that describes an effect without executing it
export type IO<A> = () => A;

// Basic IO constructors
export const IO = {
  // Lift a pure value into IO context
  pure: <A>(value: A): IO<A> => 
    () => value,

  // Create IO from a thunk
  of: <A>(thunk: () => A): IO<A> => 
    thunk,

  // Console effects
  log: (message: string): IO<void> => 
    () => console.log(message),
    
  error: (message: string): IO<void> => 
    () => console.error(message),
    
  warn: (message: string): IO<void> => 
    () => console.warn(message),

  // Time effects
  now: (): IO<Date> => 
    () => new Date(),
    
  timestamp: (): IO<number> => 
    () => Date.now(),

  // Random effects
  random: (): IO<number> => 
    () => Math.random(),
    
  randomInt: (min: number, max: number): IO<number> => 
    () => Math.floor(Math.random() * (max - min + 1)) + min,

  // Delay effect
  delay: (ms: number): IO<void> => 
    () => { 
      const start = Date.now();
      while (Date.now() - start < ms) {} 
    }
};

// IO combinators with proper type inference
export function map<A, B>(f: (a: A) => B): (io: IO<A>) => IO<B>;
export function map<A, B>(f: (a: A) => B) {
  return (io: IO<A>): IO<B> => () => f(io());
}

export function flatMap<A, B>(f: (a: A) => IO<B>): (io: IO<A>) => IO<B>;
export function flatMap<A, B>(f: (a: A) => IO<B>) {
  return (io: IO<A>): IO<B> => () => f(io())();
}

export const chain = flatMap; // Alias

// Apply a function in IO context
export const ap = <A, B>(iof: IO<(a: A) => B>) => (ioa: IO<A>): IO<B> =>
  () => iof()(ioa());

// Sequencing operations
export const sequence = <A>(ios: IO<A>[]): IO<A[]> =>
  () => ios.map(io => io());

// Traverse with IO
export const traverse = <A, B>(f: (a: A) => IO<B>) => (as: A[]): IO<B[]> =>
  sequence(as.map(f));

// Pipe for IO composition with better type inference
export function pipe<A>(value: A): A;
export function pipe<A, B>(value: A, fn1: (a: A) => B): B;
export function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C;
export function pipe<A, B, C, D>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D): D;
export function pipe<A, B, C, D, E>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E): E;
export function pipe<A, B, C, D, E, F>(value: A, fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D, fn4: (d: D) => E, fn5: (e: E) => F): F;
export function pipe(value: any, ...fns: Array<(a: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Conditional IO
export const when = (condition: boolean) => <A>(io: IO<A>): IO<A | void> =>
  condition ? io : IO.pure(undefined);

export const unless = (condition: boolean) => <A>(io: IO<A>): IO<A | void> =>
  when(!condition)(io);

// Catching errors in IO
export const tryCatch = <A>(io: IO<A>) => (onError: (e: Error) => A): IO<A> =>
  () => {
    try {
      return io();
    } catch (e) {
      return onError(e as Error);
    }
  };

// Effect tracking for debugging
export type TrackedIO<A> = {
  description: string;
  io: IO<A>;
  timestamp: number;
};

export const track = <A>(description: string) => (io: IO<A>): TrackedIO<A> => ({
  description,
  io,
  timestamp: Date.now()
});

// Run tracked IO
export const runTracked = <A>(tracked: TrackedIO<A>): A => {
  console.log(`[IO] ${tracked.description} at ${new Date(tracked.timestamp)}`);
  const result = tracked.io();
  console.log(`[IO] Completed: ${tracked.description}`);
  return result;
};

// Capability system
export type Capability = 
  | { type: 'console'; operations: ReadonlyArray<'log' | 'error' | 'warn'> }
  | { type: 'time'; operations: ReadonlyArray<'now' | 'timestamp'> }
  | { type: 'random'; operations: ReadonlyArray<'random' | 'randomInt'> };

export const withCapabilities = <A>(
  capabilities: ReadonlyArray<Capability>,
  io: IO<A>
): IO<A> => {
  // In a real implementation, this would verify capabilities
  // For now, just log them
  return pipe(
    IO.log(`Running with capabilities: ${JSON.stringify(capabilities)}`),
    flatMap(() => io)
  );
};

// Example: Building a pure program with effects
export const exampleProgram: IO<void> = (() => {
  const step1 = IO.log("Starting pure λ-Foundation program...");
  const step2 = flatMap(() => IO.now())(step1);
  const step3 = flatMap((now: Date) => IO.log(`Current time: ${now}`))(step2);
  const step4 = flatMap(() => IO.random())(step3);
  const step5 = flatMap((rand: number) => IO.log(`Random value: ${rand}`))(step4);
  const step6 = flatMap(() => IO.delay(1000))(step5);
  const step7 = flatMap(() => IO.log("Program complete!"))(step6);
  return step7;
})();

// Testing utilities
export type MockEffects = {
  console?: {
    log?: jest.Mock;
    error?: jest.Mock;
    warn?: jest.Mock;
  };
  date?: {
    now?: () => Date;
  };
  math?: {
    random?: () => number;
  };
};

export const withMocks = <A>(mocks: MockEffects, io: IO<A>): IO<A> => {
  // Save original implementations
  const originals = {
    console: { ...console },
    Date: { now: Date.now },
    Math: { random: Math.random }
  };

  return () => {
    // Apply mocks
    if (mocks.console) {
      Object.assign(console, mocks.console);
    }
    if (mocks.date?.now) {
      Date.now = () => mocks.date!.now!().getTime();
    }
    if (mocks.math?.random) {
      Math.random = mocks.math.random;
    }

    try {
      // Run IO with mocks
      return io();
    } finally {
      // Restore originals
      Object.assign(console, originals.console);
      Date.now = originals.Date.now;
      Math.random = originals.Math.random;
    }
  };
};

// The VOID Interface - the single point where effects are executed
export const runIO = <A>(io: IO<A>): A => {
  console.log("[VOID] Crossing the pure/impure boundary...");
  const result = io();
  console.log("[VOID] Returned to pure land");
  return result;
};

// Alternative: async IO for Promise-based effects
export type AsyncIO<A> = IO<Promise<A>>;

export const AsyncIO = {
  pure: <A>(value: A): AsyncIO<A> => 
    () => Promise.resolve(value),

  of: <A>(promise: () => Promise<A>): AsyncIO<A> => 
    promise,

  map: <A, B>(f: (a: A) => B) => (io: AsyncIO<A>): AsyncIO<B> =>
    () => io().then(f),

  flatMap: <A, B>(f: (a: A) => AsyncIO<B>) => (io: AsyncIO<A>): AsyncIO<B> =>
    () => io().then(a => f(a)()),

  // Common async effects
  fetch: (url: string, options?: RequestInit): AsyncIO<Response> =>
    () => fetch(url, options),

  sleep: (ms: number): AsyncIO<void> =>
    () => new Promise(resolve => setTimeout(resolve, ms))
};

/**
 * The key insight: Effects are not avoided, they are controlled.
 * 
 * By describing effects as values (IO actions), we can:
 * 1. Compose them without executing
 * 2. Test them without side effects
 * 3. Track and audit all effects
 * 4. Maintain referential transparency
 * 
 * The impure world exists, but it touches our pure code
 * only at the VOID boundary, under our complete control.
 */