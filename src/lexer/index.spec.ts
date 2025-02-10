import { describe, expect, it } from "bun:test";
import { Readable } from "node:stream";
import { bufferableAsyncIterator } from "@/libs/bufferable-iterator";
import { charGenerator } from "@/libs/char-generator";
import * as sut from "./index";

describe("consumeChar", () => {
  it("should consume a single character correctly", async () => {
    const input = Readable.from("abc\n");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await Promise.all([
      sut.consumeChar(iter), // 'a'
      sut.consumeChar(iter), // 'b'
      sut.consumeChar(iter), // 'c'
    ]);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: { char: "b", escaped: false }, done: false },
      { value: { char: "c", escaped: false }, done: false },
    ]);
  });

  it("should consume a single character correctly", async () => {
    const input = Readable.from("");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await sut.consumeChar(iter);

    expect(actual).toEqual({ value: undefined, done: true });
  });

  it("should handle escaped characters correctly", async () => {
    const input = Readable.from("\\n\\t\\r\\176\\77\\0");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual: IteratorResult<{ char: string; escaped: boolean }, unknown>[] = [];

    for (let i = 0; i < 6; i++) {
      actual.push(await sut.consumeChar(iter));
    }

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
    const input = Readable.from("a");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await Promise.all([
      sut.consumeChar(iter), // 'a'
      sut.consumeChar(iter),
    ]);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: undefined, done: true },
    ]);
  });
});

describe("consumeLiteral", () => {
  it("should consume a literal string correctly", async () => {
    const input = Readable.from("'hello' world\n");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
    });
  });

  it("should throw an error if the literal does not match", async () => {
    const input = Readable.from('"hello" world');
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
    });
  });

  it("should consume a literal with whitespace correctly", async () => {
    const input = Readable.from("'hello world'\n");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello world",
      },
    });
  });

  it("should consume a literal with escaped character correctly", async () => {
    const input = Readable.from('"hello \\"world\\""');
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await sut.consumeLiteral(iter);

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: 'hello "world"',
      },
    });
  });
});
