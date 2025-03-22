import {
  type NonEmptyArray,
  isEmptyArray,
  isNonEmptyArray,
} from "@/libs/std/array";

export type ParseResult<T> =
  | {
      success: true;
      value: T;
      next: number;
    }
  | {
      success: false;
      error: ParseError;
    };

export interface ParseError {
  message: string;
  index: number;
}

export type Parser<T> = (input: string, index: number) => ParseResult<T>;

export const literal =
  <T extends string>(str: T): Parser<T> =>
  (input, index) =>
    input.startsWith(str, index)
      ? { success: true, value: str, next: index + str.length }
      : {
          success: false,
          error: { message: `Expected "${str}"`, index },
        };

export const lit = literal;

export const charClass =
  (charOrRanges: (string | [string, string])[]): Parser<string> =>
  (input, index) => {
    const char = input[index];
    if (!char) {
      return {
        success: false,
        error: { message: "Unexpected EOF", index },
      };
    }

    for (const charOrRange of charOrRanges) {
      if (typeof charOrRange === "string") {
        if (char === charOrRange) {
          return {
            success: true,
            value: char,
            next: index + 1,
          };
        }
      } else {
        const [start, stop] = charOrRange;
        if (start <= char && char <= stop) {
          return {
            success: true,
            value: char,
            next: index + 1,
          };
        }
      }
    }

    return {
      success: false,
      error: { message: `Expected "${charOrRanges}"`, index },
    };
  };

export const anyChar = (): Parser<string> => (input, index) => {
  const char = input[index];
  if (!char) {
    return {
      success: false,
      error: {
        message: "Unexpected EOF",
        index: index,
      },
    };
  }

  return {
    success: true,
    value: char,
    next: index + 1,
  };
};

export const any = anyChar;

export const sequence =
  <P extends Parser<unknown>[]>(
    ...parsers: P
  ): Parser<{ [K in keyof P]: P[K] extends Parser<infer T> ? T : never }> =>
  (input, index) => {
    const values: unknown[] = [];
    let currentIndex = index;
    for (const parser of parsers) {
      const result = parser(input, currentIndex);
      if (!result.success) {
        return result;
      }
      values.push(result.value);
      currentIndex = result.next;
    }

    return { success: true, value: values as never, next: currentIndex };
  };

export const seq = sequence;

export const choice =
  <T extends unknown[]>(
    ...parsers: { [K in keyof T]: Parser<T[K]> }
  ): Parser<T[number]> =>
  (input, index) => {
    for (const parser of parsers) {
      const result = parser(input, index);
      if (result.success) {
        return result;
      }
    }

    return {
      success: false,
      error: {
        message: `Expected one of: ${parsers
          .map((_, i) => `choice ${i + 1}`)
          .join(", ")}`,
        index,
      },
    };
  };

export const optional =
  <T>(parser: Parser<T>): Parser<[T] | []> =>
  (input, index) => {
    const result = parser(input, index);
    if (result.success) {
      return { success: true, value: [result.value], next: result.next };
    }

    return {
      success: true,
      value: [],
      next: index,
    };
  };

export const opt = optional;

export const zeroOrMore =
  <T>(parser: Parser<T>): Parser<T[]> =>
  (input, index) => {
    const results: T[] = [];
    let currentIndex = index;
    let result = parser(input, currentIndex);
    while (result.success && currentIndex < input.length) {
      currentIndex = result.next;

      results.push(result.value);
      result = parser(input, currentIndex);
    }

    return {
      success: true,
      value: results,
      next: currentIndex,
    };
  };

export const star = zeroOrMore;

export const oneOrMore =
  <T>(parser: Parser<T>): Parser<NonEmptyArray<T>> =>
  (input, index) => {
    const results = zeroOrMore(parser)(input, index);
    if (results.success) {
      const value = results.value;
      if (isNonEmptyArray(value)) {
        return { ...results, value };
      }
    }

    return {
      success: false,
      error: { message: "Expected at least one", index },
    };
  };

export const plus = oneOrMore;

export const andPredicate =
  <T>(parser: Parser<T>): Parser<never> =>
  (input, index) => {
    const result = parser(input, index);
    if (!result.success) {
      return {
        success: false,
        error: {
          message: "And-predicate did not match",
          index,
        },
      };
    }

    return {
      success: true,
      value: undefined as never,
      next: index,
    };
  };

export const and = andPredicate;

export const notPredicate =
  <T>(parser: Parser<T>): Parser<never> =>
  (input, index) => {
    const result = parser(input, index);
    if (!result.success) {
      return {
        success: true,
        value: undefined as never,
        next: index,
      };
    }

    return {
      success: false,
      error: {
        message: "Not-predicate matched",
        index,
      },
    };
  };

export const not = notPredicate;

export const map =
  <T, U>(parser: Parser<T>, f: (value: T) => U): Parser<U> =>
  (input, index) => {
    const result = parser(input, index);
    return result.success ? { ...result, value: f(result.value) } : result;
  };

export const ignore =
  (parser: Parser<unknown>): Parser<never> =>
  (input, index) => {
    const result = parser(input, index);
    return result.success
      ? { success: true, value: undefined as never, next: result.next }
      : result;
  };
