/**
 * lens - Template Morphism (Domain-specific generator)
 *
 * Creates getter/setter pair for immutable field access/update.
 * First template morphism — demonstrates domain-specific morphism generation.
 *
 * Type: String → { get: (a → b), set: (b → a → a) }
 */

export const lens = field => ({
  get: obj => obj[field],
  set: value => obj => ({ ...obj, [field]: value })
});
