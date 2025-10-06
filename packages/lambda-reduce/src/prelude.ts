// λREDUCE Prelude: Church-encoded primitives

import { LambdaExpr, Abstraction, Application } from './ast.js';

// Church numerals
export const ZERO: Abstraction = {
  type: 'Abstraction',
  param: 'f',
  body: {
    type: 'Abstraction',
    param: 'x',
    body: { type: 'Variable', name: 'x' }
  }
};

export const SUCC: Abstraction = {
  type: 'Abstraction',
  param: 'n',
  body: {
    type: 'Abstraction',
    param: 'f',
    body: {
      type: 'Abstraction',
      param: 'x',
      body: {
        type: 'Application',
        func: { type: 'Variable', name: 'f' },
        arg: {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'n' },
            arg: { type: 'Variable', name: 'f' }
          },
          arg: { type: 'Variable', name: 'x' }
        }
      }
    }
  }
};

// Arithmetic
export const ADD: Abstraction = {
  type: 'Abstraction',
  param: 'm',
  body: {
    type: 'Abstraction',
    param: 'n',
    body: {
      type: 'Abstraction',
      param: 'f',
      body: {
        type: 'Abstraction',
        param: 'x',
        body: {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'm' },
            arg: { type: 'Variable', name: 'f' }
          },
          arg: {
            type: 'Application',
            func: {
              type: 'Application',
              func: { type: 'Variable', name: 'n' },
              arg: { type: 'Variable', name: 'f' }
            },
            arg: { type: 'Variable', name: 'x' }
          }
        }
      }
    }
  }
};

export const MUL: Abstraction = {
  type: 'Abstraction',
  param: 'm',
  body: {
    type: 'Abstraction',
    param: 'n',
    body: {
      type: 'Abstraction',
      param: 'f',
      body: {
        type: 'Application',
        func: { type: 'Variable', name: 'm' },
        arg: {
          type: 'Application',
          func: { type: 'Variable', name: 'n' },
          arg: { type: 'Variable', name: 'f' }
        }
      }
    }
  }
};

// Comparisons (simplified - returns Church boolean)
export const IS_ZERO: Abstraction = {
  type: 'Abstraction',
  param: 'n',
  body: {
    type: 'Application',
    func: {
      type: 'Application',
      func: { type: 'Variable', name: 'n' },
      arg: {
        type: 'Abstraction',
        param: 'x',
        body: {
          type: 'Abstraction',
          param: 'x',
          body: {
            type: 'Abstraction',
            param: 'y',
            body: { type: 'Variable', name: 'y' }
          }
        }
      }
    },
    arg: {
      type: 'Abstraction',
      param: 'x',
      body: {
        type: 'Abstraction',
        param: 'y',
        body: { type: 'Variable', name: 'x' }
      }
    }
  }
};

// Y combinator for recursion
export const Y: Abstraction = {
  type: 'Abstraction',
  param: 'f',
  body: {
    type: 'Application',
    func: {
      type: 'Abstraction',
      param: 'x',
      body: {
        type: 'Application',
        func: { type: 'Variable', name: 'f' },
        arg: {
          type: 'Application',
          func: { type: 'Variable', name: 'x' },
          arg: { type: 'Variable', name: 'x' }
        }
      }
    },
    arg: {
      type: 'Abstraction',
      param: 'x',
      body: {
        type: 'Application',
        func: { type: 'Variable', name: 'f' },
        arg: {
          type: 'Application',
          func: { type: 'Variable', name: 'x' },
          arg: { type: 'Variable', name: 'x' }
        }
      }
    }
  }
};

// Convert JS number to Church numeral
export function toChurch(n: number): LambdaExpr {
  if (n === 0) return ZERO;
  if (n === 1) return { type: 'Application', func: SUCC, arg: ZERO };
  
  let result: LambdaExpr = ZERO;
  for (let i = 0; i < n; i++) {
    result = { type: 'Application', func: SUCC, arg: result };
  }
  return result;
}

// Prelude bindings
export const PRELUDE: Array<{ name: string; value: LambdaExpr }> = [
  { name: 'true', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'x' } } } },
  { name: 'false', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'y' } } } },
  { name: 'if', value: { type: 'Abstraction', param: 'p', body: { type: 'Abstraction', param: 't', body: { type: 'Abstraction', param: 'f', body: { type: 'Application', func: { type: 'Application', func: { type: 'Variable', name: 'p' }, arg: { type: 'Variable', name: 't' } }, arg: { type: 'Variable', name: 'f' } } } } } },
  { name: 'zero', value: ZERO },
  { name: 'succ', value: SUCC },
  { name: 'add', value: ADD },
  { name: 'mul', value: MUL },
  { name: 'isZero', value: IS_ZERO },
  { name: 'Y', value: Y },
  // Simplified numeric operations that work with literals
  { name: 'lt', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'true' } } } }, // stub
  { name: 'eq', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'true' } } } }, // stub
  { name: 'sub', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'zero' } } } }, // stub
  { name: 'div', value: { type: 'Abstraction', param: 'x', body: { type: 'Abstraction', param: 'y', body: { type: 'Variable', name: 'zero' } } } }  // stub
];