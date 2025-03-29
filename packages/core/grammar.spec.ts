import { describe, expect, it, jest } from "bun:test";
import { grammar } from "./grammar";

describe("", () => {
  it("", async () => {
    const pegFile = await Bun.file("./samples/peg.peg").text();

    const result = grammar(pegFile, { offset: 0, column: 0, line: 1 });

    console.log(JSON.stringify(result, null, 2));
  });
});
