/**
 * Purity Protection Demo: λBRIDGE in Action (Simplified)
 * 
 * This demonstration shows how λ-Foundation maintains complete purity
 * while still interacting with the impure world through λBRIDGE.
 */

import { 
  IO, 
  runIO
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

console.log("=== λBRIDGE: Purity Protection Demonstration ===\n");

// 1. Pure vs Impure Comparison
console.log("1. Traditional (Impure) vs λBRIDGE (Pure):\n");

// IMPURE - Executes immediately
console.log("   IMPURE: This executes immediately");
const impureRandom = Math.random();
console.log(`   IMPURE: Math.random() = ${impureRandom}`);
console.log();

// PURE - Describes effects without executing
const pureProgram = () => {
  console.log("   PURE: This is inside an IO action");
  const pureRandom = Math.random();
  console.log(`   PURE: Random value = ${pureRandom}`);
  return pureRandom;
};

console.log("   PURE: Created IO action (not executed yet)");
console.log("   PURE: No console output or random generation has occurred!\n");

// 2. The VOID Boundary
console.log("2. The VOID Boundary - Crossing Pure/Impure:\n");
console.log("   Now executing the IO action...");
const result = runIO(pureProgram);
console.log(`   Result from VOID: ${result}\n`);

// 3. Pure Business Logic with Effects
console.log("3. Pure Business Logic with Effect Boundaries:\n");

// Pure game logic
const playRound = (entity: Entity): Entity => {
  const moved = move(5, 3)(entity);
  const damaged = takeDamage(20)(moved);
  const healed = heal(10)(damaged);
  return healed;
};

// Effect: Log game state
const logGameState = (entity: Entity): IO<void> => () => {
  console.log(`   [GAME] ${getPosition(entity).x}, ${getPosition(entity).y} - ${getHealth(entity)} HP`);
};

// Composed
const playAndLog = (entity: Entity): IO<Entity> => () => {
  const updated = playRound(entity);
  logGameState(updated)();
  return updated;
};

const hero = createEntity('Lambda Hero', 'player', 100, 0, 0);
console.log("   Created hero (pure - no effects)");

const gameIO = playAndLog(hero);
console.log("   Created game action (pure - not executed)");

console.log("   Executing game action...");
const updatedHero = runIO(gameIO);
console.log(`   Hero final state: pos(${getPosition(updatedHero).x},${getPosition(updatedHero).y}) ${getHealth(updatedHero)}HP\n`);

// 4. Effect Tracking
console.log("4. Effect Composition and Tracking:\n");

const program1: IO<void> = () => console.log("   Effect 1: Starting");
const program2: IO<number> = () => {
  console.log("   Effect 2: Generating random");
  return Math.random();
};
const program3 = (n: number): IO<void> => () => console.log(`   Effect 3: Result is ${n}`);

// Compose effects manually
const composed: IO<void> = () => {
  program1();
  const n = program2();
  program3(n)();
};

console.log("   Created 3 separate effects and composed them");
console.log("   Executing composition...");
runIO(composed);
console.log();

// 5. Error Handling
console.log("5. Pure Error Handling:\n");

const riskyIO: IO<number> = () => {
  if (Math.random() > 0.5) {
    throw new Error("Random failure!");
  }
  return 42;
};

const safeIO: IO<number> = () => {
  try {
    return riskyIO();
  } catch (e) {
    console.log(`   Caught error: ${(e as Error).message}`);
    return -1;
  }
};

console.log("   Running safe IO 3 times:");
for (let i = 0; i < 3; i++) {
  const result = runIO(safeIO);
  console.log(`   Attempt ${i + 1}: ${result}`);
}
console.log();

// 6. Testing with Mocks
console.log("6. Testing with Mock Effects:\n");

const testProgram: IO<void> = () => {
  console.log("This would log to real console");
  const random = Math.random();
  console.log(`Random: ${random}`);
};

console.log("   Running with real effects:");
runIO(testProgram);

console.log("   In tests, we would mock effects");
console.log("   The key is: effects are values, not executions");
console.log();

// 7. The Philosophy
console.log("7. The Philosophy of λBRIDGE:\n");

const philosophy: IO<void> = () => {
  const messages = [
    "   'To transform the world, we must touch it without becoming contaminated.'",
    "   ",
    "   λBRIDGE protects our purity by:",
    "   1. Describing effects as values (IO actions)",
    "   2. Composing effects without executing them",
    "   3. Executing only at the VOID boundary",
    "   4. Maintaining referential transparency",
    "   ",
    "   The impure world exists, but we control exactly",
    "   when and how we touch it.",
    "   ",
    "   Welcome to protected purity. 🛡️ → λ"
  ];
  
  messages.forEach(msg => console.log(msg));
};

runIO(philosophy);
console.log();

console.log("=== Demonstration Complete ===");
console.log();
console.log("Remember: In production, there would be exactly ONE runIO");
console.log("at the program entry point. Everything else remains pure.");

