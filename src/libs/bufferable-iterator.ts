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
export const bufferedAsyncIterator = <T, TReturn = unknown, TNext = unknown>(
  gen: AsyncGenerator<T, TReturn, TNext>,
  options: {
    size: number;
    multiplier: number;
  } = {
    size: 1024,
    multiplier: 2,
  },
) => {
  const { size, multiplier } = options;
  let buffer: IteratorResult<T, TReturn>[] = Array(size);
  let current = -1;
  let left = 0;
  let right = 0;

  const adjustBuffer = () => {
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

    current = current - left;
    left = 0;
    right = size;
  };

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next(...[_value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
      const result = await this.peek();
      current++;

      return result;
    },
    async peek(n = 1): Promise<IteratorResult<T, TReturn>> {
      const index = current + n;
      if (index >= right) {
        if (right + n > buffer.length) {
          adjustBuffer();
        }

        for (let i = 0; i < n; i++) {
          const result = await gen.next();
          buffer[right++] = result;
        }
      }

      return buffer[index] as IteratorResult<T, TReturn>;
    },
    async skip(): Promise<void> {
      await this.next();
    },
    reset(resetBuffer = false): void {
      left = 0;
      right = 0;

      if (resetBuffer) {
        buffer = Array(size);
      }
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
> = ReturnType<typeof bufferedAsyncIterator<T, TReturn, TNext>>;
