import type { Token, TokenType, TokenWith } from "@/lexer/token";
import { isNonEmptyArray, isSingleElementArray } from "@/utils/array";
import type { CharacterClassValue, Definition, Expression } from "./grammar";
import * as g from "./grammar";

export const parse = (tokens: Token[], start = 0) => {};

const expectToken = <Meta, T extends TokenType>(
  tokenWith: TokenWith<Meta> | undefined,
  expect: T,
): TokenWith<Meta, Token & { type: T }> => {
  if (tokenWith === undefined) {
    throw new Error("Unexpected EOF");
  }

  const { token } = tokenWith;
  if (token.type !== expect) {
    throw new Error(`Unexpected token, got ${token.type}`);
  }

  return tokenWith as TokenWith<Meta, Token & { type: T }>;
};

const parseDefeinition = <Meta>(
  tokenWiths: TokenWith<Meta>[],
  start = 0,
): {
  definition: Definition<Meta>;
  cursor: number;
} => {
  let cursor = start;
  const identifier = expectToken<Meta, "Identifier">(
    tokenWiths[cursor++],
    "Identifier",
  );

  expectToken(tokenWiths[cursor++], "LEFTARROW");

  const { expression, cursor: nextCursor } = parseExpression<Meta>(
    tokenWiths,
    cursor,
  );

  expectToken(tokenWiths[nextCursor], "SEMICOLON");

  return {
    definition: g.definition<Meta>(
      g.identifier<Meta>(identifier.token.value),
      expression,
    ),
    cursor: nextCursor + 1,
  };
};

export const parseExpression = <Meta>(
  tokens: TokenWith<Meta>[],
  cursor = 0,
  acc: Expression<Meta>[] = [],
): {
  expression: Expression<Meta>;
  cursor: number;
} => {
  const tokenWith = tokens?.[cursor];
  if (tokenWith === undefined) {
    throw new Error(`Unexpected EOF at ${cursor}`);
  }

  const { token, meta } = tokenWith;
  switch (token.type) {
    case "Identifier":
      acc.push(g.id(token.value, meta));

      return parseExpression(tokens, cursor + 1, acc);
    case "Literal":
      acc.push(g.lit(token.value, meta));

      return parseExpression(tokens, cursor + 1, acc);
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

      acc.push(g.charClass(charClassValues, meta));

      return parseExpression(tokens, cursor + 1, acc);
    }
    case "Range":
      throw new Error("Not implemented");
    case "LEFTARROW":
      throw new Error("Unexpected LEFTARROW");
    case "SLASH": {
      const { expression, cursor: nextCursor } = parseExpression<Meta>(
        tokens,
        cursor + 1,
        [],
      );

      if (!isNonEmptyArray(acc)) {
        throw new Error("Unexpected SLASH");
      }

      const choice = g.choice<Meta>(
        isSingleElementArray(acc) ? acc[0] : g.seq<Meta>(acc),
        expression,
      );

      if (nextCursor === tokens.length) {
        return { expression: choice, cursor: nextCursor };
      }

      return parseExpression(tokens, nextCursor, [choice]);
    }
    case "AND": {
      const { expression, cursor: nextCursor } = parseExpression<Meta>(
        tokens,
        cursor + 1,
        [],
      );

      const and = g.and<Meta>(expression);

      if (nextCursor === tokens.length) {
        return { expression: and, cursor: nextCursor };
      }

      return parseExpression(tokens, nextCursor, [and]);
    }
    case "NOT": {
      const { expression, cursor: nextCursor } = parseExpression<Meta>(
        tokens,
        cursor + 1,
        [],
      );

      const not = g.not<Meta>(expression);

      if (nextCursor === tokens.length) {
        return { expression: not, cursor: nextCursor };
      }

      return parseExpression(tokens, nextCursor, [not]);
    }
    case "QUESTION":
      if (!isNonEmptyArray(acc)) {
        throw new Error("Unexpected QUESTION");
      }

      return parseExpression(tokens, cursor + 1, [
        g.opt<Meta>(
          isSingleElementArray(acc) ? acc[0] : g.seq(acc),
          acc[0].meta,
        ),
      ]);
    case "STAR":
      if (!isNonEmptyArray(acc)) {
        throw new Error("Unexpected QUESTION");
      }

      return parseExpression(tokens, cursor + 1, [
        g.star<Meta>(
          isSingleElementArray(acc) ? acc[0] : g.seq(acc),
          acc[0].meta,
        ),
      ]);
    case "PLUS":
      if (!isNonEmptyArray(acc)) {
        throw new Error("Unexpected QUESTION");
      }

      return parseExpression(tokens, cursor + 1, [
        g.plus<Meta>(
          isSingleElementArray(acc) ? acc[0] : g.seq(acc),
          acc[0].meta,
        ),
      ]);
    case "OPEN": {
      const { expression, cursor: nextCursor } = parseExpression<Meta>(
        tokens,
        cursor + 1,
        [],
      );

      acc.push(expression);

      return parseExpression(tokens, nextCursor, acc);
    }
    case "CLOSE":
      if (!isNonEmptyArray(acc)) {
        throw new Error("Unexpected CLOSE");
      }

      return {
        expression: isSingleElementArray(acc)
          ? acc[0]
          : g.seq<Meta>(acc, acc[0].meta),
        cursor: cursor + 1,
      };
    case "DOT":
      acc.push(g.any(meta));

      return parseExpression(tokens, cursor + 1, acc);
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
      return parseExpression<Meta>(tokens, cursor + 1, acc);
    default: {
      const _exhaustiveCheck: never = token;
      throw new Error(`Unexpected token: ${_exhaustiveCheck}`);
    }
  }
};
