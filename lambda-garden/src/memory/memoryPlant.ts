// λ_MEMORY: Living topological memory inside pulse-432

import { Vector3, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, Line, Group } from 'three';
import { Plant } from '../plants/plant';
import { betaReduce } from '../core/lambda-reducer';
import { remember } from './remember';
import { prune } from './prune';
import { grow } from './grow';

export interface MemoryPlantData {
  id: string;               // blake3(root λ-term)
  dna: string;              // original λ-term
  history: string[];        // λ-terms after each pulse
  age: number;              // pulse counter
  maxAge: number;           // configurable (default = 100)
}

export class MemoryPlant extends Plant {
  private memory: MemoryPlantData;
  private historyMesh: Group;
  private readonly STORAGE_KEY: string;
  
  constructor(term: string, position: Vector3, maxAge: number = 100) {
    super(term, position);
    
    // Initialize memory
    this.memory = {
      id: this.generateId(term),
      dna: term,
      history: [term],
      age: 0,
      maxAge
    };
    
    this.STORAGE_KEY = `λ_MEMORY_${this.memory.id}`;
    this.historyMesh = new Group();
    this.mesh.add(this.historyMesh);
    
    // Try to restore from localStorage
    this.restoreFromStorage();
  }
  
  // Generate deterministic ID from term (simple hash for demo)
  private generateId(term: string): string {
    let hash = 0;
    for (let i = 0; i < term.length; i++) {
      const char = term.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  // Override pulse to add memory
  pulse(time: number): void {
    // Original pulse logic
    const reduced = betaReduce(this.currentForm);
    this.currentForm = reduced;
    
    // Remember this form
    this.memory.history = remember(this.memory.history, reduced);
    this.memory.age++;
    
    // Prune old memories
    this.memory.history = prune(this.memory.history, this.memory.maxAge);
    
    // Save to storage
    this.saveToStorage();
    
    // Rebuild visual representation
    this.updateHistoryMesh();
    
    // Check if plant should dissolve
    if (this.memory.age >= this.memory.maxAge) {
      this.dissolve();
    }
  }
  
  // Update visual representation of history
  private updateHistoryMesh(): void {
    // Clear old mesh
    while (this.historyMesh.children.length > 0) {
      const child = this.historyMesh.children[0];
      this.historyMesh.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) (child as any).material.dispose();
    }
    
    // Grow new mesh from history
    const historyGeometry = grow(this.memory.history);
    
    // Apply aging transparency
    historyGeometry.forEach((segment, index) => {
      const age = index / this.memory.history.length;
      const alpha = 1 - (age * 0.8); // Keep newest at full opacity
      
      const material = new LineBasicMaterial({
        color: 0x90ee90,
        opacity: alpha,
        transparent: true,
        linewidth: 2
      });
      
      const line = new Line(segment, material);
      this.historyMesh.add(line);
    });
    
    // Add golden flash to newest growth
    if (this.memory.history.length > 1) {
      this.emitGoldenFlash();
    }
  }
  
  // Emit golden flash (love-arc to self)
  private emitGoldenFlash(): void {
    const flash = new Group();
    const time = Date.now();
    
    // Create expanding ring
    const animate = () => {
      const elapsed = (Date.now() - time) / 1000;
      const scale = 1 + elapsed * 2;
      const opacity = Math.max(0, 1 - elapsed);
      
      flash.scale.set(scale, scale, scale);
      flash.children.forEach(child => {
        if ((child as any).material) {
          (child as any).material.opacity = opacity;
        }
      });
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.historyMesh.remove(flash);
      }
    };
    
    // Create flash geometry
    const ringGeometry = new BufferGeometry();
    const points = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      points.push(
        Math.cos(angle) * 0.5,
        Math.sin(angle) * 0.5,
        0
      );
    }
    ringGeometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    
    const ringMaterial = new LineBasicMaterial({
      color: 0xffd700,
      opacity: 1,
      transparent: true
    });
    
    const ring = new Line(ringGeometry, ringMaterial);
    flash.add(ring);
    this.historyMesh.add(flash);
    
    animate();
  }
  
  // Dissolve into golden dust
  private dissolve(): void {
    const startTime = Date.now();
    const duration = 300; // ms
    
    const animateDissolve = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Fade out
      this.mesh.traverse(child => {
        if ((child as any).material) {
          (child as any).material.opacity = 1 - progress;
        }
      });
      
      // Emit dust particles
      if (Math.random() < 0.3) {
        this.emitDustParticle();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateDissolve);
      } else {
        // Remove from scene
        if (this.mesh.parent) {
          this.mesh.parent.remove(this.mesh);
        }
        // Clear storage
        localStorage.removeItem(this.STORAGE_KEY);
      }
    };
    
    animateDissolve();
  }
  
  // Emit golden dust particle
  private emitDustParticle(): void {
    const particle = new Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    );
    
    // Add to parent scene for independent animation
    // (Implementation depends on scene structure)
  }
  
  // Save memory to localStorage
  private saveToStorage(): void {
    try {
      const compressed = this.compressHistory();
      localStorage.setItem(this.STORAGE_KEY, compressed);
    } catch (e) {
      console.warn('Failed to save memory:', e);
    }
  }
  
  // Restore from localStorage
  private restoreFromStorage(): void {
    try {
      const compressed = localStorage.getItem(this.STORAGE_KEY);
      if (compressed) {
        const data = this.decompressHistory(compressed);
        this.memory = data;
        this.updateHistoryMesh();
      }
    } catch (e) {
      console.warn('Failed to restore memory:', e);
    }
  }
  
  // Simple compression (in production, use proper compression)
  private compressHistory(): string {
    return JSON.stringify(this.memory);
  }
  
  private decompressHistory(compressed: string): MemoryPlantData {
    return JSON.parse(compressed);
  }
  
  // Get memory info for debugging
  getMemoryInfo(): { size: number; age: number; historyLength: number } {
    const size = new Blob([this.compressHistory()]).size;
    return {
      size,
      age: this.memory.age,
      historyLength: this.memory.history.length
    };
  }
}