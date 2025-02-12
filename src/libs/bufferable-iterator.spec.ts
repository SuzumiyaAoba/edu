import { describe, expect, it } from "bun:test";
import { Readable } from "node:stream";
import * as sut from "./bufferable-iterator";
import { charGenerator } from "./char-generator";

const arrayToAsyncGenrator = (arr: string[]) => {
  return (async function* () {
    for (const char of arr) {
      yield char;
    }
  })();
};

describe("bufferableAsyncIterator", () => {
  it("should generate a bufferable async iterator", async () => {
    const iter = sut.bufferedAsyncIterator(
      arrayToAsyncGenrator(["a", "b", "c"]),
    );

    const actual: string[] = [];
    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual(["a", "b", "c"]);
  });

  it("should handle multiple lines correctly", async () => {
    const iter = sut.bufferedAsyncIterator(
      arrayToAsyncGenrator(["line 1", "line 2"]),
    );
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual(["line 1", "line 2"]);
  });

  it("should handle empty input", async () => {
    const iter = sut.bufferedAsyncIterator(arrayToAsyncGenrator([]));
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual([]);
  });

  it("should correctly peek values without consuming them", async () => {
    const iter = sut.bufferedAsyncIterator(
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

  it("should return done true when peeking at the end of the iterator", async () => {
    const iter = sut.bufferedAsyncIterator(arrayToAsyncGenrator([]));

    const peek = await iter.peek();
    expect(peek).toEqual({ value: undefined, done: true });
  });

  it("should handle buffer overflow correctly", async () => {
    const options = {
      size: 2,
      multiplier: 2,
    };
    const iter = sut.bufferedAsyncIterator(
      arrayToAsyncGenrator(["1", "2", "3", "4", "5"]),
      options,
    );
    const actual: string[] = [];

    const peek1 = await iter.peek();
    const peek2 = await iter.peek();
    const peek3 = await iter.peek();

    for await (const value of iter) {
      actual.push(value);
    }

    expect(peek1).toEqual({ value: "1", done: false });
    expect(peek2).toEqual({ value: "1", done: false });
    expect(peek3).toEqual({ value: "1", done: false });
    expect(actual).toEqual(["1", "2", "3", "4", "5"]);
    expect(iter.bufferSize()).toEqual(8);
  });
});
