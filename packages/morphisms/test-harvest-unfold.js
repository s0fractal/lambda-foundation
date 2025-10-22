// test-harvest-unfold.js
// Imperative code with while-loop patterns that should be replaced with unfold

// Example 1: Range generation (for loop)
function generateRange(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

// Example 2: Countdown (while loop with decrement)
function countdown(n) {
  const result = [];
  while (n > 0) {
    result.push(n);
    n--;
  }
  return result;
}

// Example 3: Powers of 2 (while loop building from state)
function powersOf2(count) {
  const result = [];
  let state = { value: 1, count: 0 };
  while (state.count < count) {
    result.push(state.value);
    state = { value: state.value * 2, count: state.count + 1 };
  }
  return result;
}

// Example 4: Fibonacci (complex state machine)
function fibonacci(n) {
  const result = [];
  let state = { a: 0, b: 1, count: 0 };
  while (state.count < n) {
    result.push(state.a);
    state = { a: state.b, b: state.a + state.b, count: state.count + 1 };
  }
  return result;
}

// Example 5: String chunking (state-based while loop)
function chunkString(str, size) {
  const result = [];
  let remaining = str;
  while (remaining.length > 0) {
    result.push(remaining.slice(0, size));
    remaining = remaining.slice(size);
  }
  return result;
}

// Example 6: Binary digits (building backwards)
function toBinaryDigits(n) {
  const result = [];
  while (n > 0) {
    result.push(n % 2);
    n = Math.floor(n / 2);
  }
  return result.reverse();
}

// Example 7: Mixed - for loop with increment (range pattern)
function buildSequence(start, end, step) {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

console.log('Imperative implementations:');
console.log('Range:', generateRange(0, 5));
console.log('Countdown:', countdown(5));
console.log('Powers:', powersOf2(5));
console.log('Fibonacci:', fibonacci(10));
console.log('Chunks:', chunkString('hello world', 3));
console.log('Binary:', toBinaryDigits(42));
console.log('Sequence:', buildSequence(0, 10, 2));
