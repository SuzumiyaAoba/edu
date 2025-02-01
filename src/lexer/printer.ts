import type { Token } from "./token";

export const prittyPrint = (token: Token) => {
  switch (token.type) {
    case "Identifier":
      process.stdout.write(token.value);
      break;
    case "LeftArrow":
      process.stdout.write("<-");
      break;
    case "LeftBracket":
      process.stdout.write("(");
      break;
    case "RightBracket":
      process.stdout.write(")");
      break;
    case "CharClass":
      process.stdout.write(`[${token.value}]`);
      break;
    case "Choice":
      process.stdout.write("/");
      break;
    case "KleeneStar":
      process.stdout.write("*");
      break;
    case "OneOrMore":
      process.stdout.write("+");
      break;
    case "Optional":
      process.stdout.write("?");
      break;
    case "PositiveLookahead":
      process.stdout.write("&");
      break;
    case "NegativeLookahead":
      process.stdout.write("!");
      break;
    case "Literal":
      process.stdout.write(`"${token.value}"`);
      break;
    case "Semicolon":
      process.stdout.write(";");
      break;
    case "Comment":
      process.stdout.write(`-- ${token.value}`);
      break;
    case "EOL":
      process.stdout.write("\n");
      break;
    case "EOF":
      break;
  }
};
