import type { Pos } from "@/compiler/lexer/grammar";
import type { TokenType } from "@/compiler/token/grammar";

export class PegSyntaxError extends Error {
  readonly expected: TokenType[];
  readonly pos: Pos;

  constructor(message: string, expected: TokenType[], pos: Pos) {
    super(message);

    this.expected = expected;
    this.pos = pos;
  }
}
