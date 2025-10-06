// Pure function: reconstruct plant mesh from history

import { BufferGeometry, Float32BufferAttribute } from 'three';

export function grow(history: string[]): BufferGeometry[] {
  const geometries: BufferGeometry[] = [];
  
  // Convert each historical form to a visual segment
  history.forEach((form, index) => {
    const geometry = new BufferGeometry();
    const points: number[] = [];
    
    // Generate points based on λ-term structure
    const depth = countDepth(form);
    const complexity = countApplications(form);
    
    // Create a spiral that grows with history
    const baseAngle = (index / history.length) * Math.PI * 2;
    const height = index * 0.1;
    
    // Generate segment points
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const angle = baseAngle + t * Math.PI * 0.5;
      const radius = 0.5 + complexity * 0.1 + t * 0.2;
      
      points.push(
        Math.cos(angle) * radius,
        height + t * 0.2,
        Math.sin(angle) * radius
      );
    }
    
    // Add branch based on term structure
    if (form.includes('λ')) {
      const branchAngle = baseAngle + Math.PI * 0.25;
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const radius = 0.3 + t * 0.1;
        
        points.push(
          Math.cos(branchAngle) * radius,
          height + 0.1 + t * 0.1,
          Math.sin(branchAngle) * radius
        );
      }
    }
    
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    geometries.push(geometry);
  });
  
  return geometries;
}

// Helper: count depth of nested applications
function countDepth(term: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const char of term) {
    if (char === '(') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === ')') {
      currentDepth--;
    }
  }
  
  return maxDepth;
}

// Helper: count number of applications
function countApplications(term: string): number {
  let count = 0;
  let inLambda = false;
  
  for (let i = 0; i < term.length; i++) {
    if (term[i] === 'λ') {
      inLambda = true;
    } else if (term[i] === '.') {
      inLambda = false;
    } else if (term[i] === '(' && !inLambda) {
      count++;
    }
  }
  
  return count;
}