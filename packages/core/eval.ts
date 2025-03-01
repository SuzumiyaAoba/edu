import type { Expression, Grammar } from "@/core/grammar";
import { PegGrammar, printExpr } from "@/core/grammar";
import { print } from "./utils/io";

const g = new PegGrammar();

type DefinitionMap<Meta = unknown> = Record<string, Expression<Meta>>;
export type Environment<Meta = unknown> = DefinitionMap<Meta>;

export const toDefinitionMap = <Meta>(grammar: Grammar<Meta>) => {
  const definitionMap: DefinitionMap<Meta> = {};

  for (const definition of grammar) {
    const key = definition.identifier.name;
    if (definitionMap[key]) {
      throw new Error(`Duplicated definition: ${key}`);
    }

    definitionMap[key] = definition.expression;
  }

  return definitionMap;
};

export const acceptedByExpression = <Meta>(
  env: Environment<Meta>,
  expr: Expression<Meta>,
  input: string,
  current = 0,
  depth = 0,
): number | undefined => {
  if (current >= input.length) {
    return current;
  }

  print(input[current] ?? "");
  print(" ");
  print(current.toString());
  print(" ");
  print(depth.toString());
  print(" ");
  for (let i = 0; i < depth; i++) {
    print(" ");
  }
  print(expr.type);
  print(": ");
  printExpr(expr);
  print("\n");

  const { type } = expr;
  switch (type) {
    case "Identifier": {
      const next = env[expr.name];
      if (!next) {
        throw new Error(`Unknown identifier: ${expr.name}`);
      }
      return acceptedByExpression(env, next, input, current, depth + 1);
    }
    case "Literal": {
      const literal = expr.value;

      for (let i = 0; i < literal.length; i++) {
        if (input.charAt(current + i) !== literal.charAt(i)) {
          return undefined;
        }
      }

      return current + literal.length;
    }
    case "AnyCharacter":
      return current + 1;
    case "CharacterClass": {
      const charClass = expr.value;
      const find = charClass.some((value) => {
        const char = input.charAt(current);
        switch (value.type) {
          case "char":
            return value.value === char;
          case "range":
            return value.start <= char && char <= value.stop;
        }
      });

      return find ? current + 1 : undefined;
    }
    case "Grouping": {
      const grouping = expr.expression;

      return acceptedByExpression(env, grouping, input, current, depth + 1);
    }
    case "Optional": {
      const optional = expr.expression;
      const tryResult = acceptedByExpression(env, optional, input, current, depth + 1);

      return tryResult ?? current;
    }
    case "ZeroOrMore": {
      const zeroOrMore = expr.expression;
      const tryResult = acceptedByExpression(
        env,
        g.oneOrMore(zeroOrMore),
        input,
        current + 1,
        depth + 1,
      );

      return tryResult ?? current;
    }
    case "OneOrMore": {
      const oneOrMore = expr.expression;

      let eager = acceptedByExpression(env, oneOrMore, input, current, depth + 1);
      while (eager) {
        const tryResult = acceptedByExpression(env, oneOrMore, input, eager, depth + 1);
        if (!tryResult) {
          break;
        }

        eager = tryResult;
      }

      return eager;
    }
    case "AndPredicate": {
      const andPredicate = expr.expression;

      const tryResult = acceptedByExpression(env, andPredicate, input, current, depth + 1);

      return tryResult ? current : undefined;
    }
    case "NotPredicate": {
      const notPredicate = expr.expression;

      const tryResult = acceptedByExpression(env, notPredicate, input, current, depth + 1);

      return tryResult ? undefined : current;
    }
    case "Sequence": {
      const sequence = expr.expressions;

      let retval: number | undefined = current;
      for (const expr of sequence) {
        if (retval === undefined) {
          return undefined;
        }

        retval = acceptedByExpression(env, expr, input, retval, depth + 1);
      }

      return retval;
    }
    case "PrioritizedChoice": {
      const { firstChoice, secondChoice } = expr;

      const firstResult = acceptedByExpression(
        env,
        firstChoice,
        input,
        current,
        depth + 1
      );
      if (firstResult) {
        return firstResult;
      }

      return acceptedByExpression(env, secondChoice, input, current, depth + 1);
    }
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unreachable: ${exhaustiveCheck}`);
    }
  }
};

const acceptedBy = <Meta>(
  definitionMap: DefinitionMap<Meta>,
  entryPoint: string,
  input: string,
): boolean => {
  const exprs = definitionMap[entryPoint];

  if (exprs) {
    throw new Error(`Unknown identifier: ${entryPoint}`);
  }

  // TODO

  return false;
};

export const accept = <Meta>(
  grammar: Grammar<Meta>,
  input: string,
  entryPointId = "Grammar",
): boolean => {
  const definitionMap = toDefinitionMap(grammar);

  return acceptedBy(definitionMap, entryPointId, input);
};
