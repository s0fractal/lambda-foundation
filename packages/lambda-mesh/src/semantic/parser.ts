/**
 * Simple Lambda Calculus Parser
 *
 * Parses our lambda calculus subset:
 * - Variables: x, y, foo
 * - Abstractions: λx.M or \x.M
 * - Applications: (M N)
 * - Let bindings: let x = M in N
 */

// AST Node types
export type ASTNode = Variable | Abstraction | Application | Let | Literal;

export interface Variable {
  type: 'variable';
  name: string;
}

export interface Abstraction {
  type: 'abstraction';
  param: string;
  body: ASTNode;
}

export interface Application {
  type: 'application';
  func: ASTNode;
  arg: ASTNode;
}

export interface Let {
  type: 'let';
  bindings: Array<{ name: string; value: ASTNode }>;
  body: ASTNode;
}

export interface Literal {
  type: 'literal';
  value: number | boolean;
}

export class LambdaParser {
  private input: string;
  private pos: number;

  constructor(input: string) {
    this.input = input.trim();
    this.pos = 0;
  }

  parse(): ASTNode {
    const expr = this.parseExpr();
    if (this.pos < this.input.length) {
      throw new Error(`Unexpected characters at position ${this.pos}: ${this.input.slice(this.pos)}`);
    }
    return expr;
  }

  private parseExpr(): ASTNode {
    this.skipWhitespace();

    // λx.M or \x.M (abstraction)
    if (this.peek() === 'λ' || this.peek() === '\\') {
      return this.parseAbstraction();
    }

    // let bindings (only check if starting with identifier, not '(')
    if (this.isIdentifierStart(this.peek()) && this.peekWord() === 'let') {
      return this.parseLet();
    }

    // Application or atom
    return this.parseApplication();
  }

  private parseAbstraction(): ASTNode {
    // Consume λ or \
    this.consume();
    this.skipWhitespace();

    // Parse parameter
    const param = this.parseIdentifier();
    this.skipWhitespace();

    // Consume .
    if (this.peek() !== '.') {
      throw new Error(`Expected '.' after parameter in abstraction at position ${this.pos}`);
    }
    this.consume();
    this.skipWhitespace();

    // Parse body
    const body = this.parseExpr();

    return {
      type: 'abstraction',
      param,
      body,
    };
  }

  private parseApplication(): ASTNode {
    let expr = this.parseAtom();

    while (this.pos < this.input.length) {
      this.skipWhitespace();

      // Check if next is an atom (for application)
      if (this.peek() === '(' || this.isIdentifierStart(this.peek())) {
        const arg = this.parseAtom();
        expr = {
          type: 'application',
          func: expr,
          arg,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parseAtom(): ASTNode {
    this.skipWhitespace();

    // Parenthesized expression
    if (this.peek() === '(') {
      this.consume(); // (
      const expr = this.parseExpr();
      this.skipWhitespace();
      if (this.peek() !== ')') {
        throw new Error(`Expected ')' at position ${this.pos}`);
      }
      this.consume(); // )
      return expr;
    }

    // Variable or literal
    if (this.isIdentifierStart(this.peek())) {
      const id = this.parseIdentifier();

      // Check for literals
      if (id === 'true') {
        return { type: 'literal', value: true };
      }
      if (id === 'false') {
        return { type: 'literal', value: false };
      }
      if (!isNaN(Number(id))) {
        return { type: 'literal', value: Number(id) };
      }

      return { type: 'variable', name: id };
    }

    throw new Error(`Unexpected character '${this.peek()}' at position ${this.pos}`);
  }

  private parseLet(): ASTNode {
    // Consume 'let'
    this.consumeWord('let');
    this.skipWhitespace();

    const bindings: Array<{ name: string; value: ASTNode }> = [];

    // Parse bindings
    while (true) {
      const name = this.parseIdentifier();
      this.skipWhitespace();

      if (this.peek() !== '=') {
        throw new Error(`Expected '=' in let binding at position ${this.pos}`);
      }
      this.consume();
      this.skipWhitespace();

      const value = this.parseExpr();
      bindings.push({ name, value });

      this.skipWhitespace();
      if (this.peekWord() === 'in') {
        break;
      }

      // Multiple bindings separated by comma
      if (this.peek() === ',') {
        this.consume();
        this.skipWhitespace();
      }
    }

    // Consume 'in'
    this.consumeWord('in');
    this.skipWhitespace();

    const body = this.parseExpr();

    return {
      type: 'let',
      bindings,
      body,
    };
  }

  private parseIdentifier(): string {
    let id = '';
    while (this.pos < this.input.length && this.isIdentifierChar(this.peek())) {
      id += this.consume();
    }
    if (id === '') {
      throw new Error(`Expected identifier at position ${this.pos}`);
    }
    return id;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.peek())) {
      this.pos++;
    }
  }

  private peek(): string {
    return this.input[this.pos] || '';
  }

  private peekWord(): string {
    const saved = this.pos;
    const word = this.parseIdentifier();
    this.pos = saved;
    return word;
  }

  private consume(): string {
    const char = this.peek();
    this.pos++;
    return char;
  }

  private consumeWord(expected: string): void {
    const word = this.parseIdentifier();
    if (word !== expected) {
      throw new Error(`Expected '${expected}' but got '${word}' at position ${this.pos}`);
    }
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }
}

export function parseLambda(input: string): ASTNode {
  const parser = new LambdaParser(input);
  return parser.parse();
}
