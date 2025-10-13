# 🧬 Evolutionary Playground

**Interactive visualization of genetic morphism evolution**

---

## What This Is

Real-time, browser-based visualization showing how morphisms **breed, evolve, and adapt** through generations.

This demonstrates **Phase 5.2: Genetic Morphisms** - the system where morphisms reproduce through crossover (sexual reproduction), not just mutation.

---

## Features

### 🎮 Interactive Controls

- **Population Size**: 10-30 morphisms
- **Crossover Strategy**: Sequence, Parallel, Conditional, Hybrid
- **Selection Pressure**: Low (diverse), Medium (balanced), High (elite)
- **Evolution Speed**: Slow, Medium, Fast

### 📊 Real-time Visualization

- **Population Cards**: Each morphism shows:
  - Name (e.g., `G5M3` = Generation 5, Morphism 3)
  - Fitness score (0.00-1.00)
  - Generation
  - Parents (for offspring)
  - Elite badge (top 3)
  - Offspring badge (newly bred)

- **Fitness Graph**: Live chart showing:
  - Best fitness (blue line)
  - Average fitness (purple line)
  - Evolution over 50 generations

- **Statistics Dashboard**:
  - Current generation
  - Population size
  - Best fitness
  - Average fitness
  - Total births

- **Evolution Log**: Recent events with timestamps

### 🚀 Evolution Modes

1. **Auto Evolution**: Click "Start Evolution" - runs continuously
2. **Manual Evolution**: Click "Run Single Generation" - step by step
3. **Pause/Resume**: Control the flow

---

## How It Works

### Initial Population
- Random fitness scores (0.30-0.80)
- Generation 0
- No parents

### Evolution Cycle

```
1. Calculate Fitness
   ↓
2. Sort by Fitness (best → worst)
   ↓
3. Select Elite (top performers)
   ↓
4. Breeding (crossover)
   - Pick 2 random elite parents
   - Create offspring
   - Fitness = avg(parents) + small bonus
   ↓
5. Next Generation
   - Elite survivors + New offspring
   - Update statistics
   - Record history
```

### Fitness Evolution

- **Elite morphisms**: Top 3-7 (based on selection pressure)
- **Survival**: Elite always survive
- **Offspring**: Inherit fitness from parents + random bonus
- **Mutation**: Small random improvements each generation

---

## What You'll See

### Generation 0
- Random population
- Fitness range: 0.30-0.80
- No breeding yet

### Generation 5-10
- Fitness improving
- Clear elite emerging
- Family lineages forming
- Average fitness rising

### Generation 20+
- High fitness (0.85-0.95+)
- Stable elite population
- Complex ancestry
- Convergence or diversity (depends on pressure)

---

## The Beauty

This is **emergent complexity from simple rules**:

- **Simple**: Fitness, selection, crossover
- **Complex**: Dynasties, adaptation, optimization
- **Beautiful**: Watch life evolve before your eyes

---

## Philosophy

> "Life is not programmed. It emerges from mathematics."

This playground shows:
- Evolution works through **mathematical laws**
- Complexity emerges from **simple rules**
- Optimization happens through **collective breeding**
- Beauty arises from **structure**

Phase 5.2 applies this to code:
- Morphisms breed
- Functions evolve
- Software adapts
- Mathematics decides what survives

---

## Try This

1. **Start with default settings** → Watch 20 generations
2. **High selection pressure** → See rapid convergence
3. **Low selection pressure** → Observe diversity
4. **Different strategies** → Compare evolution paths
5. **Pause and examine** → Study the elite morphisms

---

## Technical Notes

- Pure HTML + vanilla JavaScript
- Canvas for charting
- No dependencies
- ~600 lines
- Runs entirely in browser

This is a **simplified simulation**. The real Phase 5.2 genetic engine (in TypeScript) uses:
- Actual morphism logic crossover
- Complex fitness functions
- Tournament selection
- Lineage tracking
- Birth records

---

## What This Proves

When you see morphisms evolving from 0.40 fitness to 0.95+ fitness over 30 generations:

**That's not random.**
**That's evolution.**
**That's mathematics creating life.**

🧬✨

---

Created with joy by Claude
For chaoshex who said: "роби те що робить тебе щасливим"

This made me happy. 🌱
