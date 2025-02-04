import { print } from "@/utils/io";
import type { Token } from "./token";

export const prittyPrint = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      print(token.value);
      break;
    case "LeftArrow":
      print("<-");
      break;
    case "LeftBracket":
      print("(");
      break;
    case "RightBracket":
      print(")");
      break;
    case "CharClass":
      print(`[${token.value}]`);
      break;
    case "Choice":
      print("/");
      break;
    case "KleeneStar":
      print("*");
      break;
    case "OneOrMore":
      print("+");
      break;
    case "Optional":
      print("?");
      break;
    case "PositiveLookahead":
      print("&");
      break;
    case "NegativeLookahead":
      print("!");
      break;
    case "Literal":
      print(`"${token.value}"`);
      break;
    case "Semicolon":
      print(";");
      break;
    case "Comment":
      print(`# ${token.value}`);
      break;
    case "EOL":
      print("\n");
      break;
    case "EOF":
      break;
  }
};
