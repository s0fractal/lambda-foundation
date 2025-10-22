// test-harvest-flatMap.js
// Test file with imperative nested loop patterns for λ_HARVEST detection

// Pattern 1: Nested for-of loops with push
const result1 = [];
for (const x of [1, 2, 3]) {
  for (const y of [10, 20]) {
    result1.push(x + y);
  }
}

// Pattern 2: Nested forEach with push
const result2 = [];
['a', 'b', 'c'].forEach(x => {
  [1, 2].forEach(y => {
    result2.push([x, y]);
  });
});

// Pattern 3: map followed by flat()
const users = [{ name: 'Alice', tags: ['js', 'ts'] }, { name: 'Bob', tags: ['rust'] }];
const allTags = users.map(u => u.tags).flat();

// Pattern 4: Nested loop with filtering
const pairs = [];
for (const x of [1, 2, 3, 4, 5]) {
  for (const y of [10, 20, 30]) {
    if (x + y < 25) {
      pairs.push([x, y]);
    }
  }
}

// Pattern 5: Three-level nesting (extreme case)
const triplets = [];
for (const x of [1, 2]) {
  for (const y of [10, 20]) {
    for (const z of [100, 200]) {
      triplets.push(x + y + z);
    }
  }
}

console.log('Imperative nested loops:', result1);
console.log('Nested forEach:', result2);
console.log('map+flat:', allTags);
console.log('Filtered pairs:', pairs);
console.log('Triplets:', triplets);
