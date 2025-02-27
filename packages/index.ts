import { Lexer } from "@/compiler/lexer";
import type { Pos } from "@/compiler/lexer";
import { toReadable } from "@/compiler/lexer/input";
import { prettyPrintTokens } from "@/compiler/token";
import type { Token } from "@/compiler/token";
import { Parser } from "@/compiler/parser/parser";
import { definitionToString } from "@/core/grammar";

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
