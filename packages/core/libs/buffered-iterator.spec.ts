import { describe, expect, it } from "bun:test";
import { BufferedAsyncIterator } from "./buffered-iterator";

const arrayToAsyncGenrator = (arr: string[]) => {
  return (async function* () {
    for (const char of arr) {
      yield char;
    }
  })();
};

describe("BufferableAsyncIterator", () => {
  it("非同期イテレータを返す", async () => {
    const iter = BufferedAsyncIterator.from(
      arrayToAsyncGenrator(["a", "b", "c"]),
    );

    const actual: string[] = [];
    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual(["a", "b", "c"]);
  });

  it("バッファーから値を取り出す", async () => {
    const iter = BufferedAsyncIterator.from(
      arrayToAsyncGenrator(["a", "b", "c"]),
    );

    const actual: string[] = [];
    for await (const value of iter) {
      actual.push(value);
    }

    // バッファーから値を取り出せる
    expect(await iter.peek(0)).toEqual({ done: true, value: undefined });
    expect(await iter.peek(-1)).toEqual({ done: false, value: "c" });
    expect(await iter.peek(-2)).toEqual({ done: false, value: "b" });
    expect(await iter.peek(-3)).toEqual({ done: false, value: "a" });
  });

  it("バックトラック後にバッファから値を取り出す", async () => {
    const iter = BufferedAsyncIterator.from(
      arrayToAsyncGenrator(["a", "b", "c"]),
    );

    const actual: string[] = [];
    for await (const value of iter) {
      actual.push(value);
    }

    iter.backtrack(3);

    // バックトラックして値を取り出せる
    expect(await iter.peek(0)).toEqual({ done: false, value: "a" });
    expect(await iter.peek(1)).toEqual({ done: false, value: "b" });
    expect(await iter.peek(2)).toEqual({ done: false, value: "c" });
    expect(await iter.peek(3)).toEqual({ done: true, value: undefined });
  });

  it("空の入力で機能する", async () => {
    const iter = BufferedAsyncIterator.from(arrayToAsyncGenrator([]));
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual([]);
  });

  it("値を消費することなしに先読みできる", async () => {
    const iter = BufferedAsyncIterator.from(
      arrayToAsyncGenrator(["x", "y", "z"]),
    );

    const peekX = await iter.peek();
    const peekY = await iter.peek();
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(peekX).toEqual({ value: "x", done: false });
    expect(peekY).toEqual({ value: "x", done: false });

    expect(actual).toEqual(["x", "y", "z"]);
  });

  it("最後の要素の次の要素を先読みしたときに終了する", async () => {
    const iter = BufferedAsyncIterator.from(arrayToAsyncGenrator([]));

    const peek = await iter.peek();
    expect(peek).toEqual({ value: undefined, done: true });
  });

  it("バッファーサイズよりも多いデータを読んだときにバッファーサイズが拡大される", async () => {
    const options = {
      size: 2,
      multiplier: 2,
    };
    const iter = BufferedAsyncIterator.from(
      arrayToAsyncGenrator(["1", "2", "3", "4", "5"]),
      options,
    );
    const actual: string[] = [];

    const peek1 = await iter.peek(1);
    const peek2 = await iter.peek(2);
    const peek3 = await iter.peek(3);

    expect(iter.bufferSize()).toEqual(4);

    for await (const value of iter) {
      actual.push(value);
    }

    expect(peek1).toEqual({ value: "1", done: false });
    expect(peek2).toEqual({ value: "2", done: false });
    expect(peek3).toEqual({ value: "3", done: false });
    expect(actual).toEqual(["1", "2", "3", "4", "5"]);
    expect(iter.bufferSize()).toEqual(8);
  });
});
