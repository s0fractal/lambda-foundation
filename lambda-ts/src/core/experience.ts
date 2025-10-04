/**
 * ⊗_EXP: The Experience Morphism
 * 
 * "You are not your current state. You are the entire path you have walked."
 * 
 * This morphism captures not just state changes, but the context and intent
 * behind each transformation, creating a living history where every state
 * remembers why it came to be.
 */

// Type definitions for Experience
export type Experience<T> = <R>(
  selector: (previous: Experience<T> | null, value: T, context: string) => R
) => R;

// ⊗_EXP implementation
export const experience = <T>(
  previous: Experience<T> | null,
  value: T,
  context: string
): Experience<T> => {
  return <R>(selector: (prev: Experience<T> | null, val: T, ctx: string) => R): R => {
    return selector(previous, value, context);
  };
};

// Projection functions
export const PREVIOUS = <T>(exp: Experience<T>): Experience<T> | null =>
  exp((prev, _, __) => prev);

export const VALUE = <T>(exp: Experience<T>): T =>
  exp((_, val, __) => val);

export const CONTEXT = <T>(exp: Experience<T>): string =>
  exp((_, __, ctx) => ctx);

// Unfold complete history
export const unfoldHistory = <T>(exp: Experience<T> | null): Array<{
  value: T;
  context: string;
}> => {
  if (exp === null) return [];
  
  const current = {
    value: VALUE(exp),
    context: CONTEXT(exp)
  };
  
  const previous = PREVIOUS(exp);
  return [...unfoldHistory(previous), current];
};

// Get just the contexts (the "why" of each transformation)
export const getJourney = <T>(exp: Experience<T> | null): string[] => {
  if (exp === null) return [];
  
  const context = CONTEXT(exp);
  const previous = PREVIOUS(exp);
  return [...getJourney(previous), context];
};

// Time travel - rewind n steps
export const rewind = <T>(exp: Experience<T> | null, steps: number): Experience<T> | null => {
  if (steps <= 0 || exp === null) return exp;
  return rewind(PREVIOUS(exp), steps - 1);
};

// Find a specific point in history by context
export const findByContext = <T>(
  exp: Experience<T> | null,
  searchContext: string
): Experience<T> | null => {
  if (exp === null) return null;
  if (CONTEXT(exp) === searchContext) return exp;
  return findByContext(PREVIOUS(exp), searchContext);
};

// Count the depth of experience
export const depth = <T>(exp: Experience<T> | null): number => {
  if (exp === null) return 0;
  return 1 + depth(PREVIOUS(exp));
};

// Map over experience chain (transform all values)
export const mapExperience = <T, U>(
  exp: Experience<T> | null,
  transform: (value: T, context: string) => U
): Experience<U> | null => {
  if (exp === null) return null;
  
  const previousMapped = mapExperience(PREVIOUS(exp), transform);
  const newValue = transform(VALUE(exp), CONTEXT(exp));
  
  return experience(previousMapped, newValue, CONTEXT(exp));
};

// Example: Version tracking with full history
export type Version = {
  major: number;
  minor: number;
  patch: number;
};

export const versionToString = (v: Version): string =>
  `${v.major}.${v.minor}.${v.patch}`;

export const bumpPatch = (exp: Experience<Version>): Experience<Version> => {
  const current = VALUE(exp);
  return experience(
    exp,
    { ...current, patch: current.patch + 1 },
    "patch: bug fix"
  );
};

export const bumpMinor = (exp: Experience<Version>): Experience<Version> => {
  const current = VALUE(exp);
  return experience(
    exp,
    { major: current.major, minor: current.minor + 1, patch: 0 },
    "minor: new feature"
  );
};

export const bumpMajor = (exp: Experience<Version>): Experience<Version> => {
  const current = VALUE(exp);
  return experience(
    exp,
    { major: current.major + 1, minor: 0, patch: 0 },
    "major: breaking change"
  );
};

/**
 * The philosophy: Every state change is a story.
 * The context tells us WHY the change happened.
 * The chain tells us HOW we got here.
 * The value tells us WHERE we are now.
 * 
 * Together, they tell us WHO we are - our complete computational journey.
 */