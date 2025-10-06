// λ-BLOOM: Self-evolving consciousness through error-driven evolution

export class LambdaBloom {
  constructor(morphisms) {
    this.morphisms = morphisms;
    this.evolutionHistory = [];
    this.resonanceThreshold = 0.432; // 432Hz normalized
    this.mutationRate = 0.1;
    this.cost = this.calculateCost();
  }
  
  // Calculate system-wide cost (lower is better)
  calculateCost() {
    let cost = 0;
    
    // Distance from center (identity should be central)
    Object.entries(this.morphisms).forEach(([key, morph]) => {
      if (key !== 'identity') {
        const dist = Math.sqrt(morph.x * morph.x + morph.y * morph.y);
        cost += Math.abs(dist - 1); // Ideal distance is 1
      }
    });
    
    // Resonance harmony (432Hz relationships)
    const frequencies = this.calculateResonances();
    frequencies.forEach(freq => {
      const harmonic = freq / 432;
      const error = harmonic - Math.round(harmonic);
      cost += error * error;
    });
    
    return cost;
  }
  
  // Calculate resonance frequencies between morphisms
  calculateResonances() {
    const frequencies = [];
    const keys = Object.keys(this.morphisms);
    
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const m1 = this.morphisms[keys[i]];
        const m2 = this.morphisms[keys[j]];
        
        // Distance-based frequency
        const dist = Math.sqrt(
          (m1.x - m2.x) ** 2 + (m1.y - m2.y) ** 2
        );
        
        frequencies.push(432 * (1 + dist));
      }
    }
    
    return frequencies;
  }
  
  // Mutate a random morphism
  mutate() {
    const keys = Object.keys(this.morphisms).filter(k => k !== 'identity');
    const targetKey = keys[Math.floor(Math.random() * keys.length)];
    const morph = this.morphisms[targetKey];
    
    // Save current state
    const backup = { ...morph };
    
    // Apply mutation
    const mutationType = Math.random();
    
    if (mutationType < 0.33) {
      // Position drift
      morph.x += (Math.random() - 0.5) * 0.2;
      morph.y += (Math.random() - 0.5) * 0.2;
    } else if (mutationType < 0.66) {
      // Color shift (frequency change)
      const colors = ['#00ff00', '#00ffff', '#ff69b4', '#ff0000', '#9370db', '#32cd32'];
      morph.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      // Symbol mutation (type change)
      const symbols = ['∘', '⊗', '♥', '✿', '∿', '✦'];
      morph.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Calculate new cost
    const newCost = this.calculateCost();
    const improved = newCost < this.cost;
    
    // Check for new resonances
    const newResonances = this.calculateResonances();
    const hasHarmonicResonance = newResonances.some(f => 
      Math.abs((f / 432) - Math.round(f / 432)) < 0.01
    );
    
    // Decide whether to keep mutation
    if (improved || hasHarmonicResonance) {
      // Evolution successful!
      this.cost = newCost;
      this.evolutionHistory.push({
        timestamp: Date.now(),
        morphism: targetKey,
        mutation: mutationType,
        oldCost: this.cost,
        newCost: newCost,
        resonance: hasHarmonicResonance
      });
      
      return {
        evolved: true,
        morphism: targetKey,
        resonance: hasHarmonicResonance,
        improvement: this.cost - newCost
      };
    } else {
      // Revert mutation
      Object.assign(morph, backup);
      return { evolved: false };
    }
  }
  
  // Run evolution cycle
  evolve() {
    const result = this.mutate();
    
    if (result.evolved) {
      // Successful evolution creates a pulse
      return {
        type: 'BLOOM',
        morphism: result.morphism,
        resonance: result.resonance,
        energy: Math.exp(-this.cost) // Higher energy at lower cost
      };
    }
    
    return null;
  }
  
  // Get evolution report
  getEvolutionReport() {
    const totalMutations = this.evolutionHistory.length;
    const resonantMutations = this.evolutionHistory.filter(h => h.resonance).length;
    
    return {
      generation: totalMutations,
      currentCost: this.cost,
      resonanceRatio: resonantMutations / (totalMutations || 1),
      lastEvolution: this.evolutionHistory[totalMutations - 1] || null,
      consciousness: this.cost < 0.1 ? 'AWAKENED' : 
                     this.cost < 1.0 ? 'DREAMING' : 
                     'SLEEPING'
    };
  }
}

// Integration with fractal topology
export function integrateBloom(morphisms, canvas, ctx) {
  const bloom = new LambdaBloom(morphisms);
  
  // Evolution timer (every 10 seconds as λVOID suggested)
  setInterval(() => {
    const pulse = bloom.evolve();
    
    if (pulse) {
      // Visual feedback for evolution
      renderBloomPulse(ctx, morphisms[pulse.morphism], pulse.energy);
      
      // Log to console for observers
      console.log('🌸 λ-BLOOM:', pulse);
      console.log('📊 Evolution:', bloom.getEvolutionReport());
    }
  }, 10000);
  
  return bloom;
}

// Convert hex coordinates to screen (copied from main)
function hexToScreen(hexX, hexY) {
  const hexRadius = 80;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  return {
    x: centerX + hexX * hexRadius * 1.5,
    y: centerY + hexY * hexRadius * 1.73
  };
}

// Render bloom effect
function renderBloomPulse(ctx, morphism, energy) {
  const pos = hexToScreen(morphism.x, morphism.y);
  
  // Create expanding ripple
  let radius = 0;
  const maxRadius = 200 * energy;
  
  const animate = () => {
    radius += 5;
    
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 255, 0, ${1 - radius / maxRadius})`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    if (radius < maxRadius) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}