import type { Readable } from "node:stream";
import { graphemesGenerator } from "@/libs/unicode";

export type Pos = {
  column: number;
  line: number;
};

export type CharGeneratorResult = { char: string; pos: Pos };
export type CharGenerator = AsyncGenerator<CharGeneratorResult, void, unknown>;
export type CharIteratorResult = IteratorResult<CharGeneratorResult, void>;

export const charGenerator = async function* (
  readable: Readable,
): CharGenerator {
  const gen = graphemesGenerator(readable);
  const pos: Pos = {
    line: 1,
    column: 0,
  };

  for await (const c of gen) {
    if (c === "\n") {
      yield {
        char: c,
        pos: {
          line: pos.line++,
          column: pos.column,
        },
      };
      pos.column = 0;
    } else {
      yield {
        char: c,
        pos: {
          line: pos.line,
          column: pos.column++,
        },
      };
    }
  }
};
