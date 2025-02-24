import { escapeString } from "@/lexer/escape";
import type { NonEmptyTuple } from "type-fest";
import { print } from "../utils/io";

export type Grammar<Meta = unknown> = Definition<Meta>[];

export type WithMeta<T, Meta> = T & {};

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
    value: CharacterClassValue[];
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
export type AnyCharacter<META = unknown> = Ast<"AnyCharacter", META, unknown>;

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
    expressions: NonEmptyTuple<Expression<META>>;
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

export class PegGrammar<Meta> {
  definition(
    identifier: Identifier<Meta>,
    expression: Expression<Meta>,
  ): Definition<Meta> {
    return {
      type: "definition",
      identifier,
      expression,
    };
  }

  def = this.definition;

  identifier(name: string, meta?: Meta): Identifier<Meta> {
    return {
      type: "Identifier",
      name: name,
      meta,
    };
  }

  id = this.identifier;

  literal(value: string, meta?: Meta): Literal<Meta> {
    return {
      type: "Literal",
      value,
      meta,
    };
  }

  lit = this.literal;

  characterClass(
    value: CharacterClassValue[],
    meta?: Meta,
  ): CharacterClass<Meta> {
    return {
      type: "CharacterClass",
      value,
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

  anyCharacter(meta?: Meta): AnyCharacter<Meta> {
    return {
      type: "AnyCharacter",
      meta,
    };
  }

  any = this.anyCharacter;

  zeroOrMore(expression: Expression<Meta>, meta?: Meta): ZeroOrMore<Meta> {
    return {
      type: "ZeroOrMore",
      expression,
      meta,
    };
  }

  star = this.zeroOrMore;

  oneOrMore(expression: Expression<Meta>, meta?: Meta): OneOrMore<Meta> {
    return {
      type: "OneOrMore",
      expression,
      meta,
    };
  }

  plus = this.oneOrMore;

  grouping(expression: Expression<Meta>, meta?: Meta): Grouping<Meta> {
    return {
      type: "Grouping",
      expression,
      meta,
    };
  }

  group = this.grouping;

  optional(expression: Expression<Meta>, meta?: Meta): Optional<Meta> {
    return {
      type: "Optional",
      expression,
      meta,
    };
  }

  opt = this.optional;

  andPredicate(expression: Expression<Meta>, meta?: Meta): AndPredicate<Meta> {
    return {
      type: "AndPredicate",
      expression,
      meta,
    };
  }

  and = this.andPredicate;

  notPredicate(expression: Expression<Meta>, meta?: Meta): NotPredicate<Meta> {
    return {
      type: "NotPredicate",
      expression,
      meta,
    };
  }

  not = this.notPredicate;

  prioritizedChoice(
    firstChoice: Expression<Meta>,
    secondChoice: Expression<Meta>,
    meta?: Meta,
  ): PrioritizedChoice<Meta> {
    return {
      type: "PrioritizedChoice",
      firstChoice,
      secondChoice,
      meta,
    };
  }

  choice = this.prioritizedChoice;

  sequence(
    expressions: NonEmptyTuple<Expression<Meta>>,
    meta?: Meta,
  ): Sequence<Meta> {
    return {
      type: "Sequence",
      expressions,
      meta,
    };
  }

  seq = this.sequence;
}

export const printGrammar = <Meta>(grammar: Grammar<Meta>) => {
  print(grammerToString(grammar));
};

export const printDefinition = <Meta>(definition: Definition<Meta>) => {
  print(definitionToString(definition));
};

export const printExpr = <Meta>(expr: Expression<Meta>) => {
  print(exprToString(expr));
};

export const grammerToString = <Meta>(grammar: Grammar<Meta>): string => {
  return grammar.map(definitionToString).join("\n");
};

export const definitionToString = <Meta>({
  identifier,
  expression,
}: Definition<Meta>): string => {
  return `${exprToString(identifier)} <- ${exprToString(expression)};`;
};

export const exprToString = (expr: Expression<unknown>): string => {
  switch (expr.type) {
    case "Identifier":
      return expr.name;
    case "Literal":
      return `"${escapeString(expr.value)}"`;
    case "CharacterClass":
      return `[${expr.value.reduce((acc, elm) => {
        switch (elm.type) {
          case "char":
            return acc + escapeString(elm.value, true);
          case "range":
            return `${acc}${escapeString(elm.start, true)}-${escapeString(elm.stop, true)}`;
        }
      }, "")}]`;
    case "AnyCharacter":
      return ".";
    case "Grouping":
      return `(${exprToString(expr.expression)})`;
    case "PrioritizedChoice":
      return `(${exprToString(expr.firstChoice)} / ${exprToString(expr.secondChoice)})`;
    case "ZeroOrMore":
      return `${exprToString(expr.expression)}*`;
    case "OneOrMore":
      return `${exprToString(expr.expression)}+`;
    case "Optional":
      return `${exprToString(expr.expression)}?`;
    case "AndPredicate":
      return `&${exprToString(expr.expression)}`;
    case "NotPredicate":
      return `!${exprToString(expr.expression)}`;
    case "Sequence":
      if (expr.expressions.length === 1) {
        return exprToString(expr.expressions[0]);
      }

      return `(${expr.expressions.map(exprToString).join(" ")})`;
    default: {
      const _exhaustiveCheck: never = expr;
      throw new Error(`Unreachable: ${_exhaustiveCheck}`);
    }
  }
};
