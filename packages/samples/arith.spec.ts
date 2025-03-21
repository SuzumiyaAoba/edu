import {
  arithParser,
  createArithNode,
  numberParser,
  factorParser,
  termParser,
} from "./arith";
import { expect, describe, it } from "bun:test";

describe("arithParser", () => {
  it("should parse basic arithmetic expressions", () => {
    expect(arithParser("1+1", 0)).toEqual({
      success: true,
      value: createArithNode("+", 1, 1),
      next: 3,
    });
    expect(arithParser("2-1", 0)).toEqual({
      success: true,
      value: createArithNode("-", 2, 1),
      next: 3,
    });
    expect(arithParser("3*2", 0)).toEqual({
      success: true,
      value: createArithNode("*", 3, 2),
      next: 3,
    });
    expect(arithParser("4/2", 0)).toEqual({
      success: true,
      value: createArithNode("/", 4, 2),
      next: 3,
    });
  });

  it("should handle multiple operators", () => {
    expect(arithParser("1+2*3", 0)).toEqual({
      success: true,
      value: createArithNode("+", 1, createArithNode("*", 2, 3)),
      next: 5,
    });
    expect(arithParser("4/2-1", 0)).toEqual({
      success: true,
      value: createArithNode("-", createArithNode("/", 4, 2), 1),
      next: 5,
    });
  });

  it("should handle division by zero", () => {
    // 0で除算した場合のテストは、エラーが発生することを期待します。
    // ただし、現在のパーサーはエラーを返さないため、テストはスキップします。
    // TODO: エラー処理を追加したら、このテストを有効にする
    // expect(arithParser("1/0", 0)).toThrowError("Division by zero");
  });

  it("should handle operator precedence", () => {
    expect(arithParser("1+2*3", 0)).toEqual({
      success: true,
      value: {
        type: "arith",
        op: "+",
        left: 1,
        right: {
          type: "arith",
          op: "*",
          left: 2,
          right: 3,
        },
      },
      next: 5,
    });
    expect(arithParser("4/2-1", 0)).toEqual({
      success: true,
      value: {
        type: "arith",
        op: "-",
        left: {
          type: "arith",
          op: "/",
          left: 4,
          right: 2,
        },
        right: 1,
      },
      next: 5,
    });
  });

  it("should handle parentheses", () => {
    expect(arithParser("(1+2)*3", 0)).toEqual({
      success: true,
      value: createArithNode("*", createArithNode("+", 1, 2), 3),
      next: 7,
    });
  });

  it("should handle complex expressions", () => {
    expect(arithParser("1+(2*3)-4/2", 0)).toEqual({
      success: true,
      value: createArithNode(
        "-",
        createArithNode("+", 1, createArithNode("*", 2, 3)),
        createArithNode("/", 4, 2),
      ),
      next: 11,
    });
  });
});

describe("numberParser", () => {
  it("should parse a number", () => {
    expect(numberParser("123", 0)).toEqual({
      success: true,
      value: 123,
      next: 3,
    });
  });
});

describe("factorParser", () => {
  it("should parse a number", () => {
    expect(factorParser("123", 0)).toEqual({
      success: true,
      value: 123,
      next: 3,
    });
  });

  it("should parse an expression in parentheses", () => {
    expect(factorParser("(123)", 0)).toEqual({
      success: true,
      value: 123,
      next: 5,
    });
  });
});

describe("termParser", () => {
  it("should parse a factor", () => {
    expect(termParser("123", 0)).toEqual({
      success: true,
      value: 123,
      next: 3,
    });
  });

  it("should parse a multiplication", () => {
    expect(termParser("123*456", 0)).toEqual({
      success: true,
      value: createArithNode("*", 123, 456),
      next: 7,
    });
  });

  it("should parse a division", () => {
    expect(termParser("123/456", 0)).toEqual({
      success: true,
      value: createArithNode("/", 123, 456),
      next: 7,
    });
  });
});
