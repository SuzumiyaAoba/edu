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

    expect(actual).toEqual(["a", "b", "c"]);
  });

  it("should throw an error when consuming from an empty iterator", async () => {
    const input = Readable.from("");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    expect(sut.consumeChar(iter)).rejects.toThrow("Unexpected EOF");
  });

  it("should handle escaped characters correctly", async () => {
    const input = Readable.from("\\n\\t\\r\\277\\77\\7\\");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    const actual = await Promise.all([
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // 'n'
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // 't',
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // 'r'
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // '2'
      sut.consumeChar(iter), // '7'
      sut.consumeChar(iter), // '7'
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // '7'
      sut.consumeChar(iter), // '7'
      sut.consumeChar(iter), // '\\'
      sut.consumeChar(iter), // '7'
      sut.consumeChar(iter), // '\\'
    ]);

    expect(actual).toEqual([
      "\\",
      "n",
      "\\",
      "t",
      "\\",
      "r",
      "\\",
      "2",
      "7",
      "7",
      "\\",
      "7",
      "7",
      "\\",
      "7",
      "\\",
    ]);
  });

  it("should throw an error for unexpected EOF", async () => {
    const input = Readable.from("a");
    const gen = charGenerator(input);
    const iter = bufferableAsyncIterator(gen);

    await sut.consumeChar(iter); // 'a'

    expect(sut.consumeChar(iter)).rejects.toThrow("Unexpected EOF");
  });
});
