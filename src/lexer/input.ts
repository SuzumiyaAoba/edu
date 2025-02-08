import fs from "node:fs";
import { Readable } from "node:stream";
import { graphemesGenerator } from "@/libs/unicode";

export type Input =
  | {
      type: "string";
      content: string;
    }
  | {
      type: "file";
      path: string;
    };

export type Pos = {
  column: number;
  line: number;
};

export const toReadable = (input: Input): Readable => {
  switch (input.type) {
    case "string":
      return Readable.from(input.content);
    case "file":
      return fs.createReadStream(input.path);
  }
};

export const charGenerator = async function* (
  readable: Readable,
): AsyncGenerator<{ char: string; pos: Pos }, void, unknown> {
  const gen = graphemesGenerator(readable);
  const pos: Pos = {
    line: 1,
    column: 0,
  };

  for await (const c of gen) {
    if (c === "\n") {
      pos.column = 0;
      yield {
        char: c,
        pos: {
          line: pos.line++,
          column: 0,
        },
      };
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
