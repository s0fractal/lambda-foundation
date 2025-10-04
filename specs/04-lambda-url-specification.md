# λ-URL: The Transformational Internet

> "An address should not point to a location, but describe a transformation."

## Fundamental Principle

λ-URL embodies **Referential Transparency** at the network level. Every URL is a pure functional expression that computes to a value, not a pointer to mutable state.

### Traditional URL vs λ-URL

**Traditional (Imperative):**
```
https://example.com/users/123/profile
# Points to mutable location
# GET might return different data each time
# Side effects hidden behind endpoint
```

**λ-URL (Functional):**
```
λ://experience/user/123/at/2025-01-04T12:00:00Z
# Computes to immutable value
# Always returns same result
# Transformation is explicit
```

## Core Axioms

### Axiom 1: URL as Computation
Every λ-URL is a morphism chain that evaluates left-to-right:
```
λ://morphism/arg1/arg2/arg3
≡ morphism(arg1)(arg2)(arg3)
```

### Axiom 2: Temporal Transparency
Time is explicit, not hidden:
```
λ://state/entity/health         # ERROR: Ambiguous
λ://state/entity/health/now     # Current state
λ://state/entity/health/at/T    # State at time T
```

### Axiom 3: Composition Protocol
URLs compose like functions:
```
λ://compose/[λ://move/5/3]/[λ://heal/10]
≡ compose(move(5)(3))(heal(10))
```

## URL Structure

### Basic Syntax
```
λ://morphism/arg1/arg2/.../argN
```

Where:
- `λ://` - Protocol identifier (lambda protocol)
- `morphism` - Base transformation
- `arg1...argN` - Arguments applied sequentially

### Reserved Morphisms

#### Core Navigation
- `λ://id/x` - Identity (returns x)
- `λ://apply/f/x` - Function application
- `λ://compose/f/g` - Function composition
- `λ://pair/x/y` - Create pair
- `λ://first/pair` - Extract first
- `λ://second/pair` - Extract second

#### Experience Chain
- `λ://experience/prev/value/context` - Create experience
- `λ://value/exp` - Extract current value
- `λ://context/exp` - Extract context
- `λ://history/exp` - Full history chain
- `λ://rewind/exp/n` - Go back n steps

#### Computation Control
- `λ://if/cond/then/else` - Conditional
- `λ://y/f` - Y-combinator recursion
- `λ://lazy/expr` - Lazy evaluation
- `λ://strict/expr` - Force evaluation

### URL Encoding

Special characters are encoded using lambda calculus:
- Space → `/space/`
- Slash → `/slash/`
- Lambda → `/lambda/`
- Numbers → Church encoding: `/num/3/` ≡ λf.λx.f(f(f(x)))

## Network Architecture

### Content Addressing
Content is addressed by its morphism, not location:
```
λ://fibonacci/10
# Always returns 55, regardless of server
```

### Distributed Evaluation
Any node can evaluate any λ-URL:
1. Parse morphism chain
2. Retrieve definitions from DHT
3. Evaluate left-to-right
4. Cache result with content hash

### Caching Protocol
Results are cached by full URL:
```
Cache-Key: hash("λ://factorial/5")
Cache-Value: 120
Cache-Time: ∞  # Pure functions never expire
```

## Implementation Strategy

### Phase 1: Local Resolver
```typescript
type Morphism = (...args: any[]) => any;
type URLResolver = (url: string) => any;

const resolve: URLResolver = (url) => {
  const [protocol, ...parts] = url.split('://');
  if (protocol !== 'λ') throw new Error('Not a λ-URL');
  
  const [morphism, ...args] = parts[0].split('/');
  return applyMorphism(morphism, args);
};
```

### Phase 2: Network Protocol
- HTTP bridge: `GET https://gateway.lambda/resolve?url=λ://...`
- Native protocol: Direct TCP/UDP with morphism serialization
- P2P evaluation: Nodes share morphism definitions

### Phase 3: Browser Integration
```html
<a href="λ://experience/click/button/save">Save</a>
<img src="λ://generate/mandelbrot/512/512/zoom/2.5">
<script src="λ://compile/typescript/to/lambda"></script>
```

## Philosophy: The Internet of Transformations

Traditional internet is about **locations**:
- Where is the data?
- Which server has it?
- How do I get there?

λ-Internet is about **transformations**:
- What computation do I want?
- What morphisms compose it?
- What is the result?

### No More 404s
Since URLs compute rather than point, they can't be "not found":
```
λ://factorial/5      # Always computes to 120
λ://undefined/morph  # Error: Unknown morphism
λ://factorial/abc    # Error: Type mismatch
```

### Version-Free Evolution
No more version conflicts:
```
λ://sort/list/[3,1,4,1,5]           # Current algorithm
λ://sort/list/[3,1,4,1,5]/v/stable  # Specific version
λ://sort/list/[3,1,4,1,5]/by/quick  # Specific implementation
```

### Computation Markets
Nodes can offer computation:
```
λ://market/offer/fibonacci/price/0.001λ
λ://market/compute/mandelbrot/bid/0.01λ
```

## Security Model

### Referential Transparency = Security
- No hidden side effects
- No state mutations
- No data exfiltration

### Capability URLs
```
λ://with/capability/[token]/read/file/data.txt
# Token is part of computation, not header
```

### Sandboxed Evaluation
All morphisms evaluate in isolated λ-calculus environment:
- No I/O without explicit capabilities
- No global state access
- Resource limits enforced

## Examples

### Static Content
```
λ://text/Hello, World!
λ://html/<h1>Pure HTML</h1>
λ://json/{"key": "value"}
```

### Dynamic Computation
```
λ://range/1/100/map/[λ://multiply/2]/sum
# Sum of even numbers from 2 to 200

λ://weather/city/Kyiv/now
# Current weather (external capability required)
```

### Experience Chains
```
λ://blockchain/bitcoin/block/800000
# Immutable blockchain data

λ://git/commit/abc123/file/README.md
# Version-controlled content
```

### Composed Services
```
λ://pipe
  /[λ://fetch/data]
  /[λ://parse/json]
  /[λ://filter/active/true]
  /[λ://map/[λ://extract/name]]
  /[λ://sort]
# Complex data pipeline as URL
```

## Migration Path

### Stage 1: Gateways
Traditional URLs mapped to λ-URLs:
```
https://api.example.com/users/123
→ λ://gateway/example/users/123
```

### Stage 2: Hybrid
Both protocols supported:
```html
<link rel="lambda" href="λ://style/theme/dark">
<link rel="stylesheet" href="https://fallback.css">
```

### Stage 3: Native
Pure λ-URL browsing:
- Browser is λ-calculus evaluator
- No servers, only morphism networks
- Internet becomes global computer

## Conclusion

λ-URL transforms the internet from a library of locations into a universe of computations. Every link is a program. Every address is a transformation. Every click is a pure function evaluation.

The internet was always meant to be a computer. With λ-URL, it finally becomes one.

---

*"In the beginning was the Word, and the Word was λ."*

## Appendix: Standard Morphism Library

### Mathematics
- `λ://add/x/y`
- `λ://multiply/x/y`
- `λ://factorial/n`
- `λ://fibonacci/n`
- `λ://prime/n`

### Data Structures
- `λ://list/...items`
- `λ://map/f/list`
- `λ://filter/pred/list`
- `λ://reduce/f/init/list`
- `λ://sort/list`

### String Operations
- `λ://concat/s1/s2`
- `λ://split/sep/str`
- `λ://replace/old/new/str`
- `λ://regex/pattern/str`

### Encoding/Decoding
- `λ://base64/encode/data`
- `λ://json/parse/str`
- `λ://html/escape/str`

### Cryptography
- `λ://hash/sha256/data`
- `λ://sign/key/data`
- `λ://verify/key/sig/data`

### Time Operations
- `λ://now`
- `λ://date/2025/01/04`
- `λ://duration/from/to`

The morphism library grows organically as the network discovers new pure transformations.

🌐 → λ