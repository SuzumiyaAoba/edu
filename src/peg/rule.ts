import type { NonEmptyTuple } from "type-fest";
import { print } from "../utils/io";

export type Rule = {
  lhs: RuleLhs;
  rhs: RuleRhs;
};

export type RuleLhs = Identifier;
export type RuleRhs = Expr;

export type Expr =
  | Identifier
  | Literal
  | CharClass
  | WildCard
  | Choice
  | Repeat
  | OneOrMore
  | Optional
  | PositiveLookahead
  | NegativeLookahead
  | Sequence;

export type Identifier = {
  type: "Identifier";
  value: string;
};

export type Literal = {
  type: "Literal";
  value: string;
};

export type CharClass = {
  type: "CharClass";
  value: string;
};

export type WildCard = {
  type: "WildCard";
};

export type Choice = {
  type: "Choice";
  lhs: Expr;
  rhs: Expr;
};

export type Repeat = {
  type: "Repeat";
  expr: Expr;
};

export type OneOrMore = {
  type: "OneOrMore";
  expr: Expr;
};

export type Optional = {
  type: "Optional";
  expr: Expr;
};

export type PositiveLookahead = {
  type: "PositiveLookahead";
  expr: Expr;
};

export type NegativeLookahead = {
  type: "NegativeLookahead";
  expr: Expr;
};

export type Sequence = {
  type: "Sequence";
  exprs: NonEmptyTuple<Expr>;
};

export const id = (value: string): Identifier => {
  return {
    type: "Identifier",
    value,
  };
};

export const lit = (value: string): Literal => {
  return {
    type: "Literal",
    value,
  };
};

export const charClass = (value: string): CharClass => {
  return {
    type: "CharClass",
    value,
  };
};

export const whildCard = (): WildCard => {
  return {
    type: "WildCard",
  };
};

export const choice = (lhs: Expr, rhs: Expr): Choice => {
  return {
    type: "Choice",
    lhs,
    rhs,
  };
};

export const oneOrMore = (expr: Expr): OneOrMore => {
  return {
    type: "OneOrMore",
    expr,
  };
};

export const opt = (expr: Expr): Optional => {
  return {
    type: "Optional",
    expr,
  };
};

export const posLA = (expr: Expr): PositiveLookahead => {
  return {
    type: "PositiveLookahead",
    expr,
  };
};

export const negLA = (expr: Expr): NegativeLookahead => {
  return {
    type: "NegativeLookahead",
    expr,
  };
};

export const printExpr = (expr: Expr) => {
  switch (expr.type) {
    case "Identifier":
      print(expr.value);
      break;
    case "Literal":
      print(`"${expr.value}"`);
      break;
    case "CharClass":
      print(`[${expr.value}]`);
      break;
    case "WildCard":
      print(".");
      break;
    case "Choice":
      printExpr(expr.lhs);
      print(" / ");
      printExpr(expr.rhs);
      break;
    case "Repeat":
      printExpr(expr.expr);
      print("*");
      break;
    case "OneOrMore":
      printExpr(expr.expr);
      print("+");
      break;
    case "Optional":
      printExpr(expr.expr);
      print("?");
      break;
    case "PositiveLookahead":
      print("&");
      printExpr(expr.expr);
      break;
    case "NegativeLookahead":
      print("!");
      printExpr(expr.expr);
      break;
    case "Sequence":
      if (expr.exprs.length === 1) {
        printExpr(expr.exprs[0]);
        return;
      }

      print("(");
      expr.exprs.forEach(printExpr);
      print(")");

      break;
  }
};
