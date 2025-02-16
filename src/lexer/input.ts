import fs from "node:fs";
import { Readable } from "node:stream";

export type Input =
  | {
      type: "string";
      content: string;
    }
  | {
      type: "file";
      path: string;
    };

export const toReadable = (input: Input): Readable => {
  switch (input.type) {
    case "string":
      return Readable.from(input.content);
    case "file":
      return fs.createReadStream(input.path);
  }
};
