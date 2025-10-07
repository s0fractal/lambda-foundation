// λREDUCE: JavaScript AST to Lambda Calculus transformer

import * as babel from '@babel/parser';
import type * as t from '@babel/types';
import { 
  LambdaExpr, 
  Variable, 
  Abstraction, 
  Application, 
  Literal,
  Let,
  Y_Combinator,
  TRUE, 
  FALSE, 
  IF,
  CONS,
  NIL
} from './ast.js';

type Statement = t.Statement;
type Expression = t.Expression;
type IfStatement = t.IfStatement;
type ForStatement = t.ForStatement;
type FunctionDeclaration = t.FunctionDeclaration;
type BinaryExpression = t.BinaryExpression;
type Identifier = t.Identifier;
type NumericLiteral = t.NumericLiteral;
type StringLiteral = t.StringLiteral;
type BooleanLiteral = t.BooleanLiteral;
type CallExpression = t.CallExpression;
type ArrowFunctionExpression = t.ArrowFunctionExpression;
type BlockStatement = t.BlockStatement;
type VariableDeclaration = t.VariableDeclaration;
type ReturnStatement = t.ReturnStatement;

export class JSToLambda {
  private varCounter = 0;
  
  parseJS(code: string): LambdaExpr {
    const ast = babel.parse(code, {
      sourceType: 'module',
      plugins: []
    });
    
    if (ast.program.body.length === 0) {
      return NIL;
    }
    
    if (ast.program.body.length === 1) {
      const stmt = ast.program.body[0];
      if (stmt.type === 'ExpressionStatement') {
        return this.transformExpression(stmt.expression);
      }
    }
    
    return this.transformStatements(ast.program.body);
  }
  
  private transformStatements(stmts: Statement[]): LambdaExpr {
    if (stmts.length === 0) return NIL;
    if (stmts.length === 1) return this.transformStatement(stmts[0]);
    
    // Sequential composition via let bindings
    return stmts.reduceRight((acc, stmt) => {
      if (stmt.type === 'VariableDeclaration') {
        const bindings = stmt.declarations.map(d => {
          if (d.id.type !== 'Identifier') {
            throw new Error('Destructuring not yet supported');
          }
          return {
            name: d.id.name,
            value: d.init ? this.transformExpression(d.init) : NIL
          };
        });
        return { type: 'Let', bindings, body: acc } as Let;
      } else {
        // Create anonymous binding for side effects
        const tmpVar = this.freshVar();
        return {
          type: 'Let',
          bindings: [{ name: tmpVar, value: this.transformStatement(stmt) }],
          body: acc
        } as Let;
      }
    }, NIL as LambdaExpr);
  }
  
  private transformStatement(stmt: Statement): LambdaExpr {
    switch (stmt.type) {
      case 'ExpressionStatement':
        return this.transformExpression(stmt.expression);
      
      case 'IfStatement':
        return this.transformIf(stmt);
      
      case 'ForStatement':
        return this.transformFor(stmt);
      
      case 'FunctionDeclaration':
        return this.transformFunction(stmt);
      
      case 'ReturnStatement':
        return stmt.argument ? this.transformExpression(stmt.argument) : NIL;
      
      case 'BlockStatement':
        return this.transformStatements(stmt.body);
      
      case 'VariableDeclaration':
        // Handled in transformStatements
        return NIL;
      
      default:
        throw new Error(`Statement type ${stmt.type} not yet supported`);
    }
  }
  
  private transformExpression(expr: Expression): LambdaExpr {
    switch (expr.type) {
      case 'Identifier':
        return { type: 'Variable', name: expr.name };
      
      case 'NumericLiteral':
        return { type: 'Literal', value: expr.value };
      
      case 'StringLiteral':
        return { type: 'Literal', value: expr.value };
      
      case 'BooleanLiteral':
        return expr.value ? TRUE : FALSE;
      
      case 'BinaryExpression':
        return this.transformBinary(expr);
      
      case 'CallExpression':
        return this.transformCall(expr);
      
      case 'ArrowFunctionExpression':
        return this.transformArrow(expr);
      
      default:
        throw new Error(`Expression type ${expr.type} not yet supported`);
    }
  }
  
  private transformIf(stmt: IfStatement): LambdaExpr {
    const cond = this.transformExpression(stmt.test);
    const then = this.transformStatement(stmt.consequent);
    const else_ = stmt.alternate ? this.transformStatement(stmt.alternate) : NIL;
    return IF(cond, then, else_);
  }
  
  private transformFor(stmt: ForStatement): LambdaExpr {
    // Convert for loop to Y combinator
    // for(init; test; update) body => Y(\f.\i. if test then (body; f(update)) else nil)(init)
    
    const loopVar = this.freshVar();
    const iterVar = stmt.init && stmt.init.type === 'VariableDeclaration' && 
                    stmt.init.declarations[0].id.type === 'Identifier' ?
                    stmt.init.declarations[0].id.name : this.freshVar();
    
    const init = stmt.init ? 
      (stmt.init.type === 'VariableDeclaration' && stmt.init.declarations[0].init ?
        this.transformExpression(stmt.init.declarations[0].init) : NIL) : NIL;
    
    const test = stmt.test ? this.transformExpression(stmt.test) : TRUE;
    const update = stmt.update ? this.transformExpression(stmt.update) : { type: 'Variable' as const, name: iterVar };
    const body = this.transformStatement(stmt.body);
    
    // Build recursive function
    const loopBody: LambdaExpr = {
      type: 'Abstraction',
      param: iterVar,
      body: IF(
        test,
        {
          type: 'Let',
          bindings: [{ name: '_', value: body }],
          body: {
            type: 'Application',
            func: { type: 'Variable' as const, name: loopVar },
            arg: update
          }
        },
        { type: 'Variable' as const, name: iterVar }
      )
    };
    
    return {
      type: 'Application',
      func: {
        type: 'Y',
        func: {
          type: 'Abstraction',
          param: loopVar,
          body: loopBody
        }
      },
      arg: init
    };
  }
  
  private transformFunction(stmt: FunctionDeclaration): LambdaExpr {
    if (!stmt.id) throw new Error('Anonymous functions not supported in declarations');
    
    const params = stmt.params.map(p => {
      if (p.type !== 'Identifier') throw new Error('Complex params not yet supported');
      return p.name;
    });
    
    const body = this.transformStatement(stmt.body);
    
    // Create nested abstractions for multiple params
    const lambda = params.reduceRight(
      (acc, param) => ({ type: 'Abstraction', param, body: acc } as Abstraction),
      body
    );
    
    // Return a let binding
    return {
      type: 'Let',
      bindings: [{ name: stmt.id.name, value: lambda }],
      body: { type: 'Variable', name: stmt.id.name }
    };
  }
  
  private transformArrow(expr: ArrowFunctionExpression): LambdaExpr {
    const params = expr.params.map(p => {
      if (p.type !== 'Identifier') throw new Error('Complex params not yet supported');
      return p.name;
    });
    
    const body = expr.body.type === 'BlockStatement' ?
      this.transformStatement(expr.body) :
      this.transformExpression(expr.body);
    
    return params.reduceRight(
      (acc, param) => ({ type: 'Abstraction', param, body: acc } as Abstraction),
      body
    );
  }
  
  private transformBinary(expr: BinaryExpression): LambdaExpr {
    if (!('type' in expr.left) || !('type' in expr.right)) {
      throw new Error('Invalid binary expression');
    }
    const left = this.transformExpression(expr.left as Expression);
    const right = this.transformExpression(expr.right as Expression);
    
    // Church-encoded arithmetic
    switch (expr.operator) {
      case '+':
        return {
          type: 'Application',
          func: {
            type: 'Application', 
            func: { type: 'Variable', name: 'add' },
            arg: left
          },
          arg: right
        };
      
      case '-':
        return {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'sub' },
            arg: left
          },
          arg: right
        };
      
      case '*':
        return {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'mul' },
            arg: left
          },
          arg: right
        };
      
      case '/':
        return {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'div' },
            arg: left
          },
          arg: right
        };
      
      case '<':
        return {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'lt' },
            arg: left
          },
          arg: right
        };
      
      case '===':
      case '==':
        return {
          type: 'Application',
          func: {
            type: 'Application',
            func: { type: 'Variable', name: 'eq' },
            arg: left
          },
          arg: right
        };
      
      default:
        throw new Error(`Operator ${expr.operator} not yet supported`);
    }
  }
  
  private transformCall(expr: CallExpression): LambdaExpr {
    if (!this.isExpression(expr.callee)) {
      throw new Error('Unsupported callee type: ' + expr.callee.type);
    }
    const func = this.transformExpression(expr.callee);
    const args = expr.arguments.map(a => {
      if (a.type === 'SpreadElement') throw new Error('Spread not yet supported');
      if (!this.isExpression(a)) throw new Error('Unsupported argument type');
      return this.transformExpression(a);
    });
    
    // Left-associate applications
    return args.reduce(
      (acc, arg) => ({ type: 'Application', func: acc, arg } as Application),
      func
    );
  }
  
  private freshVar(): string {
    return `_tmp${this.varCounter++}`;
  }
  
  private isExpression(node: any): node is Expression {
    // Type guard for Expression nodes
    return node && typeof node.type === 'string' && 
           node.type !== 'PrivateName' && 
           node.type !== 'V8IntrinsicIdentifier';
  }
}