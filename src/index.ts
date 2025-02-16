import { Lexer } from "./lexer";
import type { Pos } from "./lexer/input";
import { debugPrinter, pritty, prittyPrint } from "./lexer/printer";
import type { Token } from "./lexer/token";

const input = {
  type: "file",
  path: "./samples/peg.peg",
} as const;

let line: { token: Token; pos: Pos }[] = [];

for await (const token of new Lexer(input)) {
  // prittyPrint(token.token);
  // debugPrinter(token);
  if (token.token.type === "EndOfLine") {
    console.log("======");
    console.log(line);
    console.log("======");

    line = [];
  } else {
    line.push(token);
  }
}
