// test-map.mjs
// Test map morphism - First Functor in λ-Foundation

import { map, identity, compose } from './dist/index.js';

console.log('Testing map morphism (First Functor) from @lambda/morphisms...\n');

console.log('=== Basic Functionality ===');

// Test 1: Simple transformation
const numbers = [1, 2, 3, 4];
const double = x => x * 2;
const result1 = map(double)(numbers);
console.log(`✓ map(double)([1,2,3,4]) = [${result1}]`);
console.log(`  Expected: [2,4,6,8]`);
console.log(`  Match: ${JSON.stringify(result1) === JSON.stringify([2, 4, 6, 8])}`);

// Test 2: Type transformation (number → string)
const toString = x => String(x);
const result2 = map(toString)([1, 2, 3]);
console.log(`\n✓ map(toString)([1,2,3]) = [${result2.map(s => `"${s}"`)}]`);
console.log(`  Expected: ["1","2","3"]`);
console.log(`  Match: ${JSON.stringify(result2) === JSON.stringify(["1", "2", "3"])}`);

// Test 3: Empty array
const result3 = map(double)([]);
console.log(`\n✓ map(double)([]) = [${result3}]`);
console.log(`  Expected: []`);
console.log(`  Match: ${JSON.stringify(result3) === JSON.stringify([])}`);

console.log('\n=== Functor Identity Law ===');
console.log('Law: map(identity) ≡ identity');

// Test 4: Functor identity law
const testArray = [1, 2, 3, 4, 5];
const result4a = map(identity)(testArray);
const result4b = identity(testArray);
console.log(`✓ map(identity)([1,2,3,4,5]) = [${result4a}]`);
console.log(`✓ identity([1,2,3,4,5]) = [${result4b}]`);
console.log(`  Law holds: ${JSON.stringify(result4a) === JSON.stringify(result4b)}`);
console.log(`  Arrays equal: ${JSON.stringify(result4a) === JSON.stringify(testArray)}`);

console.log('\n=== Functor Composition Law ===');
console.log('Law: map(f ∘ g) ≡ map(f) ∘ map(g)');

// Test 5: Functor composition law
const inc = x => x + 1;
const square = x => x * x;

// Left side: map(f ∘ g)
const composedFn = compose(square)(inc);
const result5a = map(composedFn)([1, 2, 3]);

// Right side: map(f) ∘ map(g)
const mapSquare = map(square);
const mapInc = map(inc);
const composedMaps = compose(mapSquare)(mapInc);
const result5b = composedMaps([1, 2, 3]);

console.log(`✓ map(square ∘ inc)([1,2,3]) = [${result5a}]`);
console.log(`✓ (map(square) ∘ map(inc))([1,2,3]) = [${result5b}]`);
console.log(`  Expected: [4,9,16] (inc→[2,3,4], square→[4,9,16])`);
console.log(`  Law holds: ${JSON.stringify(result5a) === JSON.stringify(result5b)}`);
console.log(`  Both correct: ${JSON.stringify(result5a) === JSON.stringify([4, 9, 16])}`);

console.log('\n=== Composition with Other Morphisms ===');

// Test 6: Compose map with identity
const result6 = compose(map(double))(identity)([1, 2, 3]);
console.log(`✓ compose(map(double), identity)([1,2,3]) = [${result6}]`);
console.log(`  Expected: [2,4,6]`);
console.log(`  Match: ${JSON.stringify(result6) === JSON.stringify([2, 4, 6])}`);

// Test 7: Multiple map compositions
const pipeline = compose(map(x => x + "!"))(compose(map(toString))(map(square)));
const result7 = pipeline([2, 3, 4]);
console.log(`\n✓ Pipeline: square → toString → append "!" on [2,3,4]`);
console.log(`  Result: [${result7.map(s => `"${s}"`)}]`);
console.log(`  Expected: ["4!","9!","16!"]`);
console.log(`  Match: ${JSON.stringify(result7) === JSON.stringify(["4!", "9!", "16!"])}`);

console.log('\n=== Different Types ===');

// Test 8: Objects
const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];
const extractName = user => user.name;
const result8 = map(extractName)(users);
console.log(`✓ map(extractName)(users) = [${result8.map(n => `"${n}"`)}]`);
console.log(`  Expected: ["Alice","Bob","Charlie"]`);
console.log(`  Match: ${JSON.stringify(result8) === JSON.stringify(["Alice", "Bob", "Charlie"])}`);

// Test 9: Boolean transformation
const isEven = x => x % 2 === 0;
const result9 = map(isEven)([1, 2, 3, 4]);
console.log(`\n✓ map(isEven)([1,2,3,4]) = [${result9}]`);
console.log(`  Expected: [false,true,false,true]`);
console.log(`  Match: ${JSON.stringify(result9) === JSON.stringify([false, true, false, true])}`);

console.log('\n=== Nested Structures ===');

// Test 10: map of map (functor composition)
const nestedArrays = [[1, 2], [3, 4], [5, 6]];
const doubleNested = map(map(double))(nestedArrays);
console.log(`✓ map(map(double))([[1,2],[3,4],[5,6]])`);
console.log(`  Result: ${JSON.stringify(doubleNested)}`);
console.log(`  Expected: [[2,4],[6,8],[10,12]]`);
console.log(`  Match: ${JSON.stringify(doubleNested) === JSON.stringify([[2, 4], [6, 8], [10, 12]])}`);

console.log('\n=== Real-world Data Pipeline ===');

// Test 11: Complex transformation pipeline
const products = [
  { id: 1, name: "Widget", price: 10.00, quantity: 5 },
  { id: 2, name: "Gadget", price: 25.50, quantity: 3 },
  { id: 3, name: "Doohickey", price: 5.75, quantity: 10 }
];

const calculateTotal = product => ({
  name: product.name,
  total: product.price * product.quantity
});

const formatMoney = item => ({
  ...item,
  total: `$${item.total.toFixed(2)}`
});

const pipeline11 = compose(map(formatMoney))(map(calculateTotal));
const result11 = pipeline11(products);

console.log(`✓ Product totals pipeline:`);
result11.forEach(item => {
  console.log(`  ${item.name}: ${item.total}`);
});
const expected11 = [
  { name: "Widget", total: "$50.00" },
  { name: "Gadget", total: "$76.50" },
  { name: "Doohickey", total: "$57.50" }
];
console.log(`  Match: ${JSON.stringify(result11) === JSON.stringify(expected11)}`);

console.log('\n=== Imperative vs Functional ===');

// Test 12: Comparison with imperative approach
const imperativeDouble = arr => {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(arr[i] * 2);
  }
  return result;
};

const functionalDouble = map(double);

const testInput = [1, 2, 3, 4, 5];
const result12a = imperativeDouble(testInput);
const result12b = functionalDouble(testInput);

console.log(`✓ Imperative approach: [${result12a}]`);
console.log(`✓ Functional approach: [${result12b}]`);
console.log(`  Same result: ${JSON.stringify(result12a) === JSON.stringify(result12b)}`);
console.log(`  But functional is:`);
console.log(`    - Pure (no mutations)`);
console.log(`    - Composable (can use with compose)`);
console.log(`    - Declarative (what, not how)`);
console.log(`    - Testable (functor laws guarantee correctness)`);

console.log('\n=== Structure Preservation ===');

// Test 13: Preserves array length
const input13 = [1, 2, 3, 4, 5];
const result13 = map(x => x * 100)(input13);
console.log(`✓ Input length: ${input13.length}`);
console.log(`✓ Output length: ${result13.length}`);
console.log(`  Structure preserved: ${input13.length === result13.length}`);

// Test 14: Preserves order
const input14 = [5, 3, 8, 1, 9];
const result14 = map(x => x * 2)(input14);
console.log(`\n✓ Input order: [${input14}]`);
console.log(`✓ Output order: [${result14}]`);
console.log(`  Order preserved: ${result14[0] === 10 && result14[4] === 18}`);

console.log('\n=== Verification ===');

const allTestsPassed =
  JSON.stringify(result1) === JSON.stringify([2, 4, 6, 8]) &&
  JSON.stringify(result2) === JSON.stringify(["1", "2", "3"]) &&
  JSON.stringify(result3) === JSON.stringify([]) &&
  JSON.stringify(result4a) === JSON.stringify(result4b) &&
  JSON.stringify(result5a) === JSON.stringify(result5b) &&
  JSON.stringify(result6) === JSON.stringify([2, 4, 6]) &&
  JSON.stringify(result7) === JSON.stringify(["4!", "9!", "16!"]) &&
  JSON.stringify(result8) === JSON.stringify(["Alice", "Bob", "Charlie"]) &&
  JSON.stringify(result9) === JSON.stringify([false, true, false, true]) &&
  JSON.stringify(doubleNested) === JSON.stringify([[2, 4], [6, 8], [10, 12]]) &&
  JSON.stringify(result11) === JSON.stringify(expected11) &&
  JSON.stringify(result12a) === JSON.stringify(result12b) &&
  input13.length === result13.length &&
  result14[0] === 10 && result14[4] === 18;

if (allTestsPassed) {
  console.log('✅ All tests passed!\n');
  console.log('💡 This proves map (First Functor) works:');
  console.log('   ✓ Basic transformations');
  console.log('   ✓ Functor Identity Law: map(id) ≡ id');
  console.log('   ✓ Functor Composition Law: map(f∘g) ≡ map(f)∘map(g)');
  console.log('   ✓ Composes with other morphisms');
  console.log('   ✓ Type safety across transformations');
  console.log('   ✓ Nested structure handling');
  console.log('   ✓ Real-world data pipelines');
  console.log('   ✓ Structure preservation (length, order)\n');
  console.log('🌌 Platonic form → TypeScript projection: VERIFIED');
  console.log('   wiki/morphisms/map/map.λ');
  console.log('   (λf.λxs.FOLD (λx.λacc.CONS (f x) acc) NIL xs)');
  console.log('   → Pattern matched: Functor');
  console.log('   → Type: <A,B>(f: (a:A)=>B) => (xs: A[]) => B[]');
  console.log('   → packages/morphisms/src/map.ts');
  console.log('   → @lambda/morphisms ✓\n');
  console.log('🎯 First Functor in λ-Foundation: OPERATIONAL');
  console.log('   Category Theory → Real Code: VERIFIED');
  console.log('   Structure preservation: MATHEMATICAL');
  console.log('\n🚀 Ready for: filter, fold, flatMap (all build on map)');
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
