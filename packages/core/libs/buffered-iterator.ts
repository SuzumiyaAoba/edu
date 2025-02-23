import type { PrivateConstructorParameters } from "@/libs/types";

export type Options = {
  size: number;
  multiplier: number;
};

export const DEFAULT_OPTIONS = {
  size: 1024,
  multiplier: 2,
} as const satisfies Options;

/**
 * Buffered async iterator.
 */
export class BufferedAsyncIterator<T, TReturn = unknown, TNext = unknown>
  implements AsyncIterator<T, TReturn, TNext>
{
  #generator: AsyncGenerator<T, TReturn, TNext>;
  #buffer: IteratorResult<T, TReturn>[];
  #options: Options;

  #left: number;
  #right: number;
  #current: number;

  private constructor(
    generator: AsyncGenerator<T, TReturn, TNext>,
    options: Options = DEFAULT_OPTIONS,
  ) {
    this.#generator = generator;
    this.#options = options;

    this.#buffer = Array(this.#options.size);

    this.#left = 0;
    this.#right = 0;
    this.#current = -1;
  }

  /**
   * Create a buffered async iterator from a string.
   *
   * @param str - The string to create the iterator from.
   * @returns BufferedAsyncIterator<string, void> - The buffered async iterator.
   */
  static from<T, TReturn = unknown, TNext = unknown>(
    ...args: PrivateConstructorParameters<
      typeof BufferedAsyncIterator<T, TReturn, TNext>
    >
  ) {
    return new BufferedAsyncIterator<T, TReturn, TNext>(...args);
  }

  /**
   * Get the async iterator.
   *
   * @returns AsyncIterator<T, TReturn, TNext> - The async iterator.
   */
  [Symbol.asyncIterator]() {
    return this;
  }

  /**
   * Get the next element.
   *
   * @param _value - The value to pass to the generator.
   * @returns Promise<IteratorResult<T, TReturn>> - The result of the next element.
   */
  async next(...[_value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
    const result = await this.peek();
    this.#current++;

    return result;
  }

  /**
   * Lookahead n elements.
   *
   * @param n - Number of elements to lookahead.
   * @returns Promise<IteratorResult<T, TReturn>> - The result of the lookahead.
   */
  async peek(n = 1): Promise<IteratorResult<T, TReturn>> {
    const lookahead = this.#current + n;
    if (lookahead >= this.#right) {
      if (lookahead >= this.#buffer.length) {
        this.#adjustBuffer();
      }

      const overflow = lookahead - this.#right + 1;
      for (let i = 0; i < overflow; i++) {
        const result = await this.#generator.next();
        this.#buffer[this.#right++] = result;
      }
    }

    return this.#buffer[lookahead] as IteratorResult<T, TReturn>;
  }

  /**
   * Skip n elements.
   *
   * @param n - Number of elements to skip.
   * @returns Promise<void> - The result of the skip.
   */
  async skip(n = 1): Promise<void> {
    for (let i = 0; i < n; i++) {
      await this.next();
    }
  }

  /**
   * Backtrack n elements.
   *
   * @param n - Number of elements to backtrack.
   */
  backtrack(n = 1): void {
    const index = this.#current - n;
    if (index >= this.#left) {
      this.#current = index;
    } else {
      throw new Error(`Cannot backtrack ${n} elements`);
    }
  }

  /**
   * Reset the iterator.
   *
   * @param resetBuffer - Whether to reset the buffer.
   */
  reset(resetBuffer = false): void {
    this.#current = -1;
    this.#left = 0;
    this.#right = 0;

    if (resetBuffer) {
      this.#buffer = Array(this.#options.size);
    }
  }

  /**
   * Get the buffer size.
   *
   * @returns number - The buffer size.
   */
  bufferSize() {
    return this.#buffer.length;
  }

  /**
   * Adjust the buffer.
   */
  #adjustBuffer() {
    const size = this.#right - this.#left;

    const src = this.#buffer;
    const dst: IteratorResult<T, TReturn>[] =
      this.#left > size / 2
        ? this.#buffer
        : Array(size * this.#options.multiplier);

    for (let i = 0; i < size; i++) {
      const value = src[this.#left + i];
      if (value) {
        dst[i] = value;
      }
    }

    this.#buffer = dst;

    this.#current = this.#current - this.#left;
    this.#left = 0;
    this.#right = size;
  }
}
