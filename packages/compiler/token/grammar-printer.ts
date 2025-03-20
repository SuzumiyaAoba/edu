import defu from "defu";
import { escapeString } from "../escape";
import type { Pos } from "../lexer";
import type { Token, TokenWith } from "./grammar";

export const tokenToString = (token: Token): string => {
  switch (token.type) {
    case "Identifier":
      return token.value;
    case "LEFTARROW":
      return "<-";
    case "OPEN":
      return "(";
    case "CLOSE":
      return ")";
    case "CharClass": {
      let buf = "";
      for (const v of token.value) {
        const { type } = v;
        switch (type) {
          case "char":
            buf += escapeString(v.value, true);
            break;
          case "range":
            buf += `${v.value[0]}-${v.value[1]}`;
            break;
          default: {
            const exhaustiveCheck: never = type;
            throw new Error(`Unreachable: ${exhaustiveCheck}`);
          }
        }
      }
      return `[${buf}]`;
    }
    case "SLASH":
      return "/";
    case "DOT":
      return ".";
    case "STAR":
      return "*";
    case "PLUS":
      return "+";
    case "QUESTION":
      return "?";
    case "AND":
      return "&";
    case "NOT":
      return "!";
    case "Literal":
      return `"${escapeString(token.value)}"`;
    case "SEMICOLON":
      return ";";
    case "Comment":
      return `--${token.value}`;
    case "Space":
      return token.value;
    case "EndOfLine":
      return "\n";
    case "EndOfFile":
      return "";
    default: {
      const exhaustiveCheck: never = token;
      throw new Error(`Unreachable: ${exhaustiveCheck}`);
    }
  }
};

const createLineString = (
  tokens: TokenWith<{ pos: Pick<Pos, "column"> }>[],
  callback: (_arg: TokenWith<{ pos: Pick<Pos, "column"> }>) => string,
): string => {
  let buf = "";
  let column = 0;
  for (const { token, meta } of tokens) {
    if (token.type === "EndOfLine") {
    } else if (token.type === "Space") {
      buf += token.value;
    } else {
      buf += " ".repeat(meta.pos.column - column);
      buf += callback({ token, meta });

      column = meta.pos.column;
    }

    column++;
  }

  return buf;
};

export const tokensToString = (
  tokenWiths: TokenWith<{ pos: Pick<Pos, "column"> }>[],
): string => {
  let buf = "";
  for (const { token } of tokenWiths) {
    buf += tokenToString(token);
  }
  return buf;
};

export type PrettyPrintTokensOptions = {
  line?: {
    number?: number | undefined;
    padding?: number;
  };
};

export const prettyPrintTokens = (
  tokenWidths: TokenWith<{ pos: Pick<Pos, "column"> }>[],
  options?: PrettyPrintTokensOptions,
): string => {
  const {
    line: { number, padding },
  } = defu(options, {
    line: {
      number: undefined,
      padding: 3,
    },
  } satisfies PrettyPrintTokensOptions);
  const lineNumPart = number
    ? ` ${number.toString().padStart(padding)} │ `
    : "";
  const offset = number ? `${" ".repeat(lineNumPart.length - 2)}│ ` : "";

  let buf = `${lineNumPart}${tokensToString(tokenWidths)}\n`;
  let tokenNum = 0;
  let lastTokenPos = { column: 0 };

  const points = createLineString(tokenWidths, ({ meta: { pos } }) => {
    tokenNum++;
    lastTokenPos = pos;

    return ".";
  });
  buf += `${offset}${points}\n`;

  for (let i = 0; i < tokenNum; i++) {
    let x = 0;

    const line = createLineString(tokenWidths, ({ token, meta: { pos } }) => {
      x++;

      let buf = "";
      if (x < tokenNum - i) {
        buf += "│";
      } else if (x === tokenNum - i) {
        const horizontal = "─".repeat(lastTokenPos.column - pos.column);
        buf += `└───${horizontal}╼ ${token.type}`;
      }

      return buf;
    });
    buf += `${offset}${line}\n`;
  }
  buf += `${offset}\n`;

  return buf;
};
