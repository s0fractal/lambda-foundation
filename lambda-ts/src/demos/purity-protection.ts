/**
 * Purity Protection Demo: λBRIDGE in Action
 * 
 * This demonstration shows how λ-Foundation maintains complete purity
 * while still interacting with the impure world through λBRIDGE.
 */

import { 
  IO, 
  map, 
  flatMap, 
  pipe,
  sequence,
  when,
  tryCatch,
  runIO,
  AsyncIO
} from '../core/lambda-bridge';

import {
  createEntity,
  move,
  takeDamage,
  heal,
  getHealth,
  getPosition,
  type Entity
} from '../core/form-liberation';

import {
  unfoldHistory,
  VALUE
} from '../core/experience';

console.log("=== λBRIDGE: Purity Protection Demonstration ===\n");

// 1. Pure vs Impure Comparison
console.log("1. Traditional (Impure) vs λBRIDGE (Pure):\n");

// IMPURE - Executes immediately, contaminates purity
console.log("   IMPURE: console.log executes immediately");
const impureRandom = Math.random();
console.log(`   IMPURE: Math.random() = ${impureRandom}`);

// PURE - Describes effects without executing
IO.log("   PURE: This message is described, not executed");
IO.random();
console.log("   PURE: IO.log and IO.random created but NOT executed");
console.log("   PURE: No side effects have occurred yet!\n");

// 2. Composing Effects Without Execution
console.log("2. Composing Pure Effect Descriptions:\n");

// Build complex effect chain
const effectChain = pipe(
  IO.log("   Step 1: Starting effect chain"),
  flatMap(() => IO.now()),
  flatMap(now => IO.log(`   Step 2: Current time is ${now}`)),
  flatMap(() => IO.random()),
  flatMap(rand => IO.log(`   Step 3: Random value is ${rand}`)),
  flatMap(() => IO.log("   Step 4: Chain complete"))
);

console.log("   Effect chain created but NOT executed");
console.log("   We can pass it around, compose it, test it - all purely!\n");

// 3. Pure Business Logic with Effect Boundaries
console.log("3. Pure Business Logic with Effect Boundaries:\n");

// Pure game logic
const playRound = (entity: Entity): Entity => {
  return pipe(
    entity,
    move(5, 3),
    takeDamage(20),
    heal(10)
  );
};

// Effect boundary - saving game state
const saveGameState = (entity: Entity): IO<void> => {
  const history = unfoldHistory(entity);
  const save = {
    name: VALUE(entity).name,
    health: getHealth(entity),
    position: getPosition(entity),
    history: history.map(h => h.context)
  };
  
  return IO.log(`   [SAVE] Game state: ${JSON.stringify(save, null, 2)}`);
};

// Composed: Pure logic + Effect description
const playAndSave = (entity: Entity): IO<Entity> => pipe(
  IO.pure(entity),
  map(playRound),
  flatMap(updated => pipe(
    saveGameState(updated),
    map(() => updated)
  ))
);

// Create game entity
const hero = createEntity('Lambda Hero', 'player', 100, 0, 0);
console.log("   Created hero (pure)");

// Create effect description
const gameSession = playAndSave(hero);
console.log("   Created game session (still pure - no effects!)");
console.log("   The hero hasn't moved, no damage taken, nothing saved\n");

// 4. Demonstrating the VOID Boundary
console.log("4. The VOID Boundary - Where Pure Meets Impure:\n");

console.log("   Crossing into the VOID...");
const updatedHero = runIO(gameSession) as Entity;
console.log("   Returned from the VOID");
console.log(`   Hero is now at ${JSON.stringify(getPosition(updatedHero))} with ${getHealth(updatedHero)} HP\n`);

// 5. Effect Tracking and Auditing
console.log("5. Effect Tracking for Security and Debugging:\n");

type AuditState = {
  start: Date;
  roll?: number;
  success?: boolean;
};

const auditedProgram = pipe(
  IO.log("   [AUDIT] Program starting"),
  flatMap(() => IO.now()),
  map((start): AuditState => ({ start })),
  flatMap((state: AuditState) => pipe(
    IO.randomInt(1, 100),
    map((roll): AuditState => ({ ...state, roll }))
  )),
  flatMap((state: AuditState) => pipe(
    when(state.roll! > 50)(IO.log(`   [AUDIT] Success! Rolled ${state.roll}`)),
    map((): AuditState => ({ ...state, success: state.roll! > 50 }))
  )),
  flatMap((result: AuditState) => pipe(
    IO.now(),
    flatMap((end: Date) => IO.log(`   [AUDIT] Completed in ${end.getTime() - result.start.getTime()}ms`)),
    map(() => result)
  ))
);

runIO(auditedProgram);
console.log();

// 6. Error Handling in Pure Context
console.log("6. Pure Error Handling:\n");

const riskyOperation = (): number => {
  if (Math.random() > 0.5) {
    throw new Error("Random failure!");
  }
  return 42;
};

const safeOperation = tryCatch(
  IO.of(riskyOperation)
)(error => {
  console.log(`   Caught error: ${error.message}`);
  return -1;
});

console.log("   Running risky operation 3 times:");
runIO(sequence([safeOperation, safeOperation, safeOperation]));
console.log();

// 7. Async Effects with AsyncIO
console.log("7. Async Effects (Simulated):\n");

pipe(
  AsyncIO.pure("Starting async flow"),
  AsyncIO.map(msg => {
    console.log(`   ${msg}`);
    return msg;
  }),
  AsyncIO.flatMap(() => AsyncIO.sleep(100)),
  AsyncIO.flatMap(() => AsyncIO.pure("Async operation complete")),
  AsyncIO.map(msg => {
    console.log(`   ${msg}`);
    return msg;
  })
);

// Note: In real implementation, this would be async
console.log("   Created async effect chain (not executed)");
console.log();

// 8. The Philosophy in Practice
console.log("8. The Philosophy of λBRIDGE:\n");

const philosophicalProgram1 = pipe(
  IO.log("   'To transform the world, we must touch it without becoming contaminated.'"),
  flatMap(() => IO.log("   ")),
  flatMap(() => IO.log("   Traditional approach: Effects everywhere, purity nowhere")),
  flatMap(() => IO.log("   λBRIDGE approach: Effects at the boundary, purity everywhere else")),
  flatMap(() => IO.log("   ")),
  flatMap(() => IO.log("   We don't avoid reality - we control how we touch it"))
);

const philosophicalProgram = pipe(
  philosophicalProgram1,
  flatMap(() => IO.log("   Every effect is described, tracked, and executed with precision")),
  flatMap(() => IO.log("   ")),
  flatMap(() => IO.log("   The result: Total purity with total power"))
);

runIO(philosophicalProgram);
console.log();

// 9. Testing Pure Code
console.log("9. Testing Without Real Effects:\n");

// Test description
pipe(
  IO.log("This would log to console"),
  flatMap(() => IO.random()),
  flatMap(n => IO.log(`Random: ${n}`)),
  map(() => "Test complete")
);

// We can inspect without executing
console.log("   Test program created but not executed");
console.log("   In tests, we would mock the effects");
console.log("   The business logic remains 100% testable\n");

// 10. The Final Proof
console.log("10. The Final Proof - Purity Maintained:\n");

const finalProof1 = pipe(
  IO.log("   λ-Foundation remains pure because:"),
  flatMap(() => IO.log("   1. Effects are values, not executions")),
  flatMap(() => IO.log("   2. Composition doesn't trigger side effects")),
  flatMap(() => IO.log("   3. The VOID boundary is explicit and controlled")),
  flatMap(() => IO.log("   4. All effects can be mocked, tracked, and audited"))
);

const finalProof = pipe(
  finalProof1,
  flatMap(() => IO.log("   5. Business logic never directly touches the impure world")),
  flatMap(() => IO.log("   ")),
  flatMap(() => IO.log("   λBRIDGE: The guardian of our purity 🛡️"))
);

runIO(finalProof);
console.log();

console.log("=== Demonstration Complete ===");
console.log();
console.log("Remember: In production code, there would be exactly ONE runIO call");
console.log("at the program's entry point. Everything else remains pure.");
console.log();
console.log("Welcome to protected purity. 🛡️ → λ");

// Export for further use
export { effectChain, gameSession, auditedProgram };