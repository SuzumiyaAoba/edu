import { escapeString } from "@/compiler/escape";
import { print } from "@/core/utils/io";
import { logger } from "@/core/utils/logger";
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
    value: readonly CharacterClassValue[];
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

  identifier(name: string, meta?: META): Identifier<META> {
    return {
      type: "Identifier",
      name: name,
      meta,
    };
  }

  id = this.identifier;

  literal(value: string, meta?: META): Literal<META> {
    return {
      type: "Literal",
      value,
      meta,
    };
  }

  lit = this.literal;

  characterClass(
    value: CharacterClassValue[],
    meta?: META,
  ): CharacterClass<META> {
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

  anyCharacter(meta?: META): AnyCharacter<META> {
    return {
      type: "AnyCharacter",
      meta,
    };
  }

  any = this.anyCharacter;

  zeroOrMore(expression: Expression<META>, meta?: META): ZeroOrMore<META> {
    return {
      type: "ZeroOrMore",
      expression,
      meta,
    };
  }

  star = this.zeroOrMore;

  oneOrMore(expression: Expression<META>, meta?: META): OneOrMore<META> {
    return {
      type: "OneOrMore",
      expression,
      meta,
    };
  }

  plus = this.oneOrMore;

  grouping(expression: Expression<META>, meta?: META): Grouping<META> {
    return {
      type: "Grouping",
      expression,
      meta,
    };
  }

  group = this.grouping;

  optional(expression: Expression<META>, meta?: META): Optional<META> {
    return {
      type: "Optional",
      expression,
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

export const printGrammar = <META>(grammar: Grammar<META>) => {
  print(grammerToString(grammar));
};

export const printDefinition = <META>(definition: Definition<META>) => {
  print(definitionToString(definition));
};

export const printExpr = <META>(expr: Expression<META>) => {
  print(exprToString(expr));
};

export const grammerToString = <META>(grammar: Grammar<META>): string => {
  return grammar.map(definitionToString).join("\n");
};

export const definitionToString = <META>({
  identifier,
  expression,
}: Definition<META>): string => {
  return `${exprToString(identifier)} <- ${exprToString(expression)};`;
};

export const exprToString = (
  expr: Expression<unknown>,
  group = false,
): string => {
  logger.trace(expr);

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
      return `(${exprToString(expr.expression, false)})`;
    case "PrioritizedChoice": {
      const str = `${exprToString(expr.firstChoice, false)} / ${exprToString(expr.secondChoice, false)}`;
      return group ? `(${str})` : str;
    }
    case "ZeroOrMore":
      return `${exprToString(expr.expression, true)}*`;
    case "OneOrMore":
      return `${exprToString(expr.expression, true)}+`;
    case "Optional":
      return `${exprToString(expr.expression, true)}?`;
    case "AndPredicate":
      return `&${exprToString(expr.expression, true)}`;
    case "NotPredicate":
      return `!${exprToString(expr.expression, true)}`;
    case "Sequence": {
      if (expr.expressions.length === 1) {
        return exprToString(expr.expressions[0], true);
      }

      const str = expr.expressions
        .map((expr) => exprToString(expr, true))
        .join(" ");

      return group ? `(${str})` : str;
    }
    default: {
      const exhaustiveCheck: never = expr;
      throw new Error(`Unreachable: ${exhaustiveCheck}`);
    }
  }
};
