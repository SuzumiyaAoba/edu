import { describe, expect, it, jest } from "bun:test";
import { mockModule } from "../test/mockModule";
import { type Expression, printExpr } from "./grammar";
import { PegGrammar, definitionToString, exprToString } from "./grammar";

import * as ioModule from "../utils/io";

const g = new PegGrammar();

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

    const expr: Expression = g.charClass([g.range("a", "z")]);

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["[a-z]"]]);
  });

  it("AnyCharacter", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.any();

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

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id*"]]);
  });

  it("OneOrMore", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.plus(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id+"]]);
  });

  it("Optional", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.opt(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id?"]]);
  });

  it("AndPredicate", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.and(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["&id"]]);
  });

  it("NotPredicate", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.not(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["!id"]]);
  });

  it("PrioritizedChoice", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.choice(g.id("id"), g.lit("+"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['(id / "+")']]);
  });

  it("Sequence", async () => {
    using _ioModuleMock = await mockModule("../utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.seq([g.id("id"), g.lit("+")]);

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['(id "+")']]);
  });
});

describe("toString", () => {
  it.each([
    [g.id("id"), "id"],
    [g.lit("+"), '"+"'],
    [g.charClass([g.range("a", "z")]), "[a-z]"],
    [g.any(), "."],
    [g.group(g.seq([g.id("x"), g.lit("+"), g.id("y")])), '((x "+" y))'],
    [g.star(g.lit("0")), '"0"*'],
    [g.plus(g.lit("0")), '"0"+'],
    [g.opt(g.lit("0")), '"0"?'],
    [g.and(g.id("id")), "&id"],
    [g.not(g.id("id")), "!id"],
    [g.seq([g.id("x"), g.lit("+"), g.id("y")]), '(x "+" y)'],
  ])("expression", (expr, expected) => {
    const actual = exprToString(expr);

    expect(actual).toEqual(expected);
  });

  it.each([
    [g.def(g.id("definition"), g.id("x")), "definition <- x;"],
    [
      g.def(
        g.id("expr"),
        g.seq([
          g.id("term"),
          g.group(
            g.choice(
              g.seq([g.lit("+"), g.id("term")]),
              g.seq([g.lit("-"), g.id("term")]),
            ),
          ),
        ]),
      ),
      'expr <- (term ((("+" term) / ("-" term))));',
    ],
  ])("definition", (definition, expected) => {
    const actual = definitionToString(definition);

    expect(actual).toEqual(expected);
  });
});

describe("exprToString", () => {
  it.each([
    [g.id("id"), "id"],
    [g.lit("+"), '"+"'],
    [g.charClass([g.range("a", "z")]), "[a-z]"],
    [g.any(), "."],
    [g.grouping(g.seq([g.id("x"), g.lit("+"), g.id("y")])), '((x "+" y))'],
    [g.zeroOrMore(g.lit("0")), '"0"*'],
    [g.oneOrMore(g.lit("0")), '"0"+'],
    [g.opt(g.lit("0")), '"0"?'],
    [g.and(g.id("id")), "&id"],
    [g.not(g.id("id")), "!id"],
    [g.seq([g.id("x"), g.lit("+"), g.id("y")]), '(x "+" y)'],
  ])("expression: %o", (expr, expected) => {
    const actual = exprToString(expr);

    expect(actual).toEqual(expected);
  });

  it.each([
    [g.def(g.id("definition"), g.id("x")), "definition <- x;"],
    [
      g.def(
        g.id("expr"),
        g.seq([
          g.id("term"),
          g.group(
            g.choice(
              g.seq([g.lit("+"), g.id("term")]),
              g.seq([g.lit("-"), g.id("term")]),
            ),
          ),
        ]),
      ),
      'expr <- (term ((("+" term) / ("-" term))));',
    ],
  ])("definition", (definition, expected) => {
    const actual = definitionToString(definition);

    expect(actual).toEqual(expected);
  });
});
