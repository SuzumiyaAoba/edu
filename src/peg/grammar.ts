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

export const literal = <Meta>(
  value: string,
  meta?: Meta,
): Literal<Meta> => {
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
export const anyChar = anyCharacter;

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

export const printExpr = <Meta>(expr: Expression<Meta>) => {
  switch (expr.type) {
    case "Identifier":
      print(expr.name);
      break;
    case "Literal":
      print(`"${expr.value}"`);
      break;
    case "CharacterClass":
      print(`[${expr.value}]`);
      break;
    case "AnyCharacter":
      print(".");
      break;
    case "PrioritizedChoice":
      printExpr(expr.firstChoice);
      print(" / ");
      printExpr(expr.secondChoice);
      break;
    case "ZeroOrMore":
      printExpr(expr.expression);
      print("*");
      break;
    case "OneOrMore":
      printExpr(expr.expression);
      print("+");
      break;
    case "Optional":
      printExpr(expr.expression);
      print("?");
      break;
    case "AndPredicate":
      print("&");
      printExpr(expr.expression);
      break;
    case "NotPredicate":
      print("!");
      printExpr(expr.expression);
      break;
    case "Sequence":
      if (expr.expressions.length === 1) {
        printExpr(expr.expressions[0]);
        return;
      }

      print("(");
      expr.expressions.forEach(printExpr);
      print(")");

      break;
  }
};
