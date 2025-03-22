import {
  type ParseResult,
  charClass,
  choice,
  lit,
  map,
  plus,
  seq,
  zeroOrMore,
} from "../core/parser";

export type ArithOp = "+" | "-" | "*" | "/";

export type Parser<T> = (input: string, index: number) => ParseResult<T>;

export interface ArithNode {
  type: "arith";
  op: ArithOp;
  left: ArithNode | number;
  right: ArithNode | number;
}

export function createArithNode(
  op: ArithOp,
  left: ArithNode | number,
  right: ArithNode | number,
): ArithNode {
  return {
    type: "arith",
    op,
    left,
    right,
  };
}

export const numberParser: Parser<number> = map(
  plus(charClass([["0", "9"]])),
  (digits) => Number.parseInt(digits.join(""), 10),
);

export const factorParser: Parser<ArithNode | number> = choice(
  map(seq(lit("("), exprParser, lit(")")), ([, expr]) => expr),
  numberParser,
);

export const termParser: Parser<ArithNode | number> = map(
  seq(factorParser, zeroOrMore(seq(choice(lit("*"), lit("/")), factorParser))),
  ([left, rest]) =>
    rest.reduce(
      (acc, [op, right]) => createArithNode(op as ArithOp, acc, right),
      left,
    ),
);

export function exprParser(
  input: string,
  index: number,
): ParseResult<ArithNode | number> {
  return map(
    seq(termParser, zeroOrMore(seq(choice(lit("+"), lit("-")), termParser))),
    ([left, rest]) =>
      rest.reduce(
        (acc, [op, right]) => createArithNode(op as ArithOp, acc, right),
        left,
      ),
  )(input, index);
}

export const arithParser = exprParser;
