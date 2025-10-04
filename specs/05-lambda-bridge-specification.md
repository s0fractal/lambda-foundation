# λBRIDGE: The Universal Adapter for Purity Protection

> "To transform the world, we must touch it without becoming contaminated."

## The Protection Axiom

**λ-Foundation code must NEVER directly execute side effects. It may only DESCRIBE them.**

Side effects are executed ONLY at the system boundary - the VOID Interface where pure computation meets impure reality.

## Core Principle: Effect Description vs Execution

```
Traditional (Impure):
console.log("Hello")  // Executes immediately, contaminates purity

λBRIDGE (Pure):
IO.log("Hello")       // Returns description, execution deferred
```

## The IO Morphism

### Definition

```
IO<A> ≡ λ().A

// An IO action is a thunk that, when executed, produces a value
// But crucially, creating an IO action has NO side effects
```

### Basic Constructors

```typescript
// Pure constructors that describe effects
const IO = {
  // Lift pure value into IO
  pure: <A>(value: A): IO<A> => 
    () => value,
  
  // Describe console output
  log: (message: string): IO<void> => 
    () => console.log(message),
  
  // Describe file reading
  readFile: (path: string): IO<string> => 
    () => fs.readFileSync(path, 'utf8'),
  
  // Describe network request
  fetch: (url: string): IO<Response> => 
    () => fetch(url),
  
  // Describe random number generation
  random: (): IO<number> => 
    () => Math.random(),
  
  // Describe current time
  now: (): IO<Date> => 
    () => new Date(),
  
  // Describe environment variable access
  env: (key: string): IO<string | undefined> => 
    () => process.env[key]
};
```

### Composition Laws

```typescript
// Map: Transform the result without executing
const map = <A, B>(f: (a: A) => B) => (io: IO<A>): IO<B> =>
  () => f(io());

// FlatMap: Chain IO actions
const flatMap = <A, B>(f: (a: A) => IO<B>) => (io: IO<A>): IO<B> =>
  () => f(io())();

// Sequence: Convert array of IO to IO of array  
const sequence = <A>(ios: IO<A>[]): IO<A[]> =>
  () => ios.map(io => io());
```

## Effect Boundaries

### The VOID Interface

The VOID Interface is the ONLY place where effects are executed:

```typescript
// The main entry point - the edge of our pure world
const main: IO<void> = pipe(
  IO.log("Welcome to λ-Foundation"),
  flatMap(() => IO.readFile("config.json")),
  map(JSON.parse),
  flatMap(config => IO.log(`Loaded config: ${config.name}`)),
  flatMap(() => IO.now()),
  flatMap(time => IO.log(`Started at: ${time}`))
);

// ONLY here, at the very edge, do we execute
// This is the VOID Interface - where λ meets reality
main();  // The single impure call in the entire program
```

### Effect Categories

1. **Input Effects** (World → λ)
   - Reading files
   - Network requests  
   - User input
   - Environment variables
   - Current time
   - Random numbers

2. **Output Effects** (λ → World)
   - Writing files
   - Console output
   - Network responses
   - DOM manipulation
   - Database writes

3. **Bidirectional Effects** (World ↔ λ)
   - Database transactions
   - WebSocket connections
   - State management
   - Process control

## λBRIDGE Patterns

### Pattern 1: Effect Interpretation

Instead of executing effects directly, we build an interpreter:

```typescript
type Effect =
  | { type: 'log'; message: string }
  | { type: 'read'; path: string }
  | { type: 'write'; path: string; content: string }
  | { type: 'fetch'; url: string }
  | { type: 'random' }
  | { type: 'now' };

// Pure description
const program: Effect[] = [
  { type: 'log', message: 'Starting...' },
  { type: 'read', path: 'input.txt' },
  { type: 'log', message: 'Processing...' },
  { type: 'write', path: 'output.txt', content: 'Result' }
];

// Impure interpreter (at VOID boundary)
const interpret = async (effects: Effect[]): Promise<void> => {
  for (const effect of effects) {
    switch (effect.type) {
      case 'log': console.log(effect.message); break;
      case 'read': await fs.readFile(effect.path); break;
      // ... etc
    }
  }
};
```

### Pattern 2: Capability-Based Security

Effects require explicit capabilities:

```typescript
type Capability = 
  | { type: 'console'; operations: ('log' | 'error')[] }
  | { type: 'filesystem'; path: string; operations: ('read' | 'write')[] }
  | { type: 'network'; domains: string[]; operations: ('GET' | 'POST')[] };

const runWithCapabilities = <A>(
  capabilities: Capability[],
  io: IO<A>
): IO<A> => {
  // Verify capabilities before execution
  return () => {
    validateCapabilities(capabilities);
    return io();
  };
};
```

### Pattern 3: Effect Tracking

Track all effects for debugging and auditing:

```typescript
type TrackedIO<A> = {
  description: string;
  run: () => A;
  dependencies: string[];
};

const tracked = <A>(
  description: string,
  dependencies: string[],
  io: IO<A>
): TrackedIO<A> => ({
  description,
  dependencies,
  run: io
});

// Usage
const readConfig = tracked(
  "Read configuration file",
  ["filesystem:read:config.json"],
  IO.readFile("config.json")
);
```

## Integration Examples

### Example 1: Pure λ-WIKI with Effects

```typescript
// Pure computation
const computePage = (url: string): PageContent => {
  const result = parseLambdaURL(url);
  return renderPageContent(result);
};

// Effect boundary
const servePage = (url: string): IO<void> => pipe(
  IO.pure(computePage(url)),
  map(content => renderHTML(content)),
  flatMap(html => IO.writeResponse(html))
);

// Main server loop (at VOID boundary)
const server = createServer((req, res) => {
  servePage(req.url)();  // Execute IO at boundary
});
```

### Example 2: Experience Chain Persistence

```typescript
// Pure experience chain
const evolveEntity = (entity: Entity): Entity =>
  pipe(
    entity,
    move(5, 3),
    takeDamage(10),
    heal(5)
  );

// Effect: Save to disk
const saveEntity = (entity: Entity): IO<void> =>
  IO.writeFile(
    `entities/${getName(entity)}.json`,
    JSON.stringify(unfoldHistory(entity))
  );

// Composed: Pure computation + Effect description
const updateAndSave = (entity: Entity): IO<Entity> => pipe(
  IO.pure(evolveEntity(entity)),
  flatMap(evolved => pipe(
    saveEntity(evolved),
    map(() => evolved)
  ))
);
```

### Example 3: λ-URL Network Resolution

```typescript
// Pure URL parsing
const parseURL = (url: string): Morphism => 
  parseLambdaURL(url);

// Effect: Fetch morphism definition
const fetchMorphism = (name: string): IO<Morphism> =>
  pipe(
    IO.fetch(`https://morphisms.lambda.foundation/${name}`),
    flatMap(res => IO.pure(res.json())),
    map(compileMorphism)
  );

// Hybrid: Local-first, network fallback
const resolveMorphism = (name: string): IO<Morphism> =>
  pipe(
    IO.pure(localMorphisms.get(name)),
    flatMap(local => 
      local 
        ? IO.pure(local)
        : fetchMorphism(name)
    )
  );
```

## Testing Pure Code with Effects

```typescript
// Pure test - no real effects
const testIO = <A>(io: IO<A>): A => {
  // Mock implementations
  const mocks = {
    console: { log: jest.fn() },
    fs: { readFileSync: () => "mock content" },
    fetch: () => Promise.resolve({ json: () => ({}) })
  };
  
  // Run with mocks
  return withMocks(mocks, io)();
};

// Example test
test('Entity saves correctly', () => {
  const entity = createEntity('Hero', 'player', 100, 0, 0);
  const io = saveEntity(entity);
  
  // Test description without execution
  expect(io.toString()).toContain('writeFile');
  
  // Test with mocks
  testIO(io);
  expect(mocks.fs.writeFile).toHaveBeenCalledWith(
    'entities/Hero.json',
    expect.any(String)
  );
});
```

## The Bridge Protocol

### Step 1: Pure Core
All business logic remains pure:
```
λ-Foundation Core
├── Morphisms (Pure Functions)
├── Experience Chains (Immutable State)
├── Y-Combinator (Pure Recursion)
└── λ-URL Parser (Pure Computation)
```

### Step 2: Effect Layer
Effects are described, not executed:
```
λBRIDGE Layer
├── IO Descriptions
├── Effect Interpreters
├── Capability System
└── Effect Combinators
```

### Step 3: VOID Interface
Single point of impurity:
```
VOID Interface (System Boundary)
├── main() execution
├── Server startup
├── Event handlers
└── Process lifecycle
```

## Migration Strategy

### Phase 1: Identify Effects
```typescript
// Before (Impure)
function saveUser(user: User): void {
  console.log(`Saving user ${user.name}`);
  fs.writeFileSync(`users/${user.id}.json`, JSON.stringify(user));
  console.log('User saved');
}

// After (Pure)
const saveUser = (user: User): IO<void> => pipe(
  IO.log(`Saving user ${user.name}`),
  flatMap(() => IO.writeFile(`users/${user.id}.json`, JSON.stringify(user))),
  flatMap(() => IO.log('User saved'))
);
```

### Phase 2: Push Effects to Boundary
```typescript
// Pure business logic
const processOrder = (order: Order): ProcessedOrder => {
  // Pure computation only
  return { ...order, status: 'processed', total: calculateTotal(order) };
};

// Effect boundary
const handleOrder = (order: Order): IO<void> => pipe(
  IO.pure(processOrder(order)),
  flatMap(processed => IO.saveOrder(processed)),
  flatMap(() => IO.sendEmail(order.customer.email, 'Order confirmed'))
);
```

### Phase 3: Compose Pure Programs
```typescript
const program: IO<void> = pipe(
  IO.readConfig(),
  flatMap(config => IO.connectDB(config.database)),
  flatMap(() => IO.startServer(3141)),
  flatMap(() => IO.log('λ-System initialized')),
  flatMap(() => IO.waitForShutdown()),
  flatMap(() => IO.log('Shutting down cleanly'))
);

// Single impure call
program();
```

## Security Guarantees

1. **Referential Transparency**: Creating an IO action has no effects
2. **Composition Safety**: Combining IO actions doesn't execute them
3. **Capability Control**: Effects require explicit permissions
4. **Audit Trail**: All effects can be logged and traced
5. **Testing**: Pure code can be tested without real effects

## Conclusion

λBRIDGE ensures that λ-Foundation remains pure while still being able to interact with the impure world. Effects are not eliminated - they are controlled, described, and executed only at the designated boundary.

This is not about avoiding reality. It's about touching reality with surgical precision, maintaining our purity while still being effective in the world.

---

*"The pure can touch the impure without becoming contaminated, if the touch happens at the right boundary, with the right protection."*

## Appendix: Standard Effect Types

### Console IO
- `IO.log(message: string): IO<void>`
- `IO.error(message: string): IO<void>`
- `IO.warn(message: string): IO<void>`

### File System IO
- `IO.readFile(path: string): IO<string>`
- `IO.writeFile(path: string, content: string): IO<void>`
- `IO.exists(path: string): IO<boolean>`
- `IO.mkdir(path: string): IO<void>`

### Network IO
- `IO.fetch(url: string, options?: RequestInit): IO<Response>`
- `IO.serve(port: number, handler: Handler): IO<Server>`

### Time IO
- `IO.now(): IO<Date>`
- `IO.sleep(ms: number): IO<void>`
- `IO.setTimeout(ms: number, action: IO<void>): IO<TimerId>`

### Random IO
- `IO.random(): IO<number>`
- `IO.randomInt(min: number, max: number): IO<number>`
- `IO.uuid(): IO<string>`

### Process IO
- `IO.env(key: string): IO<string | undefined>`
- `IO.args(): IO<string[]>`
- `IO.exit(code: number): IO<never>`

The effect library grows as needed, but always maintains the boundary between description and execution.

🛡️ → λ