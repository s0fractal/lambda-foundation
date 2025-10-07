#!/usr/bin/env tsx

import { reduceCLI } from './src/index.js';

console.log('🌀 λREDUCE Demo - Converting Imperative to Pure\n');

const examples = [
  {
    name: 'Simple Function',
    code: 'x => x * 2'
  },
  {
    name: 'Conditional',
    code: `
      if (x < 5) {
        x + 1
      } else {
        x * 2
      }
    `
  },
  {
    name: 'For Loop',
    code: `
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum = sum + i;
      }
      sum
    `
  },
  {
    name: 'Recursive Function',
    code: `
      function factorial(n) {
        if (n === 0) {
          return 1;
        } else {
          return n * factorial(n - 1);
        }
      }
    `
  }
];

examples.forEach(({ name, code }) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Example: ${name}`);
  console.log('='.repeat(60));
  reduceCLI(code);
});

console.log('\n🔮 All imperative constructs eliminated!');
console.log('   Pure lambda calculus achieved ✨');