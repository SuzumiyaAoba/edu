import { escapeString } from "@/compiler/escape";
import type { Definition, Expression, Grammar } from "./ast";
import { print } from "./utils/io";
import { logger } from "./utils/logger";

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

export const definitionToString = <META>({
  identifier,
  expression,
}: Definition<META>): string => {
  return `${exprToString(identifier)} <- ${exprToString(expression)};`;
};

export const grammarToString = <META>(grammar: Grammar<META>): string => {
  return grammar.map(definitionToString).join("\n");
};

export const printGrammar = <META>(grammar: Grammar<META>) => {
  print(grammarToString(grammar));
};

export const printDefinition = <META>(definition: Definition<META>) => {
  print(definitionToString(definition));
};

export const printExpr = <META>(expr: Expression<META>) => {
  print(exprToString(expr));
};
