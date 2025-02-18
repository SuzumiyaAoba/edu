import type { NonEmptyTuple } from "type-fest";
import { print } from "../utils/io";

export type Grammar<Meta = unknown> = Definition<Meta>[];

export type Definition<Meta = unknown> = {
  identifier: Identifier<Meta>;
  expression: Expression<Meta>;
};

export type Expression<Meta = unknown> =
  | Identifier<Meta>
  | Literal<Meta>
  | CharacterClass<Meta>
  | AnyCharacter<Meta>
  | Grouping<Meta>
  | Optional<Meta>
  | ZeroOrMore<Meta>
  | OneOrMore<Meta>
  | AndPredicate<Meta>
  | NotPredicate<Meta>
  | Sequence<Meta>
  | PrioritizedChoice<Meta>;

export type WithMeta<T, Meta> = T & {
  meta?: Meta | undefined;
};

/**
 * Identifier.
 */
export type Identifier<Meta = unknown> = WithMeta<
  {
    type: "Identifier";
    name: string;
  },
  Meta
>;

/**
 * Literal string.
 *
 * Operator: `' '` or `" "`
 */
export type Literal<Meta = unknown> = WithMeta<
  {
    type: "Literal";
    value: string;
  },
  Meta
>;

/**
 * Character class.
 *
 * Operator: `[ ]`
 */
export type CharacterClass<Meta = unknown> = WithMeta<
  {
    type: "CharacterClass";
    value: string;
  },
  Meta
>;

/**
 * Any character.
 *
 * Operator: `.`
 */
export type AnyCharacter<Meta = unknown> = WithMeta<
  {
    type: "AnyCharacter";
  },
  Meta
>;

/**
 * Grouping.
 *
 * Operator: `(e)`
 */
export type Grouping<Meta = unknown> = WithMeta<
  {
    type: "Grouping";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * Optional.
 *
 * Operator: `e?`
 */
export type Optional<Meta = unknown> = WithMeta<
  {
    type: "Optional";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * Zero-or-more.
 *
 * Operator: `𝑒*`
 */
export type ZeroOrMore<Meta = unknown> = WithMeta<
  {
    type: "ZeroOrMore";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * One-or-more.
 *
 * Operator: `𝑒+`
 */
export type OneOrMore<Meta = unknown> = WithMeta<
  {
    type: "OneOrMore";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * And-predicate.
 *
 * Operator: `&𝑒`
 */
export type AndPredicate<Meta = unknown> = WithMeta<
  {
    type: "AndPredicate";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * Not-predicate.
 *
 * Operator: `!𝑒`
 */
export type NotPredicate<Meta = unknown> = WithMeta<
  {
    type: "NotPredicate";
    expression: Expression<Meta>;
  },
  Meta
>;

/**
 * Sequence.
 *
 * Operator: `𝑒₁ 𝑒₂`
 */
export type Sequence<Meta = unknown> = WithMeta<
  {
    type: "Sequence";
    expressions: NonEmptyTuple<Expression<Meta>>;
  },
  Meta
>;

/**
 * Prioritized Choice.
 *
 * Operator: `𝑒₁ / 𝑒₂`
 */
export type PrioritizedChoice<Meta = unknown> = WithMeta<
  {
    type: "PrioritizedChoice";
    firstChoice: Expression<Meta>;
    secondChoice: Expression<Meta>;
  },
  Meta
>;

export const definition = <Meta>(
  identifier: Identifier<Meta>,
  expression: Expression<Meta>,
): Definition<Meta> => {
  return {
    identifier,
    expression,
  };
};

export const def = definition;

export const identifier = <Meta>(
  name: string,
  meta?: Meta,
): Identifier<Meta> => {
  return {
    type: "Identifier",
    name: name,
    meta,
  };
};

/** Alias for `identifier`. */
export const id = identifier;

export const literal = <Meta>(value: string, meta?: Meta): Literal<Meta> => {
  return {
    type: "Literal",
    value,
    meta,
  };
};

/** Alias for `literal`. */
export const lit = literal;

export const characterClass = <Meta>(
  value: string,
  meta?: Meta,
): CharacterClass<Meta> => {
  return {
    type: "CharacterClass",
    value,
    meta,
  };
};

/** Alias for `characterClass`. */
export const charClass = characterClass;

export const anyCharacter = <Meta = unknown>(
  meta?: Meta,
): AnyCharacter<Meta> => {
  return {
    type: "AnyCharacter",
    meta,
  };
};

/** Alias for `anyCharacter`. */
export const any = anyCharacter;

export const zeroOrMore = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): ZeroOrMore<Meta> => {
  return {
    type: "ZeroOrMore",
    expression,
    meta,
  };
};

/** Alias for `zeroOrMore`. */
export const star = zeroOrMore;

export const oneOrMore = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): OneOrMore<Meta> => {
  return {
    type: "OneOrMore",
    expression,
    meta,
  };
};

/** Alias for `oneOrMore`. */
export const plus = oneOrMore;

export const grouping = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): Grouping<Meta> => {
  return {
    type: "Grouping",
    expression,
    meta,
  };
};

export const group = grouping;

export const optional = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): Optional<Meta> => {
  return {
    type: "Optional",
    expression,
    meta,
  };
};

/** Alias for `optional`. */
export const opt = optional;

export const andPredicate = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): AndPredicate<Meta> => {
  return {
    type: "AndPredicate",
    expression,
    meta,
  };
};

/** Alias for `andPredicate`. */
export const and = andPredicate;

export const notPredicate = <Meta>(
  expression: Expression<Meta>,
  meta?: Meta,
): NotPredicate<Meta> => {
  return {
    type: "NotPredicate",
    expression,
    meta,
  };
};

/** Alias for `notPredicate`. */
export const not = notPredicate;

export const prioritizedChoice = <Meta>(
  firstChoice: Expression<Meta>,
  secondChoice: Expression<Meta>,
  meta?: Meta,
): PrioritizedChoice<Meta> => {
  return {
    type: "PrioritizedChoice",
    firstChoice,
    secondChoice,
    meta,
  };
};

/** Alias for `prioritizedChoice`. */
export const choice = prioritizedChoice;

export const sequence = <Meta>(
  expressions: NonEmptyTuple<Expression<Meta>>,
  meta?: Meta,
): Sequence<Meta> => {
  return {
    type: "Sequence",
    expressions,
    meta,
  };
};

/** Alias for `sequence`. */
export const seq = sequence;

export const printGrammar = <Meta>(grammar: Grammar<Meta>) => {
  print(grammerToString(grammar));
};

export const printDefinition = <Meta>({
  identifier,
  expression,
}: Definition<Meta>) => {
  print(definitionToString({ identifier, expression }));
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
      return JSON.stringify(expr.value);
    case "CharacterClass":
      return `[${expr.value}]`;
    case "AnyCharacter":
      return ".";
    case "Grouping":
      return `(${exprToString(expr.expression)})`;
    case "PrioritizedChoice":
      return `${exprToString(expr.firstChoice)} / ${exprToString(expr.secondChoice)}`;
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

      return `${expr.expressions.map(exprToString).join(" ")}`;
    default: {
      const _exhaustiveCheck: never = expr;
      throw new Error(`Unreachable: ${_exhaustiveCheck}`);
    }
  }
};
