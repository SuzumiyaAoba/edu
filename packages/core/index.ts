import { Lexer } from "./lexer";
import type { Pos } from "./lexer";
import { toReadable } from "./lexer/input";
import { prettyPrintTokens } from "./lexer/printer";
import type { Token } from "./lexer/token";
import { Parser } from "./parser/parser";
import { definitionToString } from "./peg/grammar";

const input = {
  type: "file",
  path: "./samples/peg.peg",
} as const;

let lineTokens: { token: Token; meta: { pos: Pos } }[] = [];
let line = 1;

const tokens: { token: Token; meta: { pos: Pos } }[] = [];

const readable = await toReadable(input);

for await (const token of new Lexer(readable)) {
  tokens.push(token);
  if (token.token.type === "EndOfLine") {
    prettyPrintTokens(lineTokens, line++, 3);

    lineTokens = [];
  } else {
    lineTokens.push(token);
  }
}

const parser = new Parser();
const definitions = parser.parse(tokens);

for (const def of definitions) {
  console.log(definitionToString(def));
}
