// test-harvest-hylo.js
// Imperative code with build-then-fold patterns that should be replaced with hylo

// Example 1: Build range then sum (classic hylo pattern)
function sumRange(n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  return arr.reduce((acc, x) => acc + x, 0);
}

// Example 2: Build countdown then multiply (factorial-like)
function productCountdown(n) {
  const arr = [];
  let i = n;
  while (i > 0) {
    arr.push(i);
    i--;
  }
  return arr.reduce((acc, x) => acc * x, 1);
}

// Example 3: Build with transformation then fold
function sumOfSquares(n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i * i);
  }
  return arr.reduce((acc, x) => acc + x, 0);
}

// Example 4: Build fibonacci then sum
function fibonacciSum(n) {
  const arr = [];
  let a = 0, b = 1, count = 0;
  while (count < n) {
    arr.push(a);
    const next = b;
    b = a + b;
    a = next;
    count++;
  }
  return arr.reduce((acc, x) => acc + x, 0);
}

// Example 5: Build filtered range then sum
function sumEvens(n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    if (i % 2 === 0) {
      arr.push(i);
    }
  }
  return arr.reduce((acc, x) => acc + x, 0);
}

// Example 6: Build string chars then count
function countChars(str) {
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    arr.push(str[i]);
  }
  return arr.reduce((acc, _) => acc + 1, 0);
}

// Example 7: Build powers then multiply
function powerProduct(base, count) {
  const arr = [];
  let value = base;
  for (let i = 0; i < count; i++) {
    arr.push(value);
    value *= base;
  }
  return arr.reduce((acc, x) => acc * x, 1);
}

console.log('Imperative implementations (build then fold):');
console.log('sumRange(10):', sumRange(10));
console.log('productCountdown(5):', productCountdown(5));
console.log('sumOfSquares(5):', sumOfSquares(5));
console.log('fibonacciSum(10):', fibonacciSum(10));
console.log('sumEvens(10):', sumEvens(10));
console.log('countChars("hello"):', countChars('hello'));
console.log('powerProduct(2, 4):', powerProduct(2, 4));
