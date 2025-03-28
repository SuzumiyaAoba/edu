import { describe, expect, it } from "bun:test";
import { PegGrammar } from "@/core/ast";
import type { Environment } from "@/core/eval";
import * as sut from "@/core/eval";

const g = new PegGrammar();

describe("acceptedByExpression", () => {
  it.each([
    [g.id("literal"), "literal", "literal".length],
    [g.lit("literal"), "literal", "literal".length],
    [g.lit("prefix"), "prefix-", "prefix".length],
    [g.lit("no-match"), "literal", undefined],
    [g.any(), "a", "a".length],
    [g.charClass([g.char("a")]), "a", "a".length],
    [g.charClass([g.char("a")]), "ab", "a".length],
    [g.charClass([g.range("a", "z")]), "e", "e".length],
    [g.opt(g.lit("a")), "b", 0],
    [g.opt(g.lit("a")), "a", "a".length],
    [g.and(g.lit("a")), "ab", 0],
    [g.and(g.lit("b")), "ab", undefined],
    [g.not(g.lit("a")), "ab", undefined],
    [g.not(g.lit("b")), "ab", 0],
    [g.seq([g.lit("a"), g.lit("b")]), "ab", "ab".length],
    [g.seq([g.lit("a"), g.lit("b")]), "ac", undefined],
    [g.choice(g.lit("a"), g.lit("b")), "a", "a".length],
    [g.choice(g.lit("a"), g.lit("b")), "b", "b".length],
    [g.choice(g.lit("a"), g.lit("b")), "c", undefined],
  ])("find", (expr, input, expected) => {
    const env: Environment = {
      literal: g.lit("literal"),
    };

    const actual = sut.acceptedByExpression(env, expr, input);

    expect(actual === expected).toBeTrue();
  });
});
