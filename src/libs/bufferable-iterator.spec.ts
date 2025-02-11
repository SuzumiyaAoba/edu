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
    const iter = sut.bufferableAsyncIterator(
      arrayToAsyncGenrator(["a", "b", "c"]),
    );

    const actual: string[] = [];
    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual(["a", "b", "c"]);
  });

  it("should handle multiple lines correctly", async () => {
    const iter = sut.bufferableAsyncIterator(
      arrayToAsyncGenrator(["line 1", "line 2"]),
    );
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual(["line 1", "line 2"]);
  });

  it("should handle empty input", async () => {
    const iter = sut.bufferableAsyncIterator(arrayToAsyncGenrator([]));
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(actual).toEqual([]);
  });

  it("should correctly peek values without consuming them", async () => {
    const iter = sut.bufferableAsyncIterator(
      arrayToAsyncGenrator(["x", "y", "z"]),
    );

    const peekX = await iter.peek();
    const peekY = await iter.peek();
    const actual: string[] = [];

    for await (const value of iter) {
      actual.push(value);
    }

    expect(peekX).toEqual({ value: "x", done: false });
    expect(peekY).toEqual({ value: "y", done: false });
    expect(actual).toEqual(["x", "y", "z"]);
  });

  it("should return done true when peeking at the end of the iterator", async () => {
    const iter = sut.bufferableAsyncIterator(arrayToAsyncGenrator([]));

    const peek = await iter.peek();
    expect(peek).toEqual({ value: undefined, done: true });
  });

  it("should handle buffer overflow correctly", async () => {
    const options = {
      size: 2,
      multiplier: 2,
    };
    const iter = sut.bufferableAsyncIterator(
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
    expect(peek2).toEqual({ value: "2", done: false });
    expect(peek3).toEqual({ value: "3", done: false });
    expect(actual).toEqual(["1", "2", "3", "4", "5"]);
    expect(iter.bufferSize()).toEqual(4);
  });
});

describe("charGenerator", () => {
  it("should correctly peek n characters without consuming them", async () => {
    const input = Readable.from("abcdef\n");
    const gen = charGenerator(input);
    const iter = sut.bufferableAsyncIterator(gen);

    const peek1 = await iter.peekN(3);
    const peek2 = await iter.peekN(3);
    const actual: string[] = [];

    for await (const result of iter) {
      actual.push(result.char);
    }

    expect(peek1).toEqual({
      done: false,
      value: [
        { char: "a", pos: { line: 1, column: 0 } },
        { char: "b", pos: { line: 1, column: 1 } },
        { char: "c", pos: { line: 1, column: 2 } },
      ],
    });
    expect(peek2).toEqual({
      done: false,
      value: [
        { char: "d", pos: { line: 1, column: 3 } },
        { char: "e", pos: { line: 1, column: 4 } },
        { char: "f", pos: { line: 1, column: 5 } },
      ],
    });
    expect(actual).toEqual(["a", "b", "c", "d", "e", "f", "\n"]);
  });

  it("should return done true when peeking beyond the end of the iterator", async () => {
    const input = Readable.from("abc\n");
    const gen = charGenerator(input);
    const iter = sut.bufferableAsyncIterator(gen);

    const peek = await iter.peekN(10);
    expect(peek).toEqual({
      done: false,
      value: [
        { char: "a", pos: { line: 1, column: 0 } },
        { char: "b", pos: { line: 1, column: 1 } },
        { char: "c", pos: { line: 1, column: 2 } },
        { char: "\n", pos: { line: 1, column: 3 } },
      ],
    });
  });
});
