import { print } from "@/utils/io";
import type { Token } from "./token";

export const prittyPrint = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      print(token.value);
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
      print(`[${token.value}]`);
      break;
    case "SLASH":
      print("/");
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
      print(`"${token.value}"`);
      break;
    case "SEMICOLON":
      print(";");
      break;
    case "Comment":
      print(`# ${token.value}`);
      break;
    case "EndOfLine":
      print("\n");
      break;
    case "EndOfFile":
      break;
  }
};
