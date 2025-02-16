import { print } from "@/utils/io";
import type { Pos } from "./input";
import type { Token, TokenWith } from "./token";

export const prittyPrint = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      print(` ${token.value}`);
      break;
    case "LEFTARROW":
      print(" <-");
      break;
    case "OPEN":
      print(" (");
      break;
    case "CLOSE":
      print(" )");
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
      print(" /");
      break;
    case "DOT":
      print(" .");
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
      print(` ${JSON.stringify(token.value)}`);
      break;
    case "SEMICOLON":
      print(";");
      break;
    case "Comment":
      print(`#${token.value}`);
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

export const pritty = (
  line: string,
  tokens: TokenWith<Token, { pos: Pos }>[],
) => {
  console.log(line);
};
