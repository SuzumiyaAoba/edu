/**
 * Bufferable async iterator.
 *
 * Provide following operations:
 *
 * - `next`
 * - `consume`
 * - `peek`
 * - `skip`
 * - `backtrack`
 */
export const bufferableAsyncIterator = <T, TReturn = unknown, TNext = unknown>(
  gen: AsyncGenerator<T, TReturn, TNext>,
  options: {
    size: number,
    multiplier: number,
  } = {
    size: 1024,
    multiplier: 2,
  },
) => {
  const { size, multiplier } = options;
  let buffer: IteratorResult<T, TReturn>[] = Array(size);
  let left = 0;
  let right = 0;

  const expandBuffer = () => {
    const size = right - left;

    const src = buffer;
    const dst: IteratorResult<T, TReturn>[] =
          left > size / 2 ? buffer : Array(size * multiplier);

    for (let i = 0; i < size; i++) {
      const value = src[left + i];
      if (value) {
        dst[i] = value;
      }
    }

    buffer = dst;
    left = 0;
    right = size;
  };

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next(...[_value]: [] | [TNext]) {
      if (left < right) {
        return buffer[left++] as (typeof buffer)[number];
      }

      return await gen.next();
    },
    async peek() {
      const result = await gen.next();
      if (right >= size) {
        expandBuffer();
      }

      buffer[right++] = result;

      return result;
    },
    async peekN(n: number) {
      const buffer: T[] = [];

      for (let i = 0; i < n; i++) {
        const result = await this.peek();

        if (!result.done) {
          buffer.push(result.value);
        } else {
          return { value: buffer, done: false } satisfies IteratorYieldResult<
            T[]
          > as IteratorYieldResult<T[]>;
        }
      }

      return { value: buffer, done: false } satisfies IteratorYieldResult<
        T[]
      > as IteratorYieldResult<T[]>;
    },
    async skip(): Promise<void> {
      await this.next();
    },
    prev(): IteratorResult<T, TReturn> | undefined {
      return buffer[right - 1];
    },
    reset(): void {
      left = 0;
      right = 0;
    },
    bufferSize() {
      return buffer.length;
    },
  };
};

export type BufferableAsyncIterator<
  T,
  TReturn = unknown,
  TNext = unknown,
> = ReturnType<typeof bufferableAsyncIterator<T, TReturn, TNext>>;
