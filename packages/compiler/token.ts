import { escapeString } from "@/compiler/escape";
import { print } from "@/core/utils/io";
import { logger } from "@/core/utils/logger";
import type { Pos } from "@/libs/char-async-generator";
import type { RecursiveRequired } from "@/libs/std/types";
import defu from "defu";

export type TokenType = Token["type"];

export type Token =
  | Identifier
  | Literal
  | CharClass
  | LeftArrow
  | Slash
  | And
  | Not
  | Question
  | Star
  | Plus
  | Open
  | Close
  | Dot
  | Semicolon
  | Comment
  | Space
  | EndOfLine
  | EndOfFile;

export type Identifier = {
  type: "Identifier";
  value: string;
};

export type Literal = {
  type: "Literal";
  value: string;
};

export type CharClass = {
  type: "CharClass";
  value: readonly CharClassElement[];
};

export type CharClassElement =
  | {
      type: "char";
      value: string;
    }
  | {
      type: "range";
      value: [string, string];
    };

export type LeftArrow = {
  type: "LEFTARROW";
  value: "<-";
};

export type Slash = {
  type: "SLASH";
  value: "/";
};

export type And = {
  type: "AND";
  value: "&";
};

export type Not = {
  type: "NOT";
  value: "!";
};

export type Question = {
  type: "QUESTION";
  value: "?";
};

export type Star = {
  type: "STAR";
  value: "*";
};

export type Plus = {
  type: "PLUS";
  value: "+";
};

export type Open = {
  type: "OPEN";
  value: "(";
};

export type Close = {
  type: "CLOSE";
  value: ")";
};

export type Dot = {
  type: "DOT";
  value: ".";
};

export type Semicolon = {
  type: "SEMICOLON";
  value: ";";
};

export type Comment = {
  type: "Comment";
  value: string;
};

export type Space = {
  type: "Space";
  value: string;
};

export type EndOfLine = {
  type: "EndOfLine";
  value: string;
};

export type EndOfFile = {
  type: "EndOfFile";
  value: "\0";
};

export type TokenWith<META, TOKEN extends Token = Token> = {
  token: TOKEN;
  meta: META;
};

export class Tokens<META> {
  identifier = (value: string, meta: META): TokenWith<META, Identifier> =>
    ({
      token: {
        type: "Identifier",
        value,
      },
      meta,
    }) as const;

  leftArrow = (meta: META): TokenWith<META, LeftArrow> =>
    ({
      token: {
        type: "LEFTARROW",
        value: "<-",
      },
      meta,
    }) as const;

  open = (meta: META): TokenWith<META, Open> =>
    ({
      token: {
        type: "OPEN",
        value: "(",
      },
      meta,
    }) as const;

  close = (meta: META): TokenWith<META, Close> =>
    ({
      token: {
        type: "CLOSE",
        value: ")",
      },
      meta,
    }) as const;

  charClass = (
    value: CharClassElement[],
    meta: META,
  ): TokenWith<META, CharClass> =>
    ({
      token: {
        type: "CharClass",
        value,
      },
      meta,
    }) as const;

  char = (value: string): CharClassElement =>
    ({
      type: "char",
      value,
    }) as const;

  range = (value: [string, string]): CharClassElement =>
    ({
      type: "range",
      value,
    }) as const;

  slash = (meta: META): TokenWith<META, Slash> =>
    ({
      token: {
        type: "SLASH",
        value: "/",
      },
      meta,
    }) as const;

  dot = (meta: META): TokenWith<META, Dot> =>
    ({
      token: {
        type: "DOT",
        value: ".",
      },
      meta,
    }) as const;

  star = (meta: META): TokenWith<META, Star> =>
    ({
      token: {
        type: "STAR",
        value: "*",
      },
      meta,
    }) as const;

  plus = (meta: META): TokenWith<META, Plus> =>
    ({
      token: {
        type: "PLUS",
        value: "+",
      },
      meta,
    }) as const;

  question = (meta: META): TokenWith<META, Question> =>
    ({
      token: {
        type: "QUESTION",
        value: "?",
      },
      meta,
    }) as const;

  and = (meta: META): TokenWith<META, And> =>
    ({
      token: {
        type: "AND",
        value: "&",
      },
      meta,
    }) as const;

  not = (meta: META): TokenWith<META, Not> =>
    ({
      token: {
        type: "NOT",
        value: "!",
      },
      meta,
    }) as const;

  literal = (value: string, meta: META): TokenWith<META, Literal> =>
    ({
      token: {
        type: "Literal",
        value,
      },
      meta,
    }) as const;

  semicolon = (meta: META): TokenWith<META, Semicolon> =>
    ({
      token: {
        type: "SEMICOLON",
        value: ";",
      },
      meta,
    }) as const;

  comment = (value: string, meta: META): TokenWith<META, Comment> =>
    ({
      token: {
        type: "Comment",
        value,
      },
      meta,
    }) as const;

  space = (value: string, meta: META): TokenWith<META, Space> =>
    ({
      token: {
        type: "Space",
        value,
      },
      meta,
    }) as const;

  endOfLine = (value: string, meta: META): TokenWith<META, EndOfLine> =>
    ({
      token: {
        type: "EndOfLine",
        value: value,
      },
      meta,
    }) as const;

  endOfFile = (meta: META): TokenWith<META, EndOfFile> =>
    ({
      token: {
        type: "EndOfFile",
        value: "\0",
      },
      meta,
    }) as const;
}

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
      buf += "[";
      for (const v of token.value) {
        if (v.type === "char") {
          buf += escapeString(v.value, true);
        } else {
          buf += `${v.value[0]}-${v.value[1]}`;
        }
      }
      buf += "]";
      return buf;
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
      return `#${token.value}`;
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

const lineToString = (
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

const defaultPrettyPrintTokensOptions: RecursiveRequired<PrettyPrintTokensOptions> =
  {
    line: {
      number: undefined,
      padding: 3,
    },
  } as const;

export const prettyPrintTokens = (
  tokenWidths: TokenWith<{ pos: Pick<Pos, "column"> }>[],
  options?: PrettyPrintTokensOptions,
): string => {
  const {
    line: { number, padding },
  } = defu(options, defaultPrettyPrintTokensOptions);
  const linePart = number
    ? ` ${number.toString().padStart(padding)} │ `
    : "";
  const offset = number ? `${" ".repeat(linePart.length - 2)}│ ` : "";

  let buf = `${linePart}${tokensToString(tokenWidths)}\n`;
  let tokenNum = 0;
  let lastTokenPos = { column: 0 };

  const points = lineToString(tokenWidths, ({ meta: { pos } }) => {
    tokenNum++;
    lastTokenPos = pos;

    return ".";
  });
  buf += `${offset}${points}\n`;

  for (let i = 0; i < tokenNum; i++) {
    let x = 0;

    const line = lineToString(tokenWidths, ({ token, meta: { pos } }) => {
      x++;

      let buf = "";
      if (x < tokenNum - i) {
        buf += "│";
      } else if (x === tokenNum - i) {
        const line = "─".repeat(lastTokenPos.column - pos.column);
        buf += `└───${line}╼ ${token.type}`;
      }

      return buf;
    });
    buf += `${offset}${line}\n`;
  }
  buf += `${offset}\n`;

  return buf;
};
