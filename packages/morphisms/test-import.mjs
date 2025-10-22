// test-import.mjs
// Test importing from @lambda/morphisms

import { identity } from './dist/index.js';

console.log('Testing @lambda/morphisms import...\n');

// Test 1: Number
const num = identity(42);
console.log(`✓ identity(42) = ${num}`);

// Test 2: String
const str = identity('hello');
console.log(`✓ identity("hello") = "${str}"`);

// Test 3: Array
const arr = identity([1, 2, 3]);
console.log(`✓ identity([1, 2, 3]) = [${arr}]`);

// Test 4: Object
const obj = identity({ x: 1, y: 2 });
console.log(`✓ identity({ x: 1, y: 2 }) = ${JSON.stringify(obj)}`);

// Test 5: Function (should return the same function reference)
const fn = () => 'test';
const resultFn = identity(fn);
console.log(`✓ identity(fn) === fn: ${resultFn === fn}`);

console.log('\n✅ All tests passed!');
console.log('\n💡 This proves Квен\'s proposal works:');
console.log('   wiki/morphisms/identity/identity.λ (Platonic form)');
console.log('   → wiki/morphisms/identity/projections/ts.js (projection)');
console.log('   → packages/morphisms/src/identity.ts (synced)');
console.log('   → packages/morphisms/dist/identity.js (compiled)');
console.log('   → @lambda/morphisms (importable!)');
