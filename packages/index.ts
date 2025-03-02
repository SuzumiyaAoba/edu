import { Lexer } from "@/compiler/lexer";
import type { Pos } from "@/compiler/lexer";
import { Parser } from "@/compiler/parser/parser";
import { prettyPrintTokens } from "@/compiler/token";
import type { Token } from "@/compiler/token";
import { definitionToString } from "@/core/grammar";
import { toReadable } from "./input";
import { acceptedByExpression, toDefinitionMap } from "./core/eval";

const input = {
  type: "file",
  path: "./samples/peg.peg",
} as const;

let lineTokens: { token: Token; meta: { pos: Pos } }[] = [];
let line = 1;

const tokens: { token: Token; meta: { pos: Pos } }[] = [];

const readable = await toReadable(input);

for await (const token of Lexer.from(readable)) {
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

const env = toDefinitionMap(definitions);
const grammar = definitions.find((def) => def.identifier.name === "Grammar");
if (grammar) {
  console.log(acceptedByExpression(env, grammar.identifier, "Grammar <- 'x';"));
}
