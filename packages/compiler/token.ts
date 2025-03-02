import { escapeString } from "@/compiler/escape";
import { print } from "@/core/utils/io";
import type { Pos } from "@/libs/char-async-generator";

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

export const printToken = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      print(`${token.value}`);
      break;
    case "LEFTARROW":
      print("<-");
      break;
    case "OPEN":
      print("(");
      break;
    case "CLOSE":
      print(")");
      break;
    case "CharClass":
      print("[");
      for (const v of token.value) {
        if (v.type === "char") {
          print(escapeString(v.value, true));
        } else {
          print(`${v.value[0]}-${v.value[1]}`);
        }
      }
      print("]");
      break;
    case "SLASH":
      print("/");
      break;
    case "DOT":
      print(".");
      break;
    case "STAR":
      print("*");
      break;
    case "PLUS":
      print("+");
      break;
    case "QUESTION":
      print("?");
      break;
    case "AND":
      print("&");
      break;
    case "NOT":
      print("!");
      break;
    case "Literal":
      print(`"${escapeString(token.value)}"`);
      break;
    case "SEMICOLON":
      print(";");
      break;
    case "Comment":
      print(`#${token.value}`);
      break;
    case "Space":
      print(token.value);
      break;
    case "EndOfLine":
      print("\n");
      break;
    case "EndOfFile":
      break;
    default: {
      const exhaustiveCheck: never = token;
      throw new Error(`Unreachable: ${exhaustiveCheck}`);
    }
  }
};

const printLine = (
  tokens: TokenWith<{ pos: Pick<Pos, "column"> }>[],
  callback: (_arg: TokenWith<{ pos: Pick<Pos, "column"> }>) => void,
) => {
  let column = 0;
  for (const {
    token,
    meta: { pos },
  } of tokens) {
    if (token.type === "EndOfLine") {
      break;
    }

    if (token.type === "Space") {
      print(token.value);
      column++;
      continue;
    }

    while (column++ < pos.column) {
      print(" ");
    }

    callback({ token, meta: { pos } });
  }
};

export const prettyPrintTokens = (
  tokens: TokenWith<{ pos: Pick<Pos, "column"> }>[],
  line?: number,
  linePadStart = 0,
) => {
  const linePart = line ? ` ${line.toString().padStart(linePadStart)} │ ` : "";
  const offset = line ? `${" ".repeat(linePart.length - 2)}│ ` : "";

  print(linePart);
  for (const { token } of tokens) {
    printToken(token);
  }
  print("\n");

  let tokenNum = 0;
  let lastTokenPos: Pick<Pos, "column"> = { column: 0 };

  print(offset);
  printLine(tokens, ({ meta: { pos } }) => {
    print(".");

    tokenNum++;
    lastTokenPos = pos;
  });
  print("\n");

  for (let i = 0; i < tokenNum; i++) {
    let j = 0;

    print(offset);
    printLine(tokens, ({ token, meta: { pos } }) => {
      j++;

      if (j < tokenNum - i) {
        print("│");
      } else if (j === tokenNum - i) {
        print("└───");
        for (let k = pos.column; k < lastTokenPos.column; k++) {
          print("─");
        }

        print(" ");
        print(token.type);
      }
    });
    print("\n");
  }
  print(offset);
  print("\n");
};
