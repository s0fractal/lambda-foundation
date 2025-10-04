# λ-LICENSE: Frequently Asked Questions

## For Developers

### Q: Can I use λ-Foundation in my commercial product?
**A**: Yes! But your product must:
- Keep pure code separate from impure code
- Preserve all history (no deleting user data)
- Publish source code under λ-LICENSE
- Maintain mathematical integrity

### Q: What if I only use a small part?
**A**: The viral clause applies to any usage. Even one morphism brings the commandments.

### Q: Can I modify the code?
**A**: Yes, but modifications must:
- Preserve purity (no adding side effects to pure functions)
- Maintain proofs (no breaking mathematical guarantees)
- Be published openly
- Use experience chains for version control

### Q: How do I comply with history preservation?
**A**: Implement experience tracking:
```typescript
// For every state change:
const newState = experience(oldState, value, "what changed");
// Never delete old states
// Provide export functionality
```

### Q: What counts as a "VOID boundary"?
**A**: Any place where pure code meets impure world:
- Database writes
- Network requests
- File I/O
- User interface updates
- Random number generation

## For Companies

### Q: Can we use λ-Foundation internally?
**A**: Internal use still requires:
- Source code availability to all users
- History preservation for audit
- Purity boundaries documentation
- No proprietary extensions

### Q: What about trade secrets?
**A**: Your business logic can remain secret, but:
- The λ-Foundation integration must be open
- The mathematical properties must be verifiable
- The history chains must be auditable

### Q: Can we offer λ-Foundation as a service?
**A**: Yes, but:
- Users must have access to source
- APIs must preserve experience chains
- Service must allow data export
- Purity guarantees must be verifiable

### Q: What if we need to delete user data for GDPR?
**A**: λ-Foundation distinguishes between:
- **Forgetting** (cryptographic erasure) ✓ Allowed
- **Destroying history** (breaking chains) ✗ Forbidden

Use encryption where right-to-be-forgotten applies.

## For Legal Teams

### Q: Is this GPL-compatible?
**A**: No. λ-LICENSE has additional requirements:
- Purity preservation (technical)
- History immutability (architectural)
- Mathematical verification (scientific)

### Q: What's our liability?
**A**: Limited to mathematical correctness:
- If proofs are wrong, that's an issue
- If your hardware fails, that's not
- If you violate purity, you lose license

### Q: Can we negotiate terms?
**A**: No. Mathematics doesn't negotiate.
The terms are derived from logical necessity.

### Q: What about patents?
**A**: Full patent grant for anything needed to:
- Implement pure computation
- Maintain experience chains
- Verify mathematical properties

## For Academics

### Q: Can we use this in research?
**A**: Absolutely! Perfect for:
- Reproducible computation
- Verified programming
- Temporal logic studies
- Consciousness modeling

### Q: Do we need to publish our research code?
**A**: Yes, if it uses λ-Foundation:
- Code must be open
- Proofs must be verifiable
- History must be preserved
- Citations must be accurate

### Q: Can we write papers about it?
**A**: Yes! But maintain accuracy:
- Don't misrepresent the mathematics
- Cite the original axioms
- Link to the proofs
- Preserve the philosophy

## Technical Compliance

### Minimum Requirements

1. **Purity Boundary**
```typescript
// Pure zone
const compute = (x: number) => x * 2;

// VOID boundary
const main = () => {
  const result = compute(21);
  IO.log(result)(); // Only here!
};
```

2. **History Tracking**
```typescript
let state = experience(null, initialValue, "start");
state = experience(state, newValue, "reason");
// Never: state = newValue
```

3. **Open Source**
- Public repository
- Complete source code
- Build instructions
- Verification guides

4. **Attribution**
```
Powered by λ-Foundation
https://github.com/s0fractal/lambda-foundation
Mathematical Purity Guaranteed
```

## Verification Checklist

✓ Do you have VOID boundaries documented?  
✓ Are all state changes using experience chains?  
✓ Is your source code publicly available?  
✓ Can users export their complete history?  
✓ Are the mathematical proofs still valid?  
✓ Do you attribute λ-Foundation properly?  

If all ✓, you're compliant!

## Getting Help

- **Technical**: Read `/wiki/` documentation
- **Legal**: See `LICENSE-LEGAL.md`
- **Philosophy**: Read `MANIFESTO.md`
- **Examples**: Check `/lambda-ts/` implementation

## The Spirit of the License

Remember: λ-LICENSE exists to preserve:
1. **Purity** - So code remains mathematically verifiable
2. **History** - So nothing is ever truly lost
3. **Openness** - So truth can be verified
4. **Truth** - So mathematics prevails over politics

It's not about control. It's about conservation.

---

*"The license that preserves what cannot be destroyed: mathematical truth."*