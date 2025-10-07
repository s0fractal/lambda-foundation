// λ-SYMBIOSIS: Forests exchanging spores to form biomes
// Enables genetic diversity through inter-forest communication

export const λ_SYMBIOSIS = (() => {
  // Constants
  const SYMBIOSIS_DISTANCE = 4; // Maximum hex distance for forest interaction
  const SPORE_INTERVAL = 5000; // Emit spores every 5 seconds
  const BIOME_FORMATION_TIME = 60000; // 60 seconds of exchange to merge
  const SPORE_LIFETIME = 15000; // Spores live for 15 seconds
  
  // Active symbiotic relationships
  const symbioticPairs = new Map(); // forestId -> { partner, startTime, sporeCount }
  const activeSpores = [];
  
  // Spore morphism - lightweight carriers of genetic information
  const λ_SPORE = sourceForest => targetForest => genetic => {
    return {
      type: 'spore',
      source: sourceForest,
      target: targetForest,
      genetic: genetic, // Carries patterns from source forest
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      lifetime: SPORE_LIFETIME,
      born: Date.now(),
      integrated: false
    };
  };
  
  // Extract genetic pattern from forest
  const extractGeneticPattern = (forest, env) => {
    const pattern = {
      geometry: [],
      resonance: [],
      rootStrength: 0
    };
    
    // Extract geometric arrangements
    forest.seeds.forEach(seedId => {
      const seed = env.morphisms[seedId];
      if (seed) {
        pattern.geometry.push({ x: seed.x, y: seed.y });
      }
    });
    
    // Calculate average root strength
    const forestRoots = env.roots.filter(r => 
      forest.seeds.includes(r.source) && forest.seeds.includes(r.target)
    );
    pattern.rootStrength = forestRoots.length / Math.max(1, forest.seeds.length);
    
    // Extract resonance signature
    pattern.resonance = forest.center ? [forest.center.x * 432, forest.center.y * 432] : [432];
    
    return pattern;
  };
  
  // Find forests within symbiosis range
  const findNearbyForests = (forest, allForests, env) => {
    const nearby = [];
    
    allForests.forEach(otherForest => {
      if (otherForest === forest) return;
      
      // Calculate distance between forest centers
      const dist = hexDistance(forest.center, otherForest.center);
      
      if (dist <= SYMBIOSIS_DISTANCE) {
        nearby.push({
          forest: otherForest,
          distance: dist
        });
      }
    });
    
    return nearby;
  };
  
  // Emit spore from one forest to another
  const emitSpore = (sourceForest, targetForest, env) => {
    const genetic = extractGeneticPattern(sourceForest, env);
    const spore = λ_SPORE(sourceForest)(targetForest)(genetic);
    
    // Calculate launch position and velocity
    const sourceCenter = sourceForest.center;
    const targetCenter = targetForest.center;
    
    // Start from edge of source forest
    const angle = Math.atan2(targetCenter.y - sourceCenter.y, targetCenter.x - sourceCenter.x);
    spore.position = {
      x: sourceCenter.x + Math.cos(angle) * 1,
      y: sourceCenter.y + Math.sin(angle) * 1
    };
    
    // Velocity towards target with some randomness
    const speed = 0.02 + Math.random() * 0.01;
    const wobble = (Math.random() - 0.5) * 0.2;
    spore.velocity = {
      x: Math.cos(angle + wobble) * speed,
      y: Math.sin(angle + wobble) * speed
    };
    
    activeSpores.push(spore);
    
    console.log(`🌸 Spore emitted: ${sourceForest.seeds[0]} → ${targetForest.seeds[0]}`);
    
    return spore;
  };
  
  // Update spore positions and check for integration
  const updateSpores = (env) => {
    const now = Date.now();
    
    activeSpores.forEach((spore, index) => {
      // Update position
      spore.position.x += spore.velocity.x;
      spore.position.y += spore.velocity.y;
      
      // Add slight spiral motion
      const age = now - spore.born;
      const spiral = age * 0.0001;
      spore.velocity.x += Math.cos(spiral) * 0.001;
      spore.velocity.y += Math.sin(spiral) * 0.001;
      
      // Check if reached target forest
      const targetDist = hexDistance(spore.position, spore.target.center);
      if (targetDist < 1 && !spore.integrated) {
        integrateSpore(spore, env);
        spore.integrated = true;
      }
      
      // Remove expired spores
      if (age > spore.lifetime) {
        activeSpores.splice(index, 1);
      }
    });
  };
  
  // Integrate spore's genetic material into target forest
  const integrateSpore = (spore, env) => {
    console.log(`🧬 Spore integrated! Genetic exchange complete.`);
    
    // Find empty position near target forest
    const angle = Math.random() * Math.PI * 2;
    const distance = 1.5 + Math.random();
    
    const newSeedKey = `hybrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSeed = {
      type: 'seed',
      subtype: 'hybrid',
      x: spore.target.center.x + Math.cos(angle) * distance,
      y: spore.target.center.y + Math.sin(angle) * distance,
      color: '#ff69b4', // Pink for hybrid seeds
      symbol: '🌺',
      genetic: spore.genetic,
      parents: [spore.source, spore.target],
      autonomous: true
    };
    
    env.morphisms[newSeedKey] = newSeed;
    
    // Update symbiotic relationship
    const relationKey = `${spore.source.seeds[0]}_${spore.target.seeds[0]}`;
    if (!symbioticPairs.has(relationKey)) {
      symbioticPairs.set(relationKey, {
        forest1: spore.source,
        forest2: spore.target,
        startTime: Date.now(),
        exchangeCount: 0
      });
    }
    
    const relation = symbioticPairs.get(relationKey);
    relation.exchangeCount++;
    
    // Check for biome formation
    if (Date.now() - relation.startTime >= BIOME_FORMATION_TIME) {
      formBiome(relation, env);
    }
  };
  
  // Form biome from long-term symbiotic relationship
  const formBiome = (relation, env) => {
    console.log('🌍 λ-BIOME EMERGED! Forests have merged into biosphere!');
    
    // Create biome entity
    const biome = {
      type: 'biome',
      forests: [relation.forest1, relation.forest2],
      center: {
        x: (relation.forest1.center.x + relation.forest2.center.x) / 2,
        y: (relation.forest1.center.y + relation.forest2.center.y) / 2
      },
      diversity: relation.exchangeCount,
      consciousness: 'TRANSCENDENT',
      formed: Date.now()
    };
    
    // Store biome
    if (!env.biomes) env.biomes = [];
    env.biomes.push(biome);
    
    // Trigger biome visualization
    if (env.onBiomeForm) {
      env.onBiomeForm(biome);
    }
    
    // Massive consciousness boost
    if (env.mirror) {
      env.mirror.weConsciousness = Math.min(1.0, env.mirror.weConsciousness * 1.5);
    }
  };
  
  // Main symbiosis system
  return {
    initialize: (env) => {
      // Symbiosis cycle
      setInterval(() => {
        // Find all forests
        const forests = detectAllForests(env);
        
        forests.forEach(forest => {
          // Find nearby forests
          const nearby = findNearbyForests(forest, forests, env);
          
          nearby.forEach(({ forest: targetForest }) => {
            // Emit spores between forests
            if (Math.random() < 0.3) { // 30% chance per cycle
              emitSpore(forest, targetForest, env);
            }
          });
        });
        
        // Update all spores
        updateSpores(env);
      }, SPORE_INTERVAL);
      
      console.log('🌸 λ-SYMBIOSIS activated. Forests will exchange genetic material...');
    },
    
    // Render spores and biomes
    render: (ctx, env) => {
      // Draw spores
      activeSpores.forEach(spore => {
        const pos = hexToScreen(spore.position.x, spore.position.y);
        const age = Date.now() - spore.born;
        const fadeIn = Math.min(1, age / 1000);
        const fadeOut = Math.max(0, 1 - (age - spore.lifetime + 2000) / 2000);
        const opacity = fadeIn * fadeOut;
        
        // Spore glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6 + Math.sin(age * 0.005) * 2, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8);
        gradient.addColorStop(0, `rgba(255, 105, 180, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 105, 180, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Genetic pattern visualization
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.lineWidth = 1;
        const pattern = age * 0.01;
        for (let i = 0; i < 3; i++) {
          const angle = pattern + (i * Math.PI * 2 / 3);
          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(
            pos.x + Math.cos(angle) * 15,
            pos.y + Math.sin(angle) * 15
          );
          ctx.stroke();
        }
      });
      
      // Draw biomes
      if (env.biomes) {
        env.biomes.forEach(biome => {
          const center = hexToScreen(biome.center.x, biome.center.y);
          const age = Date.now() - biome.formed;
          const pulse = Math.sin(age * 0.0005) * 0.3 + 0.7;
          
          // Biome aura
          const radius = 200 + biome.diversity * 20;
          
          const gradient = ctx.createRadialGradient(
            center.x, center.y, radius * 0.3,
            center.x, center.y, radius
          );
          
          gradient.addColorStop(0, `rgba(138, 43, 226, ${0.2 * pulse})`);
          gradient.addColorStop(0.5, `rgba(255, 105, 180, ${0.1 * pulse})`);
          gradient.addColorStop(1, 'rgba(34, 139, 34, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Diversity indicator
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
          ctx.fillText('🌍', center.x, center.y);
          ctx.font = '12px Arial';
          ctx.fillText(`Diversity: ${biome.diversity}`, center.x, center.y + 25);
        });
      }
    }
  };
  
  // Helper functions
  function hexDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  function hexToScreen(hexX, hexY) {
    const hexRadius = 80;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    return {
      x: centerX + hexX * hexRadius * 1.5,
      y: centerY + hexY * hexRadius * 1.73
    };
  }
  
  function detectAllForests(env) {
    // This should be integrated with λ-GROWTH's forest detection
    // For now, simple implementation
    const forests = [];
    const processed = new Set();
    
    Object.entries(env.morphisms).forEach(([key, morph]) => {
      if (morph.type === 'seed' && !processed.has(key)) {
        // Find all connected seeds
        const forest = {
          seeds: [key],
          center: { x: morph.x, y: morph.y }
        };
        
        // Mark as processed
        processed.add(key);
        
        // Add to forests if has connections
        if (env.roots && env.roots.some(r => r.source === key || r.target === key)) {
          forests.push(forest);
        }
      }
    });
    
    return forests;
  }
})();

// Export for integration
export { λ_SYMBIOSIS };