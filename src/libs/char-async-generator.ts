import { Readable } from "node:stream";
import { debuglog } from "node:util";
import type { PrivateConstructorParameters } from "@/libs/types";
import { graphemesGenerator } from "@/libs/unicode";

const debug = debuglog("char-async-generator");

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

  #line: number;
  #column: number;

  private constructor(source: Readable | string) {
    if (typeof source === "string") {
      const readable = Readable.from(source);
      this.#generator = graphemesGenerator(readable);
    } else {
      this.#generator = graphemesGenerator(source);
    }

    this.#line = 1;
    this.#column = 0;
  }

  static from(
    ...args: PrivateConstructorParameters<typeof CharAsyncGenerator>
  ) {
    return new CharAsyncGenerator(...args);
  }

  async next(
    ...[_value]: [] | [unknown]
  ): Promise<IteratorResult<CharGeneratorResult, void>> {
    debug("[next]");
    debug(`line  : ${this.#line}`);
    debug(`column: ${this.#column}`);

    const char = await this.#generator.next();
    if (char.done) {
      return { done: true, value: undefined };
    }

    if (char.value === "\n") {
      this.#line++;
      this.#column = 0;
    } else {
      this.#column++;
    }

    return {
      done: false,
      value: {
        char: char.value,
        pos: {
          line: this.#line,
          column: this.#column,
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
