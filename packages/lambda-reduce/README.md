# λREDUCE

> Convert imperative code to pure lambda calculus

Based on Qwen's research about transforming imperative constructs into pure functional form.

## Overview

λREDUCE transforms JavaScript code into lambda calculus expressions:
- All loops → Y combinators  
- All ifs → Church booleans
- All mutations → immutable bindings
- All state → function parameters

## Installation

```bash
pnpm add @lambda/reduce
```

## Usage

```typescript
import { reduce } from '@lambda/reduce';

const result = reduce('x => x * 2');
console.log(result.pretty);
// λx.((mul x) 2)
```

## Examples

### Simple Function
```javascript
x => x * 2
```
→
```
λx.((mul x) 2)
```

### Conditional
```javascript
if (x < 5) {
  x + 1
} else {
  x * 2
}
```
→
```
((((lt x) 5) ((add x) 1)) ((mul x) 2))
```

### For Loop
```javascript
for (let i = 0; i < n; i++) {
  sum = sum + i;
}
```
→
```
Y (λf.λi.((((lt i) n) ...) i)) 0
```

## Church Encodings

- **Booleans**: `TRUE = λx.λy.x`, `FALSE = λx.λy.y`
- **Numbers**: `0 = λf.λx.x`, `1 = λf.λx.(f x)`, ...
- **Arithmetic**: `ADD = λm.λn.λf.λx.((m f) ((n f) x))`
- **Recursion**: `Y = λf.(λx.(f (x x)) λx.(f (x x)))`

## Theory

Based on:
1. Church-Turing thesis: All computation can be lambda calculus
2. Y combinator for recursion without self-reference
3. Scott encoding for data structures
4. Continuation passing for control flow

## Status

- ✅ Basic expressions
- ✅ If statements → Church booleans
- ✅ Functions → Lambda abstractions
- ✅ For loops → Y combinators
- ⚠️ While loops (partial)
- ❌ Objects/Arrays (coming soon)
- ❌ Async/Await (research needed)

## Contributing

This is pure research. All contributions must preserve mathematical purity.