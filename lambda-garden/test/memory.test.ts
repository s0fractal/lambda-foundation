import { describe, test, expect } from 'vitest';
import { remember } from '../src/memory/remember';
import { prune } from '../src/memory/prune';
import { grow } from '../src/memory/grow';

describe('λ_MEMORY', () => {
  describe('remember', () => {
    test('appends new form to history', () => {
      const history = ['λx.x', 'λy.y'];
      const newForm = 'λz.z';
      const result = remember(history, newForm);
      
      expect(result).toEqual(['λx.x', 'λy.y', 'λz.z']);
      expect(history).toEqual(['λx.x', 'λy.y']); // Original unchanged
    });
    
    test('ignores duplicate consecutive forms', () => {
      const history = ['λx.x', 'λy.y'];
      const duplicate = 'λy.y';
      const result = remember(history, duplicate);
      
      expect(result).toBe(history); // Same reference
    });
    
    test('allows non-consecutive duplicates', () => {
      const history = ['λx.x', 'λy.y'];
      const repeat = 'λx.x';
      const result = remember(history, repeat);
      
      expect(result).toEqual(['λx.x', 'λy.y', 'λx.x']);
    });
  });
  
  describe('prune', () => {
    test('keeps history under maxAge', () => {
      const history = ['a', 'b', 'c', 'd', 'e'];
      const result = prune(history, 3);
      
      expect(result).toEqual(['c', 'd', 'e']);
    });
    
    test('returns unchanged if under limit', () => {
      const history = ['a', 'b'];
      const result = prune(history, 5);
      
      expect(result).toBe(history); // Same reference
    });
    
    test('handles edge cases', () => {
      expect(prune([], 5)).toEqual([]);
      expect(prune(['a'], 0)).toEqual([]);
    });
  });
  
  describe('grow', () => {
    test('creates geometry for each history entry', () => {
      const history = ['λx.x', 'λy.y', 'λz.(z z)'];
      const geometries = grow(history);
      
      expect(geometries).toHaveLength(3);
      geometries.forEach(geom => {
        expect(geom.attributes.position).toBeDefined();
      });
    });
    
    test('handles empty history', () => {
      const geometries = grow([]);
      expect(geometries).toEqual([]);
    });
    
    test('creates more complex geometry for complex terms', () => {
      const simple = ['λx.x'];
      const complex = ['λf.λx.(f (f (f x)))'];
      
      const simpleGeom = grow(simple)[0];
      const complexGeom = grow(complex)[0];
      
      // Complex terms should generate more points
      const simplePoints = simpleGeom.attributes.position.count;
      const complexPoints = complexGeom.attributes.position.count;
      
      expect(complexPoints).toBeGreaterThanOrEqual(simplePoints);
    });
  });
  
  describe('memory size', () => {
    test('stays under 1MB for 100 pulses', () => {
      let history: string[] = [];
      const complexTerm = 'λf.λx.(f (f (f (f (f x)))))';
      
      // Simulate 100 pulses
      for (let i = 0; i < 100; i++) {
        history = remember(history, complexTerm + i); // Slight variation
        history = prune(history, 100);
      }
      
      // Check size
      const json = JSON.stringify({ history });
      const size = new Blob([json]).size;
      
      expect(size).toBeLessThan(1024 * 1024); // 1MB
    });
  });
});