// λREDUCE AST: Pure functional representation of imperative code

export type LambdaExpr = 
  | Variable
  | Abstraction 
  | Application
  | Literal
  | Let
  | Y_Combinator;

export interface Variable {
  type: 'Variable';
  name: string;
}

export interface Abstraction {
  type: 'Abstraction';
  param: string;
  body: LambdaExpr;
}

export interface Application {
  type: 'Application';
  func: LambdaExpr;
  arg: LambdaExpr;
}

export interface Literal {
  type: 'Literal';
  value: number | string | boolean;
}

export interface Let {
  type: 'Let';
  bindings: Array<{ name: string; value: LambdaExpr }>;
  body: LambdaExpr;
}

export interface Y_Combinator {
  type: 'Y';
  func: LambdaExpr;
}

// Church encodings for control flow
export const TRUE: Abstraction = {
  type: 'Abstraction',
  param: 'x',
  body: {
    type: 'Abstraction', 
    param: 'y',
    body: { type: 'Variable', name: 'x' }
  }
};

export const FALSE: Abstraction = {
  type: 'Abstraction',
  param: 'x',
  body: {
    type: 'Abstraction',
    param: 'y', 
    body: { type: 'Variable', name: 'y' }
  }
};

export const IF = (cond: LambdaExpr, then: LambdaExpr, else_: LambdaExpr): Application => ({
  type: 'Application',
  func: {
    type: 'Application',
    func: cond,
    arg: then
  },
  arg: else_
});

// Scott encoding for data structures
export const CONS = (head: LambdaExpr, tail: LambdaExpr): Abstraction => ({
  type: 'Abstraction',
  param: 'c',
  body: {
    type: 'Abstraction',
    param: 'n',
    body: {
      type: 'Application',
      func: {
        type: 'Application',
        func: { type: 'Variable', name: 'c' },
        arg: head
      },
      arg: tail
    }
  }
});

export const NIL: Abstraction = {
  type: 'Abstraction',
  param: 'c',
  body: {
    type: 'Abstraction',
    param: 'n',
    body: { type: 'Variable', name: 'n' }
  }
};

// Pretty printer
export function prettyPrint(expr: LambdaExpr): string {
  switch (expr.type) {
    case 'Variable':
      return expr.name;
    case 'Abstraction':
      return `λ${expr.param}.${prettyPrint(expr.body)}`;
    case 'Application':
      return `(${prettyPrint(expr.func)} ${prettyPrint(expr.arg)})`;
    case 'Literal':
      return String(expr.value);
    case 'Let':
      const bindings = expr.bindings.map(b => `${b.name} = ${prettyPrint(b.value)}`).join(', ');
      return `let ${bindings} in ${prettyPrint(expr.body)}`;
    case 'Y':
      return `Y ${prettyPrint(expr.func)}`;
  }
}

// Alpha conversion to avoid variable capture
export function alphaRename(expr: LambdaExpr, oldName: string, newName: string): LambdaExpr {
  switch (expr.type) {
    case 'Variable':
      return expr.name === oldName ? { type: 'Variable', name: newName } : expr;
    case 'Abstraction':
      if (expr.param === oldName) return expr; // shadowed
      return {
        type: 'Abstraction',
        param: expr.param,
        body: alphaRename(expr.body, oldName, newName)
      };
    case 'Application':
      return {
        type: 'Application',
        func: alphaRename(expr.func, oldName, newName),
        arg: alphaRename(expr.arg, oldName, newName)
      };
    case 'Let':
      const shadowedNames = new Set(expr.bindings.map(b => b.name));
      if (shadowedNames.has(oldName)) return expr;
      return {
        type: 'Let',
        bindings: expr.bindings.map(b => ({
          name: b.name,
          value: alphaRename(b.value, oldName, newName)
        })),
        body: alphaRename(expr.body, oldName, newName)
      };
    case 'Y':
      return {
        type: 'Y',
        func: alphaRename(expr.func, oldName, newName)
      };
    case 'Literal':
      return expr;
  }
}

// Beta reduction
export function betaReduce(expr: LambdaExpr, varName: string, value: LambdaExpr): LambdaExpr {
  switch (expr.type) {
    case 'Variable':
      return expr.name === varName ? value : expr;
    case 'Abstraction':
      if (expr.param === varName) return expr; // shadowed
      // Alpha convert if necessary to avoid capture
      const freeVars = getFreeVars(value);
      if (freeVars.has(expr.param)) {
        const newParam = generateFreshVar(expr.param, freeVars);
        return {
          type: 'Abstraction',
          param: newParam,
          body: betaReduce(alphaRename(expr.body, expr.param, newParam), varName, value)
        };
      }
      return {
        type: 'Abstraction',
        param: expr.param,
        body: betaReduce(expr.body, varName, value)
      };
    case 'Application':
      return {
        type: 'Application',
        func: betaReduce(expr.func, varName, value),
        arg: betaReduce(expr.arg, varName, value)
      };
    case 'Let':
      const shadowedNames = new Set(expr.bindings.map(b => b.name));
      if (shadowedNames.has(varName)) return expr;
      return {
        type: 'Let',
        bindings: expr.bindings.map(b => ({
          name: b.name,
          value: betaReduce(b.value, varName, value)
        })),
        body: betaReduce(expr.body, varName, value)
      };
    case 'Y':
      return {
        type: 'Y',
        func: betaReduce(expr.func, varName, value)
      };
    case 'Literal':
      return expr;
  }
}

function getFreeVars(expr: LambdaExpr): Set<string> {
  switch (expr.type) {
    case 'Variable':
      return new Set([expr.name]);
    case 'Abstraction':
      const bodyVars = getFreeVars(expr.body);
      bodyVars.delete(expr.param);
      return bodyVars;
    case 'Application':
      return new Set([...getFreeVars(expr.func), ...getFreeVars(expr.arg)]);
    case 'Let':
      const bindingVars = new Set<string>();
      expr.bindings.forEach(b => {
        getFreeVars(b.value).forEach(v => bindingVars.add(v));
      });
      const bodyVars2 = getFreeVars(expr.body);
      expr.bindings.forEach(b => bodyVars2.delete(b.name));
      return new Set([...bindingVars, ...bodyVars2]);
    case 'Y':
      return getFreeVars(expr.func);
    case 'Literal':
      return new Set();
  }
}

function generateFreshVar(base: string, avoid: Set<string>): string {
  let i = 0;
  let candidate = base;
  while (avoid.has(candidate)) {
    candidate = `${base}${i}`;
    i++;
  }
  return candidate;
}