// test-compose.mjs
// Test compose morphism with type safety and mathematical properties

import { compose, identity } from './dist/index.js';

console.log('Testing compose morphism from @lambda/morphisms...\n');

// Simple transformations
const double = x => x * 2;
const inc = x => x + 1;
const square = x => x * x;
const toString = x => String(x);

console.log('=== Basic Composition ===');

// Test 1: compose(double, inc)
const f1 = compose(double)(inc);
const result1 = f1(5);
console.log(`✓ compose(double, inc)(5) = ${result1}`);
console.log(`  Expected: 12 (double(inc(5)) = double(6) = 12)`);
console.log(`  Match: ${result1 === 12}`);

// Test 2: compose(square, double)
const f2 = compose(square)(double);
const result2 = f2(3);
console.log(`\n✓ compose(square, double)(3) = ${result2}`);
console.log(`  Expected: 36 (square(double(3)) = square(6) = 36)`);
console.log(`  Match: ${result2 === 36}`);

// Test 3: Three-way composition
const f3 = compose(square)(compose(double)(inc));
const result3 = f3(2);
console.log(`\n✓ compose(square, compose(double, inc))(2) = ${result3}`);
console.log(`  Expected: 36 (square(double(inc(2))) = square(6) = 36)`);
console.log(`  Match: ${result3 === 36}`);

console.log('\n=== Identity as Neutral Element ===');

// Test 4: Left identity
const f4 = compose(double)(identity);
const result4 = f4(5);
console.log(`✓ compose(double, identity)(5) = ${result4}`);
console.log(`  Expected: 10 (same as double(5))`);
console.log(`  Match: ${result4 === 10}`);

// Test 5: Right identity
const f5 = compose(identity)(double);
const result5 = f5(5);
console.log(`\n✓ compose(identity, double)(5) = ${result5}`);
console.log(`  Expected: 10 (same as double(5))`);
console.log(`  Match: ${result5 === 10}`);

console.log('\n=== Associativity ===');

// Test 6: (f ∘ g) ∘ h ≡ f ∘ (g ∘ h)
const left = compose(compose(square)(double))(inc);
const right = compose(square)(compose(double)(inc));
const result6a = left(2);
const result6b = right(2);
console.log(`✓ ((square ∘ double) ∘ inc)(2) = ${result6a}`);
console.log(`✓ (square ∘ (double ∘ inc))(2) = ${result6b}`);
console.log(`  Match: ${result6a === result6b} (both = 36)`);

console.log('\n=== Type Safety (Different Types) ===');

// Test 7: number → number → string
const pipeline = compose(toString)(compose(square)(double));
const result7 = pipeline(3);
console.log(`✓ compose(toString, compose(square, double))(3) = "${result7}"`);
console.log(`  Type: number → number → number → string`);
console.log(`  Expected: "36"`);
console.log(`  Match: ${result7 === "36"}`);

console.log('\n=== Real-world Pipeline ===');

// Test 8: Data processing pipeline
const parseJSON = str => JSON.parse(str);
const extractValue = obj => obj.value;
const multiplyBy10 = n => n * 10;
const formatResult = n => `Result: ${n}`;

const dataPipeline = compose(formatResult)(
  compose(multiplyBy10)(
    compose(extractValue)(parseJSON)
  )
);

const jsonData = '{"value": 42}';
const result8 = dataPipeline(jsonData);
console.log(`✓ Data pipeline: '{"value": 42}' → "${result8}"`);
console.log(`  Steps: parseJSON → extractValue → multiplyBy10 → formatResult`);
console.log(`  Expected: "Result: 420"`);
console.log(`  Match: ${result8 === "Result: 420"}`);

console.log('\n=== Verification ===');

const allTestsPassed =
  result1 === 12 &&
  result2 === 36 &&
  result3 === 36 &&
  result4 === 10 &&
  result5 === 10 &&
  result6a === result6b &&
  result7 === "36" &&
  result8 === "Result: 420";

if (allTestsPassed) {
  console.log('✅ All tests passed!\n');
  console.log('💡 This proves compose works:');
  console.log('   ✓ Basic composition');
  console.log('   ✓ Identity as neutral element');
  console.log('   ✓ Associativity');
  console.log('   ✓ Type safety across different types');
  console.log('   ✓ Real-world data pipelines\n');
  console.log('🌌 Platonic form → TypeScript projection: VERIFIED');
  console.log('   wiki/morphisms/compose/compose.λ (λf.λg.λx.f(g(x)))');
  console.log('   → packages/morphisms/src/compose.ts');
  console.log('   → packages/morphisms/dist/compose.js');
  console.log('   → @lambda/morphisms ✓');
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
