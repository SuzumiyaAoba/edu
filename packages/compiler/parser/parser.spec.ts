import { describe, expect, it } from "bun:test";
import { Parser } from "@/compiler/parser/parser";
import { Tokens } from "@/compiler/token";
import type { TokenWith } from "@/compiler/token";
import { PegGrammar } from "@/core/grammar";
import type { Expression } from "@/core/grammar";

type Meta = unknown;

const t = new Tokens<Meta>();
const g = new PegGrammar<Meta>();

const sut = new Parser<Meta>();

describe("parseExpression", () => {
  it.each([
    [
      // id;
      [t.identifier("id", undefined)],
      {
        expression: g.id("id"),
        cursor: 2,
      },
    ],
    [
      // "literal";
      [t.literal("literal", undefined)],
      {
        expression: g.lit("literal"),
        cursor: 2,
      },
    ],
    [
      // [a];
      [t.charClass(["a"], undefined)],
      {
        expression: g.charClass([g.char("a")]),
        cursor: 2,
      },
    ],
    [
      [
        // [a-z];
        t.charClass([t.range(["a", "z"], undefined).token], undefined),
      ],
      {
        expression: g.charClass([g.range("a", "z")]),
        cursor: 2,
      },
    ],
    [
      // "a" / "b";
      [
        t.literal("a", undefined),
        t.slash(undefined),
        t.literal("b", undefined),
      ],
      {
        expression: g.choice(g.lit("a"), g.lit("b")),
        cursor: 4,
      },
    ],
    [
      // &"x";
      [t.and(undefined), t.literal("x", undefined)],
      {
        expression: g.and(g.lit("x")),
        cursor: 3,
      },
    ],
    [
      // !"x";
      [t.not(undefined), t.literal("x", undefined)],
      {
        expression: g.not(g.lit("x")),
        cursor: 3,
      },
    ],
    [
      // "x"?;
      [t.literal("x", undefined), t.question(undefined)],
      {
        expression: g.opt(g.lit("x")),
        cursor: 3,
      },
    ],
    [
      [
        // "x"*;
        t.literal("x", undefined),
        t.star(undefined),
      ],
      {
        expression: g.star(g.lit("x")),
        cursor: 3,
      },
    ],
    [
      [
        // "x"+;
        t.literal("x", undefined),
        t.plus(undefined),
      ],
      {
        expression: g.plus(g.lit("x")),
        cursor: 3,
      },
    ],
    [
      [
        // "x" "y";
        t.open(undefined),
        t.literal("x", undefined),
        t.literal("y", undefined),
        t.close(undefined),
      ],
      {
        expression: g.seq([g.lit("x"), g.lit("y")]),
        cursor: 5,
      },
    ],
    [
      // .;
      [t.dot(undefined)],
      {
        expression: g.any(),
        cursor: 2,
      },
    ],
  ] as Array<
    [TokenWith<unknown>[], { expression: Expression<unknown>; cursor: number }]
  >)("[%#] simple tokens", (tokens, expected) => {
    const actual = sut.parseExpression([...tokens, t.semicolon(undefined)]);

    expect(actual).toEqual(expected);
  });
});
