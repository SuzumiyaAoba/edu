import { Readable } from "node:stream";
import type { PrivateConstructorParameters } from "@/libs/types";
import { graphemesGenerator } from "@/libs/unicode";

export type Pos = {
  column: number;
  line: number;
};

export type CharGeneratorResult = { char: string; pos: Pos };
export type CharGenerator = AsyncGenerator<CharGeneratorResult, void, unknown>;
export type CharIteratorResult = ReturnType<CharAsyncGenerator["next"]>;

export class CharAsyncGenerator
  implements AsyncGenerator<CharGeneratorResult, void, unknown>
{
  #generator: ReturnType<typeof graphemesGenerator>;

  #pos: Pos = {
    column: 0,
    line: 1,
  };

  private constructor(source: Readable | string) {
    if (typeof source === "string") {
      const readable = Readable.from(source);
      this.#generator = graphemesGenerator(readable);
    } else {
      this.#generator = graphemesGenerator(source);
    }
  }

  static from(
    ...args: PrivateConstructorParameters<typeof CharAsyncGenerator>
  ) {
    return new CharAsyncGenerator(...args);
  }

  async next(
    ...[_value]: [] | [unknown]
  ): Promise<IteratorResult<CharGeneratorResult, void>> {
    const char = await this.#generator.next();
    if (char.done) {
      return { done: true, value: undefined };
    }

    if (char.value === "\n") {
      this.#pos.line++;
      this.#pos.column = 0;
    } else {
      this.#pos.column++;
    }

    return {
      done: false,
      value: {
        char: char.value,
        pos: {
          line: this.#pos.line,
          column: this.#pos.column,
        },
      },
    };
  }

  return(
    _value: void | PromiseLike<void>,
  ): Promise<IteratorResult<CharGeneratorResult, void>> {
    throw new Error("Method not implemented.");
  }

  throw(_e: unknown): Promise<IteratorResult<CharGeneratorResult, void>> {
    throw new Error("Method not implemented.");
  }

  [Symbol.asyncIterator](): AsyncGenerator<CharGeneratorResult, void, unknown> {
    return this;
  }

  [Symbol.asyncDispose](): PromiseLike<void> {
    throw new Error("Method not implemented.");
  }
}
