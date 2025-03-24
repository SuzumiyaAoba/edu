import { describe, expect, it, jest } from "bun:test";
import { mockModule } from "@/test/mockModule";

import * as ioModule from "@/core/utils/io";
import { type Expression, PegGrammar } from "./ast";
import { definitionToString, exprToString, printExpr } from "./printer";

const g = new PegGrammar();

describe("printExpr", async () => {
  it("Identifier", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.id("id");

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id"]]);
  });

  it("literal", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.lit("+");

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['"+"']]);
  });

  it("CharacterClass", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.charClass([g.range("a", "z")]);

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["[a-z]"]]);
  });

  it("AnyCharacter", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.any();

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["."]]);

    expect(ioModule.print).toHaveBeenCalledWith(".");
  });

  it("ZeroOrMore", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.star(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id*"]]);
  });

  it("OneOrMore", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.plus(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id+"]]);
  });

  it("Optional", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.opt(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["id?"]]);
  });

  it("AndPredicate", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.and(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["&id"]]);
  });

  it("NotPredicate", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.not(g.id("id"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([["!id"]]);
  });

  it("PrioritizedChoice", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.choice(g.id("id"), g.lit("+"));

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['id / "+"']]);
  });

  it("Sequence", async () => {
    using _ioModuleMock = await mockModule("@/core/utils/io", () => ({
      print: jest.fn(),
    }));

    const expr: Expression = g.seq([g.id("id"), g.lit("+")]);

    printExpr(expr);

    expect((ioModule.print as jest.Mock).mock.calls).toEqual([['id "+"']]);
  });
});

describe("toString", () => {
  it.each([
    [g.id("id"), "id"],
    [g.lit("+"), '"+"'],
    [g.charClass([g.range("a", "z")]), "[a-z]"],
    [g.any(), "."],
    [g.group(g.seq([g.id("x"), g.lit("+"), g.id("y")])), '(x "+" y)'],
    [g.star(g.lit("0")), '"0"*'],
    [g.plus(g.lit("0")), '"0"+'],
    [g.opt(g.lit("0")), '"0"?'],
    [g.and(g.id("id")), "&id"],
    [g.not(g.id("id")), "!id"],
    [g.seq([g.id("x"), g.lit("+"), g.id("y")]), 'x "+" y'],
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
      'expr <- term ("+" term / "-" term);',
    ],
  ])("definition", (definition, expected) => {
    const actual = definitionToString(definition);

    expect(actual).toEqual(expected);
  });
});

describe("PegGrammar", () => {
  it("identifier", () => {
    const expr = g.id("id");
    expect(expr.type).toBe("Identifier");
    expect(expr.name).toBe("id");
  });

  it("literal", () => {
    const expr = g.lit("+");
    expect(expr.type).toBe("Literal");
    expect(expr.value).toBe("+");
  });

  it("characterClass", () => {
    const expr = g.charClass([g.range("a", "z")]);
    expect(expr.type).toBe("CharacterClass");
    expect(expr.value).toEqual([{ type: "range", start: "a", stop: "z" }]);
  });

  it("any", () => {
    const expr = g.any();
    expect(expr.type).toBe("AnyCharacter");
  });

  it("zeroOrMore", () => {
    const expr = g.star(g.id("id"));
    expect(expr.type).toBe("ZeroOrMore");
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
  });

  it("oneOrMore", () => {
    const expr = g.plus(g.id("id"));
    expect(expr.type).toBe("OneOrMore");
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
  });

  it("optional", () => {
    const expr = g.opt(g.id("id"));
    expect(expr.type).toBe("Optional");
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
  });

  it("and", () => {
    const expr = g.and(g.id("id"));
    expect(expr.type).toBe("AndPredicate");
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
  });

  it("not", () => {
    const expr = g.not(g.id("id"));
    expect(expr.type).toBe("NotPredicate");
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
  });

  it("choice", () => {
    const expr = g.choice(g.id("id"), g.lit("+"));
    expect(expr.type).toBe("PrioritizedChoice");
    expect(expr.firstChoice).toEqual({
      type: "Identifier",
      name: "id",
      marker: undefined,
      as: undefined,
    });
    expect(expr.secondChoice).toEqual({
      type: "Literal",
      value: "+",
      as: undefined,
    });
  });

  it("sequence", () => {
    const expr = g.seq([g.id("x"), g.lit("+"), g.id("y")]);
    expect(expr.type).toBe("Sequence");
    expect(expr.expressions).toEqual([
      { type: "Identifier", name: "x", marker: undefined, as: undefined },
      { type: "Literal", value: "+", as: undefined },
      { type: "Identifier", name: "y", marker: undefined, as: undefined },
    ]);
  });

  it("definition", () => {
    const expr = g.def(g.id("definition"), g.id("x"));
    expect(expr.type).toBe("definition");
    expect(expr.identifier).toEqual({
      type: "Identifier",
      name: "definition",
      marker: undefined,
      as: undefined,
    });
    expect(expr.expression).toEqual({
      type: "Identifier",
      name: "x",
      marker: undefined,
      as: undefined,
    });
  });
});

describe("exprToString", () => {
  it.each([
    [g.id("id"), "id"],
    [g.lit("+"), '"+"'],
    [g.charClass([g.range("a", "z")]), "[a-z]"],
    [g.any(), "."],
    [g.grouping(g.seq([g.id("x"), g.lit("+"), g.id("y")])), '(x "+" y)'],
    [g.zeroOrMore(g.lit("0")), '"0"*'],
    [g.oneOrMore(g.lit("0")), '"0"+'],
    [g.opt(g.lit("0")), '"0"?'],
    [g.and(g.id("id")), "&id"],
    [g.not(g.id("id")), "!id"],
    [g.seq([g.id("x"), g.lit("+"), g.id("y")]), 'x "+" y'],
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
      'expr <- term ("+" term / "-" term);',
    ],
  ])("definition", (definition, expected) => {
    const actual = definitionToString(definition);

    expect(actual).toEqual(expected);
  });
});
