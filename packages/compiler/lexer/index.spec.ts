import { describe, expect, it } from "bun:test";
import { Lexer } from "./index";

const consumeCharN = async (lexer: Lexer, n: number) => {
  const results: Awaited<ReturnType<(typeof lexer)["consumeChar"]>>[] = [];

  for (let i = 0; i < n; i++) {
    results.push(await lexer.consumeChar());
  }

  return results;
};

describe("consumeChar", () => {
  it("should consume a single character correctly", async () => {
    const sut = new Lexer("abc\n");

    const actual = await consumeCharN(sut, 3);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: { char: "b", escaped: false }, done: false },
      { value: { char: "c", escaped: false }, done: false },
    ]);
  });

  it("should consume a single character correctly", async () => {
    const sut = new Lexer("");

    const actual = await sut.consumeChar();

    expect(actual).toEqual({ value: undefined, done: true });
  });

  it("should handle escaped characters correctly", async () => {
    const sut = new Lexer("\\n\\t\\r\\176\\77\\0");

    const actual = await consumeCharN(sut, 6);

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
    const sut = new Lexer("a");

    const actual = await consumeCharN(sut, 2);

    expect(actual).toEqual([
      { value: { char: "a", escaped: false }, done: false },
      { value: undefined, done: true },
    ]);
  });
});

describe("consumeLiteral", () => {
  it("should consume a literal string correctly", async () => {
    const sut = new Lexer("'hello' world\n");

    const actual = await sut.consumeLiteral();

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
      meta: {
        pos: {
          line: 1,
          column: 0,
        },
      },
    });
  });

  it("should throw an error if the literal does not match", async () => {
    const sut = new Lexer('"hello" world');

    const actual = await sut.consumeLiteral();

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello",
      },
      meta: {
        pos: {
          line: 1,
          column: 0,
        },
      },
    });
  });

  it("should consume a literal with whitespace correctly", async () => {
    const sut = new Lexer("'hello world'\n");

    const actual = await sut.consumeLiteral();

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: "hello world",
      },
      meta: {
        pos: {
          line: 1,
          column: 0,
        },
      },
    });
  });

  it("should consume a literal with escaped character correctly", async () => {
    const sut = new Lexer('"hello \\"world\\""');

    const actual = await sut.consumeLiteral();

    expect(actual).toEqual({
      token: {
        type: "Literal",
        value: 'hello "world"',
      },
      meta: {
        pos: {
          line: 1,
          column: 0,
        },
      },
    });
  });
});
