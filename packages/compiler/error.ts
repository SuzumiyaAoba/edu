import type { CharWithPos, Pos } from "@/compiler/lexer/grammar";
import type { TokenType } from "@/compiler/token/grammar";
import type { CharIteratorResult } from "@/libs/char-async-generator";

export class PegSyntaxError extends Error {
  readonly expected: TokenType[];
  readonly pos: Pos;

  constructor(message: string, expected: TokenType[], pos: Pos) {
    super(message);

    this.expected = expected;
    this.pos = pos;
  }
}

export class UnexpectedEofError extends Error {}

export class UnexpectedCharError extends Error {
  constructor({ expected, actual }: { expected: string; actual: CharWithPos }) {
    super(
      `Unexpected charactor: '${expected}' is expected, but acutal is '${actual.char}'`,
    );
  }
}
