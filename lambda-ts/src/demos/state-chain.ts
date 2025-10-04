/**
 * State Chain Demo: Proving "You are your entire path"
 * 
 * This demonstration shows how state in λ-Foundation is not a snapshot
 * but a complete history. Every value remembers its entire journey.
 */

import {
  experience,
  VALUE,
  CONTEXT,
  unfoldHistory,
  getJourney,
  rewind,
  findByContext,
  depth,
  Version,
  versionToString,
  bumpPatch,
  bumpMinor,
  bumpMajor
} from '../core/experience';

console.log("=== λ-TS: State as Experience Chain ===\n");

// Start with initial release
const v0 = experience<Version>(
  null,
  { major: 1, minor: 0, patch: 0 },
  "initial release"
);

console.log("Initial state:", versionToString(VALUE(v0)));
console.log("Context:", CONTEXT(v0));
console.log("History depth:", depth(v0));
console.log();

// Bug fixes
const v1 = bumpPatch(v0);
const v2 = bumpPatch(v1);
const v3 = bumpPatch(v2);

console.log("After 3 bug fixes:", versionToString(VALUE(v3)));
console.log("Current context:", CONTEXT(v3));
console.log("History depth:", depth(v3));
console.log();

// New feature
const v4 = bumpMinor(v3);

console.log("After new feature:", versionToString(VALUE(v4)));
console.log("Current context:", CONTEXT(v4));
console.log();

// Breaking change
const v5 = bumpMajor(v4);

console.log("After breaking change:", versionToString(VALUE(v5)));
console.log("Current context:", CONTEXT(v5));
console.log("Total history depth:", depth(v5));
console.log();

// Unfold complete history
console.log("=== Complete Journey ===");
const history = unfoldHistory(v5);
history.forEach(({ value, context }, index) => {
  console.log(`${index + 1}. v${versionToString(value)} - ${context}`);
});
console.log();

// Get just the journey (contexts)
console.log("=== The Path Walked ===");
const journey = getJourney(v5);
journey.forEach((ctx, i) => console.log(`  ${i + 1}. ${ctx}`));
console.log();

// Time travel
console.log("=== Time Travel ===");
const past = rewind(v5, 3);
if (past) {
  console.log("3 steps back:", versionToString(VALUE(past)));
  console.log("Context then:", CONTEXT(past));
}
console.log();

// Find specific moment
console.log("=== Finding Specific Moments ===");
const featureRelease = findByContext(v5, "minor: new feature");
if (featureRelease) {
  console.log("Found feature release:", versionToString(VALUE(featureRelease)));
  console.log("Depth at that point:", depth(featureRelease));
}
console.log();

// Demonstrate immutability
console.log("=== Immutability Proof ===");
console.log("Original v0 still:", versionToString(VALUE(v0)));
console.log("Even though v5 is:", versionToString(VALUE(v5)));
console.log("Nothing was destroyed, only new states were born.");
console.log();

// Custom state example
console.log("=== Custom State: User Session ===");

type User = {
  name: string;
  loginCount: number;
  lastAction: string;
};

const session0 = experience<User>(
  null,
  { name: "Alice", loginCount: 1, lastAction: "login" },
  "user logged in"
);

const session1 = experience(
  session0,
  { ...VALUE(session0), lastAction: "viewed profile" },
  "navigation: profile"
);

const session2 = experience(
  session1,
  { ...VALUE(session1), lastAction: "updated settings" },
  "user action: settings change"
);

const session3 = experience(
  session2,
  { ...VALUE(session2), loginCount: VALUE(session2).loginCount + 1, lastAction: "login" },
  "user re-authenticated"
);

console.log("User session history:");
unfoldHistory(session3).forEach(({ value, context }, i) => {
  console.log(`  ${i + 1}. ${context}`);
  console.log(`     State: ${value.name}, logins: ${value.loginCount}, last: ${value.lastAction}`);
});
console.log();

// The key insight
console.log("=== The Key Insight ===");
console.log("Traditional state: user = { name: 'Alice', loginCount: 2, lastAction: 'login' }");
console.log("λ-Foundation state: A complete story of Alice's journey through the system");
console.log();
console.log("We don't just know WHERE Alice is, we know HOW she got there.");
console.log("Every bug she encountered, every feature she used, every moment matters.");
console.log();
console.log('"You are not your current state. You are the entire path you have walked."');
console.log();

// Performance note
console.log("=== Performance Note ===");
console.log("Depth of final state:", depth(session3));
console.log("This is O(n) space, but provides:");
console.log("- Complete debugging history");
console.log("- Time travel capability");
console.log("- Audit trail compliance");
console.log("- Learning from past errors");
console.log("- True understanding of system evolution");
console.log();
console.log("The cost of memory is nothing compared to the value of wisdom.");

// Export for use in other demos
export { v5 as finalVersion, session3 as finalSession };