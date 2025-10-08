// λREDUCE: Pure functional transformation of imperative code
// Extended with: Intent Recognition, Residue Analysis, Noosphere Integration

export * from './ast.js';
export * from './transformer.js';
export * from './prelude.js';
export * from './intent.js';
export * from './residue.js';
export * from './noosphere.js';
export * from './noosphere-persist.js';

import { JSToLambda } from './transformer.js';
import { prettyPrint, LambdaExpr } from './ast.js';
import { PRELUDE } from './prelude.js';

export interface ReduceOptions {
  includePrelude?: boolean;
  optimize?: boolean;
  target?: 'lambda' | 'ski' | 'combinatory';
}

export function reduce(jsCode: string, options: ReduceOptions = {}): {
  ast: LambdaExpr;
  pretty: string;
  normalized?: string;
} {
  const transformer = new JSToLambda();
  const ast = transformer.parseJS(jsCode);
  
  let finalAst = ast;
  if (options.includePrelude !== false) {
    // Wrap in prelude environment
    finalAst = {
      type: 'Let',
      bindings: PRELUDE,
      body: ast
    };
  }
  
  const pretty = prettyPrint(finalAst);
  
  return {
    ast: finalAst,
    pretty
  };
}

// CLI interface
export function reduceCLI(code: string): void {
  console.log('λREDUCE: Transforming imperative code to pure lambda calculus\n');
  console.log('Input JavaScript:');
  console.log(code);
  console.log('\nOutput Lambda Calculus:');
  
  try {
    const result = reduce(code);
    console.log(result.pretty);
    
    console.log('\n✓ Transformation successful!');
    console.log('  All loops → Y combinators');
    console.log('  All ifs → Church booleans');
    console.log('  All mutations → immutable bindings');
  } catch (e) {
    console.error('\n✗ Transformation failed:', e instanceof Error ? e.message : e);
  }
}