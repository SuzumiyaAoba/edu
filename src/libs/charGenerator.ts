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

export const bufferableAsyncIterator = <T, TReturn = unknown, TNext = unknown>(
  gen: AsyncGenerator<T, TReturn, TNext>,
  bufferSize = 1024,
) => {
  let buffer: IteratorResult<T, TReturn>[] = Array(bufferSize);
  let left = 0;
  let right = 0;

  return {
    async *[Symbol.asyncIterator]() {
      while (true) {
        if (left < right) {
          yield buffer[left++];
          continue;
        }

        const result = await gen.next();
        if (result.done) {
          return result;
        }

        yield result;
      }
    },
    peek: async () => {
      const result = await gen.next();
      if (right >= bufferSize) {
        const size = right - left;

        const src = buffer;
        const dst: IteratorResult<T, TReturn>[] =
          left > bufferSize / 2 ? buffer : Array(bufferSize * 2);

        for (let i = 0; i < size; i++) {
          const value = src[left + i];
          if (value) {
            dst[i] = value;
          }
        }

        buffer = dst;
        left = 0;
        right = size;
      }

      buffer[right++] = result;

      return result;
    },
    prev: (): IteratorResult<T, TReturn> | undefined => {
      return buffer[right - 1];
    },
    reset: (): void => {
      left = 0;
      right = 0;
    },
    bufferSize: () => buffer.length,
  };
};
