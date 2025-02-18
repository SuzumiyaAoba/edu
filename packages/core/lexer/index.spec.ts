import { describe, expect, it } from "bun:test";
import { BufferedAsyncIterator } from "@/libs/buffered-iterator";
import { CharAsyncGenerator } from "@/libs/char-async-generator";
import * as sut from "./index";

const iteratorFromString = (str: string) => {
  const gen = CharAsyncGenerator.from(str);

  return BufferedAsyncIterator.from(gen);
};

const consumeCharN = async (iter: sut.CharIterator, n: number) => {
  const results: Awaited<ReturnType<(typeof sut)["consumeChar"]>>[] = [];

  for (let i = 0; i < n; i++) {
    results.push(await sut.consumeChar(iter));
  }

  return results;
};

describe("consumeChar", () => {
  it("should consume a single character correctly", async () => {
    const iter = iteratorFromString("abc\n");

    const actual = await consumeCharN(iter, 3);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: { char: "b", escaped: false }, done: false },
      { value: { char: "c", escaped: false }, done: false },
    ]);
  });

  it("should consume a single character correctly", async () => {
    const iter = iteratorFromString("");

    const actual = await sut.consumeChar(iter);

    expect(actual).toEqual({ value: undefined, done: true });
  });

  it("should handle escaped characters correctly", async () => {
    const iter = iteratorFromString("\\n\\t\\r\\176\\77\\0");

    const actual = await consumeCharN(iter, 6);

    expect(actual).toEqual([
      { value: { char: "\n", escaped: true }, done: false },
      { value: { char: "\t", escaped: true }, done: false },
      { value: { char: "\r", escaped: true }, done: false },
      { value: { char: "~", escaped: true }, done: false },
      { value: { char: "?", escaped: true }, done: false },
      { value: { char: "\u0000", escaped: true }, done: false },
    ]);
  });

  it("", async () => {
    const iter = iteratorFromString("a");

    const actual = await consumeCharN(iter, 2);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: undefined, done: true },
    ]);
  });
});

describe("consumeLiteral", () => {
  it("should consume a literal string correctly", async () => {
    const iter = iteratorFromString("'hello' world\n");

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
    });
  });

  it("should throw an error if the literal does not match", async () => {
    const iter = iteratorFromString('"hello" world');

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
    });
  });

  it("should consume a literal with whitespace correctly", async () => {
    const iter = iteratorFromString("'hello world'\n");

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello world",
      },
    });
  });

  it("should consume a literal with escaped character correctly", async () => {
    const iter = iteratorFromString('"hello \\"world\\""');

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: 'hello "world"',
      },
    });
  });
});
