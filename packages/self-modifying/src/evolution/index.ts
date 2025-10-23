// evolution/index.ts
// Event 020: Algebra Evolution

export {
  composeAlgebras,
  composeThree,
  withTransform,
  canCompose,
  whyCannotCompose,
} from './algebraComposer.js';

export {
  withFinalization,
  computeFinalized,
  canParallelizeFinalized,
} from './algebraFinalized.js';

export type { FinalizedAlgebra } from './algebraFinalized.js';

export {
  AlgebraRegistry,
  globalRegistry,
} from './algebraRegistry.js';

/**
 * Initialize global registry with base algebras
 */
import { classifyAlgebra } from '../meta/algebraClassifier.js';
import { algebras } from '../domains/fold.js';
import { globalRegistry } from './algebraRegistry.js';

export function initializeBaseAlgebras(): void {
  // Only initialize if registry is empty
  if (globalRegistry.has('sum')) {
    return;  // Already initialized
  }

  // Classify and register base algebras
  globalRegistry.register('sum', classifyAlgebra('sum', algebras.sum, {
    identityCandidates: [0],
    numSamples: 100,
  }), true);

  globalRegistry.register('product', classifyAlgebra('product', algebras.product, {
    identityCandidates: [1],
    numSamples: 100,
  }), true);

  globalRegistry.register('max', classifyAlgebra('max', algebras.max, {
    identityCandidates: [-Infinity],
    numSamples: 100,
  }), true);

  globalRegistry.register('min', classifyAlgebra('min', algebras.min, {
    identityCandidates: [Infinity],
    numSamples: 100,
  }), true);

  globalRegistry.register('count', classifyAlgebra('count', algebras.count, {
    identityCandidates: [0],
    numSamples: 100,
  }), true);

  globalRegistry.register('concat', classifyAlgebra('concat', algebras.concat, {
    identityCandidates: [''],
    numSamples: 100,
  }), true);
}
