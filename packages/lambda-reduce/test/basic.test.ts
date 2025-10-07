import { describe, test, expect } from 'vitest';
import { reduce } from '../src/index.js';
import { prettyPrint } from '../src/ast.js';

describe('λREDUCE Basic Tests', () => {
  test('transforms simple function', () => {
    const code = 'x => x';
    const result = reduce(code, { includePrelude: false });
    expect(result.pretty).toBe('λx.x');
  });
  
  test('transforms arrow function with addition', () => {
    const code = 'x => x + 1';
    const result = reduce(code, { includePrelude: false });
    expect(result.pretty).toContain('λx.');
    expect(result.pretty).toContain('add');
  });
  
  test('transforms if statement', () => {
    const code = 'if (x < 5) { y } else { z }';
    const result = reduce(code, { includePrelude: false });
    expect(result.pretty).toContain('lt');
    expect(result.pretty).toContain('y');
    expect(result.pretty).toContain('z');
  });
  
  test('transforms for loop to Y combinator', () => {
    const code = `
      for (let i = 0; i < 10; i++) {
        console.log(i);
      }
    `;
    const result = reduce(code);
    expect(result.pretty).toContain('Y');
  });
  
  test('transforms function declaration', () => {
    const code = `
      function double(x) {
        return x * 2;
      }
    `;
    const result = reduce(code, { includePrelude: false });
    expect(result.pretty).toContain('let double = λx.');
    expect(result.pretty).toContain('mul');
  });
});