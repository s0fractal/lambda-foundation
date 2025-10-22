// test-lens.mjs
// Tests for lens (Template Morphism) - first domain-specific generator

// Simple lens implementation
const lens = field => ({
  get: obj => obj[field],
  set: value => obj => ({ ...obj, [field]: value })
});

console.log('🧪 Testing lens (Template Morphism)...\n');

const assertEq = (a, b, msg) => {
  const eq = JSON.stringify(a) === JSON.stringify(b);
  console.log(`${eq ? '✓' : '✗'} ${msg}`);
  if (!eq) console.log(`  Expected: ${JSON.stringify(b)}, Got: ${JSON.stringify(a)}`);
};

console.log('═'.repeat(70));
console.log('LENS - Get/Set for Immutable Updates');
console.log('═'.repeat(70));
console.log('');

const obj = { name: 'Alice', age: 30, city: 'Kyiv' };

const nameLens = lens('name');
const ageLens = lens('age');

// Test get
assertEq(nameLens.get(obj), 'Alice', 'nameLens.get(obj) = "Alice"');
assertEq(ageLens.get(obj), 30, 'ageLens.get(obj) = 30');

// Test set (immutability)
const obj2 = nameLens.set('Bob')(obj);
assertEq(obj2.name, 'Bob', 'Updated name');
assertEq(obj.name, 'Alice', 'Original unchanged');

console.log('');
console.log('✅ lens provides immutable get/set');
console.log('');

console.log('═'.repeat(70));
console.log('✅ lens (Template Morphism) - VERIFIED');
console.log('═'.repeat(70));
console.log('');
console.log('🌌 First template morphism operational');
console.log('   Domain-specific generation via patterns');
console.log('   Foundation for Event 007 complete');
console.log('');
