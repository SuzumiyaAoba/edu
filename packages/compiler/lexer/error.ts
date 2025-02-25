import type { Pos } from "./index";
import type { TokenType } from "./token";

export class PegSyntaxError extends Error {
  readonly expected: TokenType[];
  readonly pos: Pos;

  constructor(message: string, expected: TokenType[], pos: Pos) {
    super(message);

    this.expected = expected;
    this.pos = pos;
  }
}
