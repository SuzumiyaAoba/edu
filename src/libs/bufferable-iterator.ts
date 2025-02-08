export const bufferableAsyncIterator = <T, TReturn = unknown, TNext = unknown>(
  gen: AsyncGenerator<T, TReturn, TNext>,
  bufferSize = 1024,
) => {
  let buffer: IteratorResult<T, TReturn>[] = Array(bufferSize);
  let left = 0;
  let right = 0;

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
    async peek(n?: number) {
      if (n) {
        const buffer: T[] = [];

        for (let i = 0; i < n; i++) {
          const result = await this._peek();

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
      }

      return await this._peek();
    },
    async _peek(): Promise<IteratorResult<T, TReturn>> {
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
    async consume(): Promise<void> {
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
