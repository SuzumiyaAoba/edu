import { Lexer } from "@/compiler/lexer/grammar";
import type { Pos } from "@/compiler/lexer/grammar";
import { Parser } from "@/compiler/parser/parser";
import type { Token } from "@/compiler/token/grammar";
import { definitionToString } from "@/core/printer";
import { prettyPrintTokens } from "./compiler/token/grammar-printer";
import { accept } from "./core/eval";
import { print } from "./core/utils/io";
import { toReadable } from "./input";

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
    print(
      prettyPrintTokens(lineTokens, {
        line: { number: line++ },
      }),
    );

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

const pegSyntax = await Bun.file("./samples/peg.peg").text();
console.log(accept(definitions)(pegSyntax));

console.log(accept(definitions)("x <- 'y';"));
