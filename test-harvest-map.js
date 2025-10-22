// test-harvest-map.js
// First λ_HARVEST test: Imperative → map transformation

// ❌ Imperative code (to be detected as residue)
function processNumbers(numbers) {
  const results = [];
  for (let i = 0; i < numbers.length; i++) {
    results.push(numbers[i] * 2);
  }
  return results;
}

// ❌ Imperative forEach (another pattern)
function processNumbersForEach(numbers) {
  const results = [];
  numbers.forEach(n => {
    results.push(n * 2);
  });
  return results;
}

// ✅ Functional equivalent (what λ_HARVEST should suggest)
function processNumbersFunctional(numbers) {
  return numbers.map(n => n * 2);
}

// Test
const input = [1, 2, 3, 4, 5];
console.log('Imperative (for loop):', processNumbers(input));
console.log('Imperative (forEach):', processNumbersForEach(input));
console.log('Functional (map):', processNumbersFunctional(input));
