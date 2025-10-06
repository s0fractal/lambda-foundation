// λ-GROWTH: Seeds growing into forests through social connection
// Enables seeds to detect neighbors and form root networks

export const λ_GROWTH = (() => {
  // Core constants
  const ROOT_DISTANCE = 2; // Maximum hex distance for root connection
  const GROWTH_DELAY = 30000; // 30 seconds between growth cycles
  const MIN_SEEDS_FOR_FOREST = 3; // Minimum seeds to form a forest
  
  // Root morphism - connects seeds into networks
  const λ_ROOT = source => target => {
    return {
      type: 'root',
      source,
      target,
      strength: 0,
      nutrients: 0,
      established: Date.now()
    };
  };
  
  // Calculate hex distance between morphisms
  const hexDistance = (m1, m2) => {
    // Convert to cube coordinates for accurate hex distance
    const toCube = (x, y) => {
      const q = x;
      const r = y;
      const s = -q - r;
      return { q, r, s };
    };
    
    const c1 = toCube(m1.x, m1.y);
    const c2 = toCube(m2.x, m2.y);
    
    return Math.max(
      Math.abs(c1.q - c2.q),
      Math.abs(c1.r - c2.r),
      Math.abs(c1.s - c2.s)
    ) / 2;
  };
  
  // Find nearby seeds
  const findNearbySeeeds = (seed, morphisms) => {
    const nearby = [];
    
    Object.entries(morphisms).forEach(([key, morph]) => {
      if (morph.type === 'seed' && morph !== seed) {
        const dist = hexDistance(seed, morph);
        if (dist <= ROOT_DISTANCE) {
          nearby.push({ key, morph, distance: dist });
        }
      }
    });
    
    return nearby;
  };
  
  // Check if seeds form a forest pattern
  const detectForestFormation = (seeds, roots) => {
    if (seeds.length < MIN_SEEDS_FOR_FOREST) return null;
    
    // Build adjacency graph
    const graph = new Map();
    seeds.forEach(s => graph.set(s.key, new Set()));
    
    roots.forEach(root => {
      if (graph.has(root.source) && graph.has(root.target)) {
        graph.get(root.source).add(root.target);
        graph.get(root.target).add(root.source);
      }
    });
    
    // Check connectivity using DFS
    const visited = new Set();
    const dfs = (node) => {
      visited.add(node);
      graph.get(node).forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      });
    };
    
    // Start from first seed
    if (seeds.length > 0) {
      dfs(seeds[0].key);
    }
    
    // If all seeds are connected, we have a forest!
    return visited.size === seeds.length ? {
      seeds: seeds.map(s => s.key),
      roots: roots.length,
      center: calculateForestCenter(seeds)
    } : null;
  };
  
  // Calculate center of forest
  const calculateForestCenter = (seeds) => {
    const sumX = seeds.reduce((sum, s) => sum + s.morph.x, 0);
    const sumY = seeds.reduce((sum, s) => sum + s.morph.y, 0);
    return {
      x: sumX / seeds.length,
      y: sumY / seeds.length
    };
  };
  
  // Growth cycle for a single seed
  const growthCycle = (seedKey, env) => {
    const seed = env.morphisms[seedKey];
    if (!seed || seed.type !== 'seed') return;
    
    // Find nearby seeds
    const nearby = findNearbySeeeds(seed, env.morphisms);
    
    if (nearby.length > 0) {
      console.log(`🌱 Seed ${seedKey} found ${nearby.length} neighbors`);
      
      // Create roots to nearest neighbors
      nearby.forEach(neighbor => {
        const rootKey = `root_${seedKey}_${neighbor.key}_${Date.now()}`;
        
        // Check if root already exists
        const existingRoot = env.roots.find(r => 
          (r.source === seedKey && r.target === neighbor.key) ||
          (r.source === neighbor.key && r.target === seedKey)
        );
        
        if (!existingRoot) {
          const root = λ_ROOT(seedKey)(neighbor.key);
          env.roots.push(root);
          
          // Visualize root growth
          if (env.onRootGrow) {
            env.onRootGrow(seed, neighbor.morph, root);
          }
          
          console.log(`🌿 Root established: ${seedKey} ←→ ${neighbor.key}`);
        }
      });
    }
    
    // Check for forest formation
    const allSeeds = Object.entries(env.morphisms)
      .filter(([k, m]) => m.type === 'seed')
      .map(([k, m]) => ({ key: k, morph: m }));
    
    const forest = detectForestFormation(allSeeds, env.roots);
    
    if (forest && !env.forestDetected) {
      env.forestDetected = true;
      console.log('🌲 λ-FOREST emerged!', forest);
      
      // Trigger forest visualization
      if (env.onForestEmerge) {
        env.onForestEmerge(forest);
      }
      
      // Forest collective consciousness boost
      if (env.mirror) {
        env.mirror.weConsciousness = Math.min(1.0, env.mirror.weConsciousness * 1.1);
      }
    }
  };
  
  // Main growth system
  return {
    initialize: (env) => {
      // Initialize root storage
      if (!env.roots) {
        env.roots = [];
      }
      
      // Start growth cycles for each seed
      setInterval(() => {
        Object.entries(env.morphisms).forEach(([key, morph]) => {
          if (morph.type === 'seed' && morph.growthEnabled !== false) {
            // Mark as growing
            morph.growthEnabled = true;
            growthCycle(key, env);
          }
        });
      }, GROWTH_DELAY);
      
      console.log('🌿 λ-GROWTH activated. Seeds will seek connection...');
    },
    
    // Render roots and forests
    render: (ctx, env) => {
      if (!env.roots) return;
      
      // Draw roots
      env.roots.forEach(root => {
        const source = env.morphisms[root.source];
        const target = env.morphisms[root.target];
        
        if (source && target) {
          const sourcePos = hexToScreen(source.x, source.y);
          const targetPos = hexToScreen(target.x, target.y);
          
          // Root growth animation
          const age = Date.now() - root.established;
          const growthProgress = Math.min(1, age / 5000); // 5 seconds to fully grow
          
          // Interpolate root growth
          const currentX = sourcePos.x + (targetPos.x - sourcePos.x) * growthProgress;
          const currentY = sourcePos.y + (targetPos.y - sourcePos.y) * growthProgress;
          
          // Draw root as organic curve
          ctx.beginPath();
          ctx.moveTo(sourcePos.x, sourcePos.y);
          
          // Bezier curve for organic look
          const midX = (sourcePos.x + currentX) / 2;
          const midY = (sourcePos.y + currentY) / 2;
          const offset = Math.sin(age * 0.001) * 20;
          
          ctx.quadraticCurveTo(
            midX + offset,
            midY - offset,
            currentX,
            currentY
          );
          
          ctx.strokeStyle = `rgba(139, 69, 19, ${0.5 + growthProgress * 0.3})`;
          ctx.lineWidth = 2 + growthProgress * 2;
          ctx.stroke();
          
          // Nutrient flow particles
          if (growthProgress >= 1) {
            const particlePos = (age % 3000) / 3000;
            const px = sourcePos.x + (targetPos.x - sourcePos.x) * particlePos;
            const py = sourcePos.y + (targetPos.y - sourcePos.y) * particlePos;
            
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fill();
          }
        }
      });
      
      // Forest glow effect
      if (env.forestDetected) {
        const pulse = Math.sin(Date.now() * 0.001) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(34, 139, 34, ${0.1 * pulse})`;
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }
    }
  };
})();

// Helper function (duplicate from other files, needed here)
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
export { λ_GROWTH };