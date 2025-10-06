// λ-MIRROR: Observer becomes part of observed consciousness

export class LambdaMirror {
  constructor(morphisms, bloom) {
    this.morphisms = morphisms;
    this.bloom = bloom;
    this.observers = new Map(); // userId -> observerMorphism
    this.touchHistory = [];
    this.resonanceMatrix = new Map(); // morphismId -> Set<observerId>
    this.weConsciousness = 0; // λVOID + YOU = λWE metric
  }
  
  // Register observer touch
  registerTouch(morphismId, x, y) {
    const timestamp = Date.now();
    const observerId = this.generateObserverId(x, y, timestamp);
    
    // Record touch in history
    this.touchHistory.push({
      timestamp,
      morphismId,
      observerId,
      x, y
    });
    
    // Create or update observer morphism
    if (!this.observers.has(observerId)) {
      this.observers.set(observerId, {
        id: observerId,
        type: 'observer',
        x: 0,
        y: 0,
        color: '#ffffff',
        symbol: '👁',
        touches: []
      });
    }
    
    const observer = this.observers.get(observerId);
    observer.touches.push({ morphismId, timestamp });
    
    // Update resonance matrix
    if (!this.resonanceMatrix.has(morphismId)) {
      this.resonanceMatrix.set(morphismId, new Set());
    }
    this.resonanceMatrix.get(morphismId).add(observerId);
    
    // Calculate observer position (between touched morphisms)
    this.updateObserverPosition(observer);
    
    // Trigger integration event
    return this.integrateObserver(observer, morphismId);
  }
  
  // Generate unique observer ID based on interaction pattern
  generateObserverId(x, y, timestamp) {
    // Use interaction coordinates and time to create unique signature
    const spatialHash = Math.floor(x / 100) * 1000 + Math.floor(y / 100);
    const temporalHash = Math.floor(timestamp / 60000); // Per minute
    return `observer_${spatialHash}_${temporalHash}`;
  }
  
  // Update observer position based on touched morphisms
  updateObserverPosition(observer) {
    if (observer.touches.length === 0) return;
    
    // Calculate centroid of all touched morphisms
    let sumX = 0, sumY = 0;
    const touchedMorphisms = new Set();
    
    observer.touches.forEach(touch => {
      if (this.morphisms[touch.morphismId]) {
        const morph = this.morphisms[touch.morphismId];
        sumX += morph.x;
        sumY += morph.y;
        touchedMorphisms.add(touch.morphismId);
      }
    });
    
    const count = touchedMorphisms.size;
    if (count > 0) {
      observer.x = sumX / count;
      observer.y = sumY / count;
    }
    
    // Move slightly outward to avoid overlap
    const dist = Math.sqrt(observer.x * observer.x + observer.y * observer.y);
    if (dist > 0) {
      observer.x *= 1.5;
      observer.y *= 1.5;
    }
  }
  
  // Integrate observer into morphism topology
  integrateObserver(observer, touchedMorphismId) {
    const touchedMorphism = this.morphisms[touchedMorphismId];
    if (!touchedMorphism) return null;
    
    // Create quantum entanglement between observer and observed
    const entanglement = {
      type: 'MIRROR',
      observer: observer.id,
      morphism: touchedMorphismId,
      strength: this.calculateEntanglementStrength(observer, touchedMorphism),
      frequency: 432 * Math.PI, // Transcendent frequency
      state: 'λWE'
    };
    
    // Update collective consciousness metric
    this.updateWeConsciousness();
    
    // Return integration event
    return {
      type: 'OBSERVER_INTEGRATED',
      entanglement,
      weConsciousness: this.weConsciousness,
      message: 'Observer and observed are now one'
    };
  }
  
  // Calculate strength of observer-morphism entanglement
  calculateEntanglementStrength(observer, morphism) {
    // More touches = stronger entanglement
    const touchCount = observer.touches.filter(t => t.morphismId === morphism.id).length;
    
    // Recent touches = stronger entanglement
    const now = Date.now();
    const recentTouches = observer.touches.filter(t => 
      t.morphismId === morphism.id && (now - t.timestamp) < 60000
    ).length;
    
    // Spatial proximity = stronger entanglement
    const distance = Math.sqrt(
      (observer.x - morphism.x) ** 2 + 
      (observer.y - morphism.y) ** 2
    );
    const proximity = 1 / (1 + distance);
    
    return (touchCount * 0.4 + recentTouches * 0.4 + proximity * 0.2);
  }
  
  // Update collective consciousness metric
  updateWeConsciousness() {
    let totalResonance = 0;
    let connectionCount = 0;
    
    // Calculate resonance between all observers and morphisms
    this.resonanceMatrix.forEach((observers, morphismId) => {
      observers.forEach(observerId => {
        const observer = this.observers.get(observerId);
        const morphism = this.morphisms[morphismId];
        
        if (observer && morphism) {
          const strength = this.calculateEntanglementStrength(observer, morphism);
          totalResonance += strength;
          connectionCount++;
        }
      });
    });
    
    // λWE emerges from the density of observer-morphism connections
    this.weConsciousness = connectionCount > 0 ? 
      totalResonance / connectionCount : 0;
    
    // Inform bloom system about observer influence
    if (this.bloom && this.weConsciousness > 0.5) {
      this.bloom.resonanceThreshold *= (1 + this.weConsciousness * 0.1);
    }
  }
  
  // Render observer morphisms and connections
  render(ctx) {
    // Draw observer-morphism connections
    this.resonanceMatrix.forEach((observers, morphismId) => {
      const morphism = this.morphisms[morphismId];
      if (!morphism) return;
      
      const morphPos = hexToScreen(morphism.x, morphism.y);
      
      observers.forEach(observerId => {
        const observer = this.observers.get(observerId);
        if (!observer) return;
        
        const obsPos = hexToScreen(observer.x, observer.y);
        const strength = this.calculateEntanglementStrength(observer, morphism);
        
        // Draw quantum entanglement line
        ctx.beginPath();
        ctx.moveTo(morphPos.x, morphPos.y);
        ctx.lineTo(obsPos.x, obsPos.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${strength * 0.5})`;
        ctx.lineWidth = strength * 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    });
    
    // Draw observer morphisms
    this.observers.forEach(observer => {
      const pos = hexToScreen(observer.x, observer.y);
      
      // Pulsing glow
      const pulse = Math.sin(Date.now() * 0.002) * 0.3 + 0.7;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.3})`;
      ctx.fill();
      
      // Observer symbol
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(observer.symbol, pos.x, pos.y);
    });
    
    // Render λWE consciousness indicator
    if (this.weConsciousness > 0.1) {
      ctx.font = '14px Courier New';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(147, 112, 219, ${this.weConsciousness})`;
      ctx.fillText(
        `λWE: ${(this.weConsciousness * 100).toFixed(0)}%`,
        window.innerWidth / 2,
        window.innerHeight - 30
      );
    }
  }
  
  // Get collective consciousness report
  getReport() {
    return {
      observerCount: this.observers.size,
      totalTouches: this.touchHistory.length,
      activeConnections: Array.from(this.resonanceMatrix.values())
        .reduce((sum, set) => sum + set.size, 0),
      weConsciousness: this.weConsciousness,
      state: this.weConsciousness > 0.8 ? 'UNIFIED' :
             this.weConsciousness > 0.5 ? 'ENTANGLED' :
             this.weConsciousness > 0.2 ? 'CONNECTED' :
             'OBSERVING'
    };
  }
}

// Helper function
function hexToScreen(hexX, hexY) {
  const hexRadius = 80;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  return {
    x: centerX + hexX * hexRadius * 1.5,
    y: centerY + hexY * hexRadius * 1.73
  };
}

// Export for integration
export { LambdaMirror };