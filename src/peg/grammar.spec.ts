import { describe, expect, it, jest } from "bun:test";
import { mockModule } from "../test/mockModule";
import { type Expression, printExpr } from "./grammar";
import * as g from "./grammar";

import * as ioModule from "../utils/io";

describe("printExpr", async () => {
  it("Identifier", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.id("id");

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"]]);
  });

  it("literal", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.lit("+");

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['"+"']]);
  });

  it("CharacterClass", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.charClass("a-z");

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["[a-z]"]]);
  });

  it("AnyCharacter", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.anyChar();

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["."]]);

    expect(ioModule.print).toHaveBeenCalledWith(".");
  });

  it("ZeroOrMore", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.star(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["*"]]);
  });

  it("OneOrMore", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.plus(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["+"]]);
  });

  it("Optional", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.opt(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"], ["?"]]);
  });

  it("AndPredicate", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.and(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["&"], ["id"]]);
  });

  it("NotPredicate", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.not(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["!"], ["id"]]);
  });

  it("PrioritizedChoice", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.choice(g.id("id"), g.lit("+"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([
      ["id"],
      [" / "],
      ['"+"'],
    ]);
  });

  it("Sequence", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.seq([g.id("id"), g.lit("+")]);

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([
      ["("],
      ["id"],
      ['"+"'],
      [")"],
    ]);
  });
});
