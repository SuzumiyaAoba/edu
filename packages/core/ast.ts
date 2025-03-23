import type { ReadOnlyNonEmptyArray } from "@/libs/std/array";

export type Grammar<META = unknown> = Definition<META>[];

type Ast<TYPE, META, P> = {
  type: TYPE;
  meta?: META | undefined;
} & P;

export type Definition<META = unknown> = Ast<
  "definition",
  META,
  {
    identifier: Identifier<META>;
    expression: Expression<META>;
  }
>;

export type Expression<META = unknown> =
  | Identifier<META>
  | Literal<META>
  | CharacterClass<META>
  | AnyCharacter<META>
  | Grouping<META>
  | Optional<META>
  | ZeroOrMore<META>
  | OneOrMore<META>
  | AndPredicate<META>
  | NotPredicate<META>
  | Sequence<META>
  | PrioritizedChoice<META>;

/**
 * Identifier.
 */
export type Identifier<META = unknown> = Ast<
  "Identifier",
  META,
  {
    name: string;
    as: string | undefined;
  }
>;

/**
 * Literal string.
 *
 * Operator: `' '` or `" "`
 */
export type Literal<META = unknown> = Ast<
  "Literal",
  META,
  {
    value: string;
    as: string | undefined;
  }
>;

/**
 * Character class.
 *
 * Operator: `[ ]`
 */
export type CharacterClass<META = unknown> = Ast<
  "CharacterClass",
  META,
  {
    value: readonly CharacterClassValue[];
    as: string | undefined;
  }
>;

export type CharacterClassValue = Char | Range;

export type Char = {
  type: "char";
  value: string;
};

export type Range = {
  type: "range";
  start: string;
  stop: string;
};

/**
 * Any character.
 *
 * Operator: `.`
 */
export type AnyCharacter<META = unknown> = Ast<
  "AnyCharacter",
  META,
  {
    as: string | undefined;
  }
>;

/**
 * Grouping.
 *
 * Operator: `(e)`
 */
export type Grouping<META = unknown> = Ast<
  "Grouping",
  META,
  {
    expression: Expression<META>;
    as: string | undefined;
  }
>;

/**
 * Optional.
 *
 * Operator: `e?`
 */
export type Optional<META = unknown> = Ast<
  "Optional",
  META,
  {
    expression: Expression<META>;
    as: string | undefined;
  }
>;

/**
 * Zero-or-more.
 *
 * Operator: `𝑒*`
 */
export type ZeroOrMore<META = unknown> = Ast<
  "ZeroOrMore",
  META,
  {
    expression: Expression<META>;
    as: string | undefined;
  }
>;

/**
 * One-or-more.
 *
 * Operator: `𝑒+`
 */
export type OneOrMore<META = unknown> = Ast<
  "OneOrMore",
  META,
  {
    expression: Expression<META>;
    as: string | undefined;
  }
>;

/**
 * And-predicate.
 *
 * Operator: `&𝑒`
 */
export type AndPredicate<META = unknown> = Ast<
  "AndPredicate",
  META,
  {
    expression: Expression<META>;
  }
>;

/**
 * Not-predicate.
 *
 * Operator: `!𝑒`
 */
export type NotPredicate<META = unknown> = Ast<
  "NotPredicate",
  META,
  {
    expression: Expression<META>;
  }
>;

/**
 * Sequence.
 *
 * Operator: `𝑒₁ 𝑒₂`
 */
export type Sequence<META = unknown> = Ast<
  "Sequence",
  META,
  {
    expressions: ReadOnlyNonEmptyArray<Expression<META>>;
  }
>;

/**
 * Prioritized Choice.
 *
 * Operator: `𝑒₁ / 𝑒₂`
 */
export type PrioritizedChoice<META = unknown> = Ast<
  "PrioritizedChoice",
  META,
  {
    firstChoice: Expression<META>;
    secondChoice: Expression<META>;
  }
>;

export class PegGrammar<META> {
  definition(
    identifier: Identifier<META>,
    expression: Expression<META>,
  ): Definition<META> {
    return {
      type: "definition",
      identifier,
      expression,
    };
  }

  def = this.definition;

  identifier(
    name: string,
    as?: string | undefined,
    meta?: META,
  ): Identifier<META> {
    return {
      type: "Identifier",
      name,
      as,
      meta,
    };
  }

  id = this.identifier;

  literal(value: string, as?: string | undefined, meta?: META): Literal<META> {
    return {
      type: "Literal",
      value,
      as,
      meta,
    };
  }

  lit = this.literal;

  characterClass(
    value: CharacterClassValue[],
    as?: string | undefined,
    meta?: META,
  ): CharacterClass<META> {
    return {
      type: "CharacterClass",
      value,
      as,
      meta,
    };
  }

  charClass = this.characterClass;

  char(value: string): Char {
    return {
      type: "char",
      value,
    };
  }

  charClassRange(start: string, stop: string): Range {
    return {
      type: "range",
      start,
      stop,
    };
  }

  range = this.charClassRange;

  anyCharacter(as?: string | undefined, meta?: META): AnyCharacter<META> {
    return {
      type: "AnyCharacter",
      as,
      meta,
    };
  }

  any = this.anyCharacter;

  zeroOrMore(
    expression: Expression<META>,
    as?: string | undefined,
    meta?: META,
  ): ZeroOrMore<META> {
    return {
      type: "ZeroOrMore",
      expression,
      as,
      meta,
    };
  }

  star = this.zeroOrMore;

  oneOrMore(
    expression: Expression<META>,
    as?: string | undefined,
    meta?: META,
  ): OneOrMore<META> {
    return {
      type: "OneOrMore",
      expression,
      as,
      meta,
    };
  }

  plus = this.oneOrMore;

  grouping(
    expression: Expression<META>,
    as?: string | undefined,
    meta?: META,
  ): Grouping<META> {
    return {
      type: "Grouping",
      expression,
      as,
      meta,
    };
  }

  group = this.grouping;

  optional(
    expression: Expression<META>,
    as?: string | undefined,
    meta?: META,
  ): Optional<META> {
    return {
      type: "Optional",
      expression,
      as,
      meta,
    };
  }

  opt = this.optional;

  andPredicate(expression: Expression<META>, meta?: META): AndPredicate<META> {
    return {
      type: "AndPredicate",
      expression,
      meta,
    };
  }

  and = this.andPredicate;

  notPredicate(expression: Expression<META>, meta?: META): NotPredicate<META> {
    return {
      type: "NotPredicate",
      expression,
      meta,
    };
  }

  not = this.notPredicate;

  prioritizedChoice(
    firstChoice: Expression<META>,
    secondChoice: Expression<META>,
    meta?: META,
  ): PrioritizedChoice<META> {
    return {
      type: "PrioritizedChoice",
      firstChoice,
      secondChoice,
      meta,
    };
  }

  choice = this.prioritizedChoice;

  sequence(
    expressions: ReadOnlyNonEmptyArray<Expression<META>>,
    meta?: META,
  ): Sequence<META> {
    return {
      type: "Sequence",
      expressions,
      meta,
    };
  }

  seq = this.sequence;
}
