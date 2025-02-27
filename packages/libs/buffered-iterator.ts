import type { PrivateConstructorParameters } from "@/libs/std/types";

/**
 * `BufferedAsyncIterator` のオプション。
 *
 * - `size`: バッファーサイズ
 * - `multiplier`: バッファーを拡張するときの係数
 */
export type Options = {
  size: number;
  multiplier: number;
};

/**
 * `BufferedAsyncIterator` のデフォルトオプション。
 *
 * - `size`: 1024
 * - `multiplier`: 2
 */
export const DEFAULT_OPTIONS = {
  size: 1024,
  multiplier: 2,
} as const satisfies Options;

/**
 * バッファー有り非同期イテレータ。
 *
 * @remarks
 * 非同期ジェネレータから値を取得し、バッファーにデータを格納しながら走査する。
 */
export class BufferedAsyncIterator<T, TReturn = unknown, TNext = unknown>
  implements AsyncIterator<T, TReturn, TNext>
{
  #generator: AsyncGenerator<T, TReturn, TNext>;
  #options: Options;

  // それぞれの変数には次のデータを保存する。
  //
  // - `buffer` には非同期ジェネレータから取得した結果をそのまま保存
  // - `left` にはバッファされたデータの先頭インデックス
  // - `right` にはバッファされたデータの末尾インデックス
  // - `current` には現在のインデックス
  #buffer: IteratorResult<T, TReturn>[];
  #left: number;
  #right: number;
  #current: number;

  /**
   * コンストラクタ。
   *
   * @param generator - 非同期ジェネレータ
   * @param options - オプション
   */
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
   * 非同期ジェネレータから非同期イテレータを生成して返す。
   *
   * @param args - 非同期ジェネレータとオプション
   * @returns 非同期イテレータ.
   */
  static from<T, TReturn = unknown, TNext = unknown>(
    ...args: PrivateConstructorParameters<
      typeof BufferedAsyncIterator<T, TReturn, TNext>
    >
  ) {
    return new BufferedAsyncIterator<T, TReturn, TNext>(...args);
  }

  /**
   * 非同期イテレータを返す。
   *
   * @remarks
   * [反復処理プロトコル - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Iteration_protocols#%E9%9D%9E%E5%90%8C%E6%9C%9F%E3%82%A4%E3%83%86%E3%83%AC%E3%83%BC%E3%82%BF%E3%83%BC%E3%81%A8%E9%9D%9E%E5%90%8C%E6%9C%9F%E5%8F%8D%E5%BE%A9%E5%8F%AF%E8%83%BD%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB) に準拠するための実装。
   *
   * @returns 非同期イテレータ.
   */
  [Symbol.asyncIterator]() {
    return this;
  }

  /**
   * 現在の位置の次の要素を返す。
   *
   * @param _value - 未使用
   * @returns 次の要素
   */
  async next(...[_value]: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
    const result = await this.peek();
    this.#current++;

    return result;
  }

  /**
   * 現在の位置から `n` 要素先を返す。
   *
   * @remarks
   * 引数に `0` を指定すると現在の位置の要素を返す。
   *
   * @param n - 先読みする要素数
   * @returns 現在の位置から `n` 要素先の要素
   */
  async peek(n = 1): Promise<IteratorResult<T, TReturn>> {
    const lookahead = this.#current + n;
    if (lookahead >= this.#right) {
      // 先読みする要素がバッファーの範囲外の場合はバッファーを調整
      if (lookahead >= this.#buffer.length) {
        this.#adjustBuffer();
      }

      // バッファーにデータを追加
      const overflow = lookahead - this.#right + 1;
      for (let i = 0; i < overflow; i++) {
        const result = await this.#generator.next();
        this.#buffer[this.#right++] = result;
      }
    }

    return this.#buffer[lookahead] as IteratorResult<T, TReturn>;
  }

  /**
   * `n` 要素をスキップする。
   *
   * @remarks
   * 要素のスキップ処理に同期して次の操作を行うときは `await` を使ってこのメソッドの戻り値を待つ必要がある。
   *
   * @param n - スキップする要素数
   * @returns なし
   */
  async skip(n = 1): Promise<void> {
    for (let i = 0; i < n; i++) {
      await this.next();
    }
  }

  /**
   * 現在の位置を `n` 要素戻す。
   *
   * @param n - 戻す要素数
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
   * バッファーをリセットする。
   *
   * @remarks
   * `resetBuffer` に `true` を指定しなかった場合は、カーソルの位置だけをリセットし、バッファーのデータはそのまま残る。
   *
   * @param resetBuffer - バッファーをリセットするかどうか
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
   * バッファーのサイズを返す。
   *
   * @returns バッファーのサイズ
   */
  bufferSize() {
    return this.#buffer.length;
  }

  /**
   * バッファーのサイズ、データの位置を調整する。
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
