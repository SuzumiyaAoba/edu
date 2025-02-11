import { print } from "@/utils/io";
import type { Token } from "./token";

export const prittyPrint = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      print(`${token.value} `);
      break;
    case "LEFTARROW":
      print("<- ");
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
      print("/ ");
      break;
    case "STAR":
      print("* ");
      break;
    case "PLUS":
      print("+ ");
      break;
    case "QUESTION":
      print("? ");
      break;
    case "AND":
      print("&");
      break;
    case "NOT":
      print("!");
      break;
    case "Literal":
      print(`${JSON.stringify(token.value)} `);
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
  }
};
