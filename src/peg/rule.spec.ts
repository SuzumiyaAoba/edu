import { describe, expect, it, jest } from "bun:test";
import { mockModule } from "../test/mockModule";
import { type Expr, printExpr } from "./rule";

import * as ioModule from "../utils/io";

describe("printExpr", async () => {
  it("Identifier", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = { type: "Identifier", value: "id" };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"]]);
  });

  it("literal", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = { type: "Literal", value: "+" };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['"+"']]);
  });

  it("CharClass", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = { type: "CharClass", value: "a-z" };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["[a-z]"]]);
  });

  it("WildCard", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = { type: "WildCard" };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["."]]);

    expect(ioModule.print).toHaveBeenCalledWith(".");
  });

  it("Choice", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "Choice",
      lhs: { type: "Identifier", value: "id" },
      rhs: { type: "Literal", value: "+" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([
      ["id"],
      [" / "],
      ['"+"'],
    ]);
  });

  it("Repeat", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "Repeat",
      expr: { type: "Identifier", value: "id" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["*"]]);
  });

  it("OneOrMore", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "OneOrMore",
      expr: { type: "Identifier", value: "id" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["+"]]);
  });

  it("Optional", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "Optional",
      expr: { type: "Identifier", value: "id" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["?"]]);
  });

  it("PositiveLookahead", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "PositiveLookahead",
      expr: { type: "Identifier", value: "id" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["&"], ["id"]]);
  });

  it("NegativeLookahead", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "NegativeLookahead",
      expr: { type: "Identifier", value: "id" },
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["!"], ["id"]]);
  });

  it("Sequence", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expr = {
      type: "Sequence",
      exprs: [
        { type: "Identifier", value: "id" },
        { type: "Literal", value: "+" },
      ],
    };

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([
      ["("],
      ["id"],
      ['"+"'],
      [")"],
    ]);
  });
});
