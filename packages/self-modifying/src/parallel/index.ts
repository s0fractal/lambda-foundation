// parallel/index.ts
// Event 019: Automatic Parallelization via CommutativeMonoid

export {
  generateParallelStrategy,
  canParallelize,
  whyNotParallelizable,
} from './parallelStrategy.js';

export type { ParallelStrategy } from './parallelStrategy.js';
