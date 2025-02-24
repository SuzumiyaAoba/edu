import type { Token, TokenType, TokenWith } from "@/lexer/token";
import type {
  CharacterClassValue,
  Definition,
  Expression,
  Grammar,
} from "@/peg/grammar";
import { PegGrammar } from "@/peg/grammar";
import { isNonEmptyArray, isSingleElementArray } from "@/utils/array";
import * as array from "@/utils/array";

const expectToken = <Meta, T extends TokenType>(
  tokenWith: TokenWith<Meta> | undefined,
  expect: T,
): TokenWith<Meta, Token & { type: T }> => {
  if (tokenWith === undefined) {
    throw new Error("Unexpected EOF");
  }

  const { token } = tokenWith;
  if (token.type !== expect) {
    throw new Error(
      `Unexpected token: expected = ${expect}, actual = ${JSON.stringify(tokenWith)}`,
    );
  }

  return tokenWith as TokenWith<Meta, Token & { type: T }>;
};

export class Parser<Meta> {
  #grammar = new PegGrammar<Meta>();

  parse(tokenWiths: TokenWith<Meta>[]) {
    const definitions: Grammar<Meta> = [];

    let cursor = 0;
    while (cursor < tokenWiths.length) {
      while (cursor < tokenWiths.length) {
        const tokenWith = tokenWiths[cursor];
        if (!tokenWith) {
          throw new Error();
        }

        const { token } = tokenWith;
        const { type } = token;
        if (type === "Space" || type === "Comment" || type === "EndOfLine") {
          cursor++;
        } else if (type === "EndOfFile") {
          return definitions;
        } else {
          break;
        }
      }

      const { definition, cursor: nextCursor } = this.parseDefeinition(
        tokenWiths,
        cursor,
      );
      cursor = nextCursor;
      definitions.push(definition);
    }

    return definitions;
  }

  parseDefeinition(
    tokenWiths: TokenWith<Meta>[],
    start = 0,
  ): {
    definition: Definition<Meta>;
    cursor: number;
  } {
    const g = this.#grammar;

    let cursor = this.#consumeSpace(tokenWiths, start);
    const identifier = expectToken<Meta, "Identifier">(
      tokenWiths[cursor++],
      "Identifier",
    );

    cursor = this.#consumeSpace(tokenWiths, cursor);

    expectToken(tokenWiths[cursor++], "LEFTARROW");

    cursor = this.#consumeSpace(tokenWiths, cursor);

    const { expression, cursor: nextCursor } = this.parseExpression(
      tokenWiths,
      cursor,
    );

    cursor = nextCursor;
    cursor = this.#consumeSpace(tokenWiths, cursor);

    return {
      definition: g.definition(
        g.identifier(identifier.token.value),
        expression,
      ),
      cursor: cursor,
    };
  }

  parseExpression(
    tokens: TokenWith<Meta>[],
    cursor = 0,
    acc: Expression<Meta>[] = [],
    wrap: (expr: Expression<Meta>) => Expression<Meta> = (expr) => expr,
  ): {
    expression: Expression<Meta>;
    cursor: number;
  } {
    const g = this.#grammar;

    const tokenWith = tokens?.[cursor];
    if (tokenWith === undefined) {
      throw new Error(`Unexpected EOF at ${cursor}`);
    }

    const { token, meta } = tokenWith;
    switch (token.type) {
      case "Identifier":
        acc.push(wrap(g.id(token.value, meta)));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "Literal":
        acc.push(wrap(g.lit(token.value, meta)));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "CharClass": {
        const charClass = token.value;
        const charClassValues: CharacterClassValue[] = [];
        for (const value of charClass) {
          if (typeof value === "string") {
            charClassValues.push(g.char(value));
          } else {
            const [start, stop] = value.value;
            charClassValues.push(g.range(start, stop));
          }
        }

        acc.push(wrap(g.charClass(charClassValues, meta)));

        return this.parseExpression(tokens, cursor + 1, acc);
      }
      case "Range":
        throw new Error("Not implemented");
      case "LEFTARROW":
        throw new Error(`Unexpected LEFTARROW: ${JSON.stringify(meta)}`);
      case "SLASH": {
        const { expression, cursor: nextCursor } = this.parseExpression(
          tokens,
          cursor + 1,
          [],
        );

        if (!isNonEmptyArray(acc)) {
          throw new Error("Unexpected SLASH");
        }

        const choice = g.choice(
          isSingleElementArray(acc) ? acc[0] : g.seq(acc),
          expression,
        );

        if (nextCursor === tokens.length) {
          return { expression: choice, cursor: nextCursor };
        }

        return this.parseExpression(tokens, nextCursor - 1, [choice]);
      }
      case "AND": {
        return this.parseExpression(tokens, cursor + 1, [], (expr) =>
          g.and(expr, meta),
        );
      }
      case "NOT": {
        return this.parseExpression(tokens, cursor + 1, [], (expr) =>
          g.not(expr, meta),
        );
      }
      case "QUESTION":
        if (!isNonEmptyArray(acc)) {
          throw new Error("Unexpected QUESTION");
        }

        array.replaceLast(acc, (last) => g.opt(last, meta));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "STAR":
        if (!isNonEmptyArray(acc)) {
          throw new Error(`Unexpected STAR: ${JSON.stringify(meta)}`);
        }

        array.replaceLast(acc, (last) => g.star(last, meta));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "PLUS":
        if (!isNonEmptyArray(acc)) {
          throw new Error("Unexpected PLUS");
        }

        array.replaceLast(acc, (last) => g.plus(last, meta));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "OPEN": {
        const { expression, cursor: nextCursor } = this.parseExpression(
          tokens,
          cursor + 1,
          [],
        );

        acc.push(expression);

        return this.parseExpression(tokens, nextCursor, acc);
      }
      case "CLOSE":
        if (!isNonEmptyArray(acc)) {
          throw new Error("Unexpected CLOSE");
        }

        return {
          expression: isSingleElementArray(acc)
            ? acc[0]
            : g.seq(acc, acc[0].meta),
          cursor: cursor + 1,
        };
      case "DOT":
        acc.push(g.any(meta));

        return this.parseExpression(tokens, cursor + 1, acc);
      case "SEMICOLON":
        if (!isNonEmptyArray(acc)) {
          throw new Error("Unexpected SEMICOLON");
        }

        return {
          expression: isSingleElementArray(acc)
            ? acc[0]
            : g.seq(acc, acc[0].meta),
          cursor: cursor + 1,
        };
      case "Comment":
      case "Space":
      case "EndOfLine":
      case "EndOfFile":
        return this.parseExpression(tokens, cursor + 1, acc);
      default: {
        const _exhaustiveCheck: never = token;
        throw new Error(`Unexpected token: ${_exhaustiveCheck}`);
      }
    }
  }

  #consumeSpace(tokenWiths: TokenWith<Meta>[], start = 0) {
    let cursor = start;
    while (
      tokenWiths[cursor]?.token.type === "Space" ||
      tokenWiths[cursor]?.token.type === "EndOfLine"
    ) {
      cursor++;
    }

    return cursor;
  }
}
