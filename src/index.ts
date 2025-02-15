import { parse } from "./lexer";
import { prittyPrint } from "./lexer/printer";

const input = {
  type: "file",
  path: "./samples/peg.peg",
} as const;

for await (const token of parse(input)) {
  prittyPrint(token.token);
}
