import { type Escapable, unescapeChar } from "@/compiler/escape";
import { octalDigitToChar } from "@/libs/octal";
import { isEmptyArray } from "@/libs/std/array";
import { type Expression, PegGrammar } from "./ast";
import {
  type Parser,
  any,
  charClass,
  choice,
  lit,
  map,
  not,
  oneOrMore,
  opt,
  seq,
  zeroOrMore,
} from "./parser";

const g = new PegGrammar();

/**
 * ```txt
 * EndOfFile <- !.;
 * ```
 */
export const endOfFile: Parser<string> = not(any());

/**
 * ```txt
 * EndOfLine <- '\r\n' / '\n' / '\r';
 * ```
 */
export const endOfLine = choice(lit("\r\n"), lit("\n"), lit("\r"));

/**
 * ```txt
 * Space <- ' ' / '\t' / EndOfLine;
 * ```
 */
export const space = choice(lit(" "), lit("\t"), endOfLine);

/**
 * ```txt
 * Comment <- "--" (!EndOfLine .)* EndOfLine;
 * ```
 */
export const comment: Parser<string> = map(
  seq(
    lit("--"),
    zeroOrMore(map(seq(not(endOfLine), any()), ([, char]) => char)),
    endOfLine,
  ),
  ($) => $[1].join(""),
);

/**
 * ```txt
 * Spacing <- (Space / Comment)*;
 * ```
 */
export const spacing: Parser<string[]> = zeroOrMore(choice(space, comment));

/**
 * ```txt
 * BindStart <- [a-zA-Z_];
 * ```
 */
export const bindStart = charClass([["a", "z"], ["A", "Z"], "_"]);

/**
 * ```txt
 * BindCont <- BindStart / [0-9];
 * ```
 */
export const bindCont = choice(bindStart, charClass([["0", "9"]]));

/**
 * ```txt
 * Bind <- BindStart BindCont* Spacing;
 * ```
 */
export const bind = map(
  seq(bindStart, zeroOrMore(bindCont), spacing),
  ($) => $[0] + $[1].join(""),
);

/**
 * ```txt
 * Bindable <- ("$" bind)?
 */
export const bindable = opt(map(seq(lit("$"), bind), ($) => $[1]));

/**
 * ```txt
 * DOT <- '.' Bindable Spacing;
 * ```
 */
export const dot: Parser<Expression> = map(
  seq(
    map(seq(lit("."), bindable), ($) => g.any($[1]?.[0])),
    spacing,
  ),
  ($) => $[0],
);

/**
 * ```txt
 * CLOSE <- ')' Spacing;
 * ```
 */
export const close = map(seq(lit(")"), bindable, spacing), ($) => $[1]?.[0]);

/**
 * ```txt
 * OPEN <- '(' Spacing;
 * ```
 */
export const open = map(seq(lit("("), spacing), ($) => $[0]);

/**
 * ```txt
 * alias Quantifier = <sign> Bindable Spacing;
 * ```
 */
const quantifier = <T extends string>(sign: T) =>
  map(seq(lit(sign), bindable, spacing), ($) => ({
    quantifier: $[0],
    as: $[1]?.[0],
  }));

/**
 * ```txt
 * PLUS <- '+' Bindable Spacing;
 * ```
 */
export const plus = quantifier("+");

/**
 * ```txt
 * STAR <- '*' Spacing;
 * ```
 */
export const star = quantifier("*");

/**
 * ```txt
 * QUESTION <- '?' Spacing;
 * ```
 */
export const question = quantifier("?");

/**
 * ```txt
 * NOT <- '!' Spacing;
 * ```
 */
export const notPredicate = map(seq(lit("!"), spacing), ($) => $[0]);

/**
 * ```txt
 * AND <- '&' Spacing;
 * ```
 */
export const andPredicate = map(seq(lit("&"), spacing), ($) => $[0]);

/**
 * ```txt
 * SLASH <- '/' Spacing;
 * ```
 */
export const slash = map(seq(lit("/"), spacing), ($) => $[0]);

/**
 * ```txt
 * SEMICOLON <- ';' Spacing;
 * ```
 */
export const semicolon = map(seq(lit(";"), spacing), ($) => $[0]);

/**
 * ```txt
 * LEFTARROW <- '<-' Spacing;
 * ```
 */
export const leftArrow = map(seq(lit("<-"), spacing), ($) => $[0]);

/**
 * ```txt
 * Char <- '\\' [nrt'"\[\]\\]
 *       / '\\' [0-2][0-7][0-7]
 *       / '\\' [0-7][0-7]?
 *       / !'\\' .;
 * ```
 */
export const char = choice(
  map(
    seq(
      lit("\\"),
      map(
        charClass(["n", "r", "t", "'", '"', "[", "]", "\\"]),
        ($) => $[0] as Escapable,
      ),
    ),
    ($) => unescapeChar($[1]),
  ),
  choice(
    map(
      seq(lit("\\"), charClass([["0", "7"]]), opt(charClass([["0", "7"]]))),
      ($) => octalDigitToChar(`${$[1]}${$[2].length === 0 ? "" : $[2]}`),
    ),
    map(seq(not(lit("\\")), any()), ($) => $[1]),
  ),
);

/**
 * ```txt
 * Range <- Char '-' Char / Char;
 * ```
 */
export const range = choice(
  map(seq(char, lit("-"), char), ($) => g.range($[0], $[2])),
  map(char, ($) => g.char($)),
);

/**
 * ```txt
 * Class <- '[' (!']' Range)* ']' Bindable Spacing;
 * ```
 */
export const characterClass = map(
  seq(
    lit("["),
    zeroOrMore(map(seq(not(lit("]")), range), ($) => $[1])),
    lit("]"),
    bindable,
    spacing,
  ),
  ($) => g.charClass($[1], $[3]?.[0]),
);

/**
 * ```txt
 * Literal <- ['] (!['] Char)* ['] Spacing
 *          / ["] (!["] Char)* ["] Spacing;
 * ```
 */
export const literal = map(
  choice(
    seq(
      lit("'"),
      map(zeroOrMore(map(seq(not(lit("'")), char), ($) => $[1])), ($) =>
        $.join(""),
      ),
      lit("'"),
      spacing,
    ),
    seq(
      lit('"'),
      map(zeroOrMore(map(seq(not(lit('"')), char), ($) => $[1])), ($) =>
        $.join(""),
      ),
      lit("'"),
      spacing,
    ),
  ),
  ($) => g.lit($[1]),
);

/**
 * ```txt
 * IdentStart <- [a-zA-Z_];
 * ```
 */
export const identStart = charClass([["a", "z"], ["A", "Z"], "_"]);

/**
 * ```txt
 * IdentCont <- IdentStart / [0-9];
 * ```
 */
export const identCont = choice(identStart, charClass([["0", "9"]]));

/**
 * ```txt
 * Identifier <- IdentStart IdentCont* ("$" Bind)? Spacing;
 * ```
 */
export const identifier = map(
  seq(identStart, zeroOrMore(identCont), bindable, spacing),
  ($) => g.identifier($[0] + $[1].join(""), $[2]?.[0]),
);

/**
 * ```txt
 * Primary <- Identifier !LEFTARROW
 *          / OPEN Expression CLOSE
 *          / Literal
 *          / Class
 *          / DOT;
 * ```
 */
export function primary(input: string, index: number) {
  return choice(
    map(seq(identifier, not(leftArrow)), ($) => $[0]),
    map(seq(open, expression, close), ($) => ({ ...$[1], as: $[2] })),
    literal,
    characterClass,
    dot,
  )(input, index);
}

/**
 * ```txt
 * Suffix <- Primary (QUESTION / STAR / PLUS)?;
 * ```
 */
export const suffix = map(
  seq(primary, opt(choice(question, star, plus))),
  ([expr, quant]) => {
    if (quant.length === 0) {
      return expr;
    }

    const { quantifier, as } = quant[0];
    switch (quantifier) {
      case "*":
        return g.star(expr, as);
      case "+":
        return g.plus(expr, as);
      case "?":
        return g.opt(expr, as);
      default: {
        const exhaustiveCheck: never = quantifier[0];
        throw new Error(`Unreachable: ${exhaustiveCheck}`);
      }
    }
  },
);

/**
 * ```txt
 * Prefix <- (AND / NOT)? Suffix;
 * ```
 */
export const prefix = map(
  seq(opt(choice(andPredicate, notPredicate)), suffix),
  ([prefix, expr]) => {
    if (isEmptyArray(prefix)) {
      return expr;
    }

    switch (prefix[0]) {
      case "&":
        return g.and(expr);
      case "!":
        return g.not(expr);
      default: {
        const exhaustiveCheck: never = prefix[0];
        throw new Error(`Unreachable: ${exhaustiveCheck}`);
      }
    }
  },
);

/**
 * ```txt
 * Sequence <- Prefix*;
 * ```
 */
export const sequence = map(oneOrMore(prefix), ($) =>
  $.length === 1 ? $[0] : g.seq($),
);

/**
 * ```txt
 * Expression <- Sequence (SLASH Sequence)*;
 * ```
 */
export const expression: Parser<Expression> = map(
  seq(sequence, zeroOrMore(map(seq(slash, sequence), ($) => $[1]))),
  ($) =>
    $[1].length === 0
      ? $[0]
      : $[1].reduce((left, right) => g.choice(left, right), $[0]),
);

/**
 * ```txt
 * Definition <- Identifier LEFTARROW Expression SEMICOLON;
 * ```
 */
export const definition = map(
  seq(identifier, leftArrow, expression, semicolon),
  ($) => g.def($[0], $[2]),
);

/**
 * ```txt
 * Grammar <- Spacing Definition+ EndOfFile;
 * ```
 */
export const grammar = map(
  seq(spacing, oneOrMore(definition), endOfFile),
  ($) => $[1],
);
