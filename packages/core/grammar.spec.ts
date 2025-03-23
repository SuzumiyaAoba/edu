import { describe, expect, it, jest } from "bun:test";
import {
  andPredicate,
  char,
  characterClass,
  close,
  comment,
  definition,
  dot,
  endOfFile,
  endOfLine,
  expression,
  grammar,
  identifier,
  leftArrow,
  literal,
  notPredicate,
  open,
  plus,
  prefix,
  primary,
  question,
  range,
  semicolon,
  sequence,
  slash,
  space,
  star,
  suffix,
} from "./grammar";

describe("", () => {
  it("", async () => {
    const pegFile = await Bun.file("./samples/peg.peg").text();

    const result = grammar(pegFile, 0);

    console.log(JSON.stringify(result, null, 2));
  });
});
