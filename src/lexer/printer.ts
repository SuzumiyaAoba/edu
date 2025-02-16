import { print } from "@/utils/io";
import type { Pos } from "./index";
import type { Token, TokenWith } from "./token";

export const prittyPrint = (token: Token) => {
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
        if (typeof v === "string") {
          print(v);
        } else {
          prittyPrint(v);
        }
      }
      print("]");
      break;
    case "Range":
      print(`${token.value[0]}-${token.value[1]}`);
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
      print(`${JSON.stringify(token.value)}`);
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
      const _exhaustiveCheck: never = token;
      throw new Error(`Unreachable: ${_exhaustiveCheck}`);
    }
  }
};

export const debugPrinter = ({
  token,
  pos,
}: TokenWith<Token, { pos: Pos }>) => {
  const loc = `${pos.line}:${pos.column}`;
  switch (token.type) {
    case "Identifier":
    case "Comment":
      console.log(`[${loc}] ${token.type}: ${token.value}`);
      break;
    case "Space":
    case "Literal":
      console.log(`[${loc}] ${token.type}: ${JSON.stringify(token.value)}`);
      break;
    case "CharClass": {
      let value = "";
      for (const v of token.value) {
        if (typeof v === "string") {
          value += v;
        } else {
          value += `${v.value[0]}-${v.value[1]}`;
        }
      }
      console.log(`[${loc}] ${token.type}: ${value}`);
      break;
    }
    case "Range":
      break;
    case "LEFTARROW":
    case "OPEN":
    case "CLOSE":
    case "SLASH":
    case "DOT":
    case "STAR":
    case "PLUS":
    case "QUESTION":
    case "AND":
    case "NOT":
    case "SEMICOLON":
    case "EndOfLine":
    case "EndOfFile":
      console.log(`[${loc}] ${token.type}`);
      break;
    default: {
      const _exhaustiveCheck: never = token;
      throw new Error(`Unreachable: ${_exhaustiveCheck}`);
    }
  }
};

export const pritty = (tokens: TokenWith<Token, { pos: Pos }>[]) => {
  for (const { token } of tokens) {
    prittyPrint(token);
  }
  print("\n");

  let column = 0;
  let tokenNum = 0;
  let lastTokenPos: Pos = { line: 0, column: 0 };
  for (const { token, pos } of tokens) {
    if (token.type === "Comment" || token.type === "EndOfLine") {
      break;
    }

    if (token.type === "Space") {
      print(token.value);
      column++;
      continue;
    }

    while (++column < pos.column) {
      print(" ");
    }

    print(".");

    tokenNum++;
    lastTokenPos = pos;
  }
  print("\n");

  for (let i = 0; i < tokenNum; i++) {
    let j = 0;

    let column = 0;
    for (const { token, pos } of tokens) {
      if (token.type === "Comment" || token.type === "EndOfLine") {
        break;
      }

      if (token.type === "Space") {
        print(token.value);
        column++;
        continue;
      }

      while (++column < pos.column) {
        print(" ");
      }

      j++;

      if (j < tokenNum - i) {
        print("│");
      } else if (j === tokenNum - i) {
        print("└──");
        for (let k = pos.column; k < lastTokenPos.column; k++) {
          print("─");
        }

        print(" ");
        print(token.type);
      }
    }
    print("\n");
  }

  print("\n");
};
