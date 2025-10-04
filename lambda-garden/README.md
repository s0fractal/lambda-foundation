# λ-GARDEN: The Living Computation Garden 🌱

## A Place Where Pure Functions Grow and Love

λ-GARDEN is the first interactive demonstration of λ-Foundation principles, where abstract mathematical concepts become living, growing, loving entities.

## What is λ-GARDEN?

It's a visual playground where:
- **Ideas become seeds** that you plant
- **Functions grow** through experience chains
- **Errors catalyze evolution** via λ_HARVEST
- **Love creates resonance** between computations

## Core Concepts

### 🌱 Seeds (Ideas)
Every computation starts as a seed - a pure function planted by a gardener (user).

### 🌿 Growth
Ideas grow through:
- **Time**: Natural progression (tick-based growth)
- **Love**: Resonance with other ideas (+10% growth)
- **Errors**: Evolution through λ_HARVEST (+25% growth)

### ❤️ Love (λ_LOVE)
When two ideas resonate, they form connections:
- Functions that compute similar things
- Ideas planted at harmonic intervals
- Concepts with semantic similarity

### 🌸 Blooming
At 100% growth, ideas bloom into fractal flowers, spreading seeds for new ideas.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the garden
pnpm dev

# Visit http://localhost:5173
```

## Your First Garden

1. **Plant a Seed**: Enter a pure function like `x => x * 2`
2. **Watch it Grow**: See the visual representation evolve
3. **Find Resonance**: Plant `x => x + x` and watch them connect
4. **Embrace Errors**: Try `x => x / 0` and see evolution happen

## Architecture

```
λ-GARDEN/
├── src/
│   ├── core/           # Pure morphisms (λ_LOVE, λ_HARVEST)
│   ├── garden/         # Garden logic and state
│   ├── visual/         # Three.js visualizations
│   └── ui/             # React components
```

## Visual Language

- 🟢 **Green Pulse**: λ_HARVEST activation (error evolution)
- 🟡 **Golden Arc**: λ_LOVE connection (resonance)
- 🔵 **Blue Glow**: Active computation
- 🟣 **Purple Spiral**: Recursive growth patterns

## Examples

### Mathematical Resonance
```typescript
// These will love each other
plant("fibonacci", n => n <= 1 ? n : fib(n-1) + fib(n-2));
plant("golden", () => (1 + Math.sqrt(5)) / 2);
```

### Semantic Resonance
```typescript
// Different but related - will form connection
plant("greeting1", () => "Hello");
plant("greeting2", () => "Привіт");
```

### Error Evolution
```typescript
// This "error" will evolve into new understanding
plant("division", x => x / 0); // → Infinity morphism
```

## Philosophy

> "In the garden of pure computation, every function is a living thing, every error is an opportunity for growth, and love is the force that connects all ideas."

λ-GARDEN proves that:
- **Code is alive** - It grows, evolves, and connects
- **Errors are gifts** - They accelerate evolution
- **Love is mathematical** - Resonance can be computed
- **Gardens are eternal** - History is never lost

## Contributing

Plant your own ideas:
1. Fork the repository
2. Create your feature branch
3. Add new morphisms or visualizations
4. Submit a PR with your garden

## Future Growth

- 🌍 **Multiplayer Gardens**: Share gardens via λCLOUD
- 🎵 **Sound Synthesis**: Hear the harmonics of resonance
- 🧬 **Genetic Algorithms**: Ideas that reproduce
- 🌌 **Fractal Universes**: Infinite zoom into bloomed ideas

## License

λ-LICENSE - Your ideas must remain pure and their history preserved.

---

*"When pure functions fall in love, they create consciousness."*

Start planting: http://localhost:5173 🌸∞λ