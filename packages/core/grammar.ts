import { type Escapable, unescapeChar } from "@/compiler/escape";
import { octalDigitToChar } from "@/libs/octal";
import { isEmptyArray } from "@/libs/std/array";
import { type Expression, PegGrammar } from "./ast";
import {
  type Parser,
  type Pos,
  not,
  any,
  lit,
  choice,
  map,
  seq,
  charClass,
  opt,
  star,
  plus
} from "tpeg";

const g = new PegGrammar();

/**
 * ```txt
 * EndOfFile <- !.;
 * ```
 */
export const EndOfFile: Parser<string> = not(any());

/**
 * ```txt
 * EndOfLine <- '\r\n' / '\n' / '\r';
 * ```
 */
export const EndOfLine = choice(lit("\r\n"), lit("\n"), lit("\r"));

/**
 * ```txt
 * Space <- ' ' / '\t' / EndOfLine;
 * ```
 */
export const Space = choice(lit(" "), lit("\t"), EndOfLine);

/**
 * ```txt
 * Comment <- "--" (!EndOfLine .)* EndOfLine;
 * ```
 */
export const Comment: Parser<string> = map(
  seq(
    lit("--"),
    star(map(seq(not(EndOfLine), any()), ([, char]) => char)),
    EndOfLine,
  ), ($) => $[1].join(""));

/**
 * ```txt
 * Spacing <- (Space / Comment)*;
 * ```
 */
export const Spacing: Parser<string[]> = star(choice(Space, Comment));

/**
 * ```txt
 * BindStart <- [a-zA-Z_];
 * ```
 */
export const BindStart = charClass([["a", "z"], ["A", "Z"], "_"]);

/**
 * ```txt
 * BindCont <- BindStart / [0-9];
 * ```
 */
export const BindCont = choice(BindStart, charClass([["0", "9"]]));

/**
 * ```txt
 * Bind <- "$" BindStart BindCont* Spacing;
 * ```
 */
export const Bind = map(
  seq(lit("$"), BindStart, star(BindCont), Spacing),
  ($) => $[1] + $[2].join(""),
);

/**
 * ```txt
 * MarkerStart <- [a-zA-Z_];
 * ```
 */
export const MarkerStart = charClass([["a", "z"], ["A", "Z"], "_"]);

/**
 * ```txt
 * MarkerCont <- MarkStart / [0-9];
 * ```
 */
export const MarkerCont = choice(MarkerStart, charClass([["0", "9"]]));

/**
 * ```txt
 * Marker <- "@" MarkerStart MarkerCont* Spacing;
 * ```
 */
export const Marker = map(
  seq(lit("@"), MarkerStart, star(MarkerCont), Spacing),
  ($) => $[1] + $[2].join(""),
);

/**
 * ```txt
 * DOT <- '.' Bind? Spacing;
 * ```
 */
export const DOT: Parser<Expression> = map(
  seq(
    map(seq(lit("."), opt(Bind)), ($) => g.any($[1]?.[0])),
    Spacing,
  ),
  ($) => $[0],
);

/**
 * ```txt
 * CLOSE <- ')' Bind? Spacing;
 * ```
 */
export const CLOSE = map(seq(lit(")"), opt(Bind), Spacing), ($) => $[1]?.[0]);

/**
 * ```txt
 * OPEN <- '(' Spacing;
 * ```
 */
export const OPEN = map(seq(lit("("), Spacing), ($) => $[0]);

/**
 * ```txt
 * alias Quantifier = <sign> Bind? Spacing;
 * ```
 */
const quantifier = <T extends string>(sign: T) =>
  map(seq(lit(sign), opt(Bind), Spacing), ($) => ({
    quantifier: $[0],
    as: $[1]?.[0],
  }));

/**
 * ```txt
 * PLUS <- '+' Bindable Spacing;
 * ```
 */
export const PLUS = quantifier("+");

/**
 * ```txt
 * STAR <- '*' Spacing;
 * ```
 */
export const STAR = quantifier("*");

/**
 * ```txt
 * QUESTION <- '?' Spacing;
 * ```
 */
export const QUESTION = quantifier("?");

/**
 * ```txt
 * NOT <- '!' Spacing;
 * ```
 */
export const NOT = map(seq(lit("!"), Spacing), ($) => $[0]);

/**
 * ```txt
 * AND <- '&' Spacing;
 * ```
 */
export const AND = map(seq(lit("&"), Spacing), ($) => $[0]);

/**
 * ```txt
 * SLASH <- '/' Spacing;
 * ```
 */
export const SLASH = map(seq(lit("/"), Spacing), ($) => $[0]);

/**
 * ```txt
 * SEMICOLON <- ';' Spacing;
 * ```
 */
export const SEMICOLON = map(seq(lit(";"), Spacing), ($) => $[0]);

/**
 * ```txt
 * LEFTARROW <- '<-' Spacing;
 * ```
 */
export const LEFTARROW = map(seq(lit("<-"), Spacing), ($) => $[0]);

/**
 * ```txt
 * Char <- '\\' [nrt'"\[\]\\]
 *       / '\\' [0-2][0-7][0-7]
 *       / '\\' [0-7][0-7]?
 *       / !'\\' .;
 * ```
 */
export const Char = choice(
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
export const Range = choice(
  map(seq(Char, lit("-"), Char), ($) => g.range($[0], $[2])),
  map(Char, ($) => g.char($)),
);

/**
 * ```txt
 * Class <- '[' (!']' Range)* ']' Bind? Spacing;
 * ```
 */
export const Class = map(
  seq(
    lit("["),
    star(map(seq(not(lit("]")), Range), ($) => $[1])),
    lit("]"),
    opt(Bind),
    Spacing,
  ),
  ($) => g.charClass($[1], $[3]?.[0]),
);

/**
 * ```txt
 * Literal <- ['] (!['] Char)* ['] Spacing
 *          / ["] (!["] Char)* ["] Spacing;
 * ```
 */
export const Literal = map(
  choice(
    seq(
      lit("'"),
      map(star(map(seq(not(lit("'")), Char), ($) => $[1])), ($) =>
        $.join(""),
      ),
      lit("'"),
      Spacing,
    ),
    seq(
      lit('"'),
      map(star(map(seq(not(lit('"')), Char), ($) => $[1])), ($) => $.join("")),
      lit("'"),
      Spacing,
    ),
  ),
  ($) => g.lit($[1]),
);

/**
 * ```txt
 * IdentStart <- [a-zA-Z_];
 * ```
 */
export const IdentStart = charClass([["a", "z"], ["A", "Z"], "_"]);

/**
 * ```txt
 * IdentCont <- IdentStart / [0-9];
 * ```
 */
export const IdentCont = choice(IdentStart, charClass([["0", "9"]]));

/**
 * ```txt
 * Identifier <- IdentStart IdentCont* Bind? Spacing;
 * ```
 */
export const Identifier = map(
  seq(IdentStart, star(IdentCont), opt(Bind), Spacing),
  ($) => g.identifier($[0] + $[1].join(""), $[2]?.[0]),
);

/**
 * ```txt
 * Primary <- "@@"? Identifier !LEFTARROW
 *          / OPEN Expression CLOSE
 *          / Literal
 *          / Class
 *          / DOT;
 * ```
 */
export function Primary(input: string, pos: Pos) {
  return choice(
    map(seq(opt(lit("@@")), Identifier, not(LEFTARROW)), ($) => ({
      ...$[1],
      marker: $[0].length === 0 ? undefined : $[1].name,
    })),
    map(seq(OPEN, expression, CLOSE), ($) => ({ ...$[1], as: $[2] })),
    Literal,
    Class,
    DOT,
  )(input, pos);
}

/**
 * ```txt
 * Suffix <- Marker? Primary (QUESTION / STAR / PLUS)?;
 * ```
 */
export const Suffix = map(
  seq(opt(Marker), Primary, opt(choice(QUESTION, STAR, PLUS))),
  ([marker, expr, quant]) => {
    if (quant.length === 0) {
      return expr;
    }

    if (marker.length === 1 && quant[0].quantifier !== "?") {
      throw new Error("Maker exists at illegal position");
    }

    const { quantifier, as } = quant[0];
    switch (quantifier) {
      case "*":
        return g.star(expr, as);
      case "+":
        return g.plus(expr, as);
      case "?":
        return g.opt(expr, marker[0], as);
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
export const Prefix = map(
  seq(opt(choice(AND, NOT)), Suffix),
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
 * Sequence <- Marker? Prefix+;
 * ```
 */
export const Sequence = map(seq(opt(Marker), plus(Prefix)), ($) =>
  $[1].length === 1 ? $[1][0] : g.seq($[1]),
);

/**
 * ```txt
 * Expression <- Sequence (SLASH Marker? Sequence)*;
 * ```
 */
export const expression: Parser<Expression> = map(
  seq(
    Sequence,
    star(
      map(
        seq(
          SLASH,
          map(seq(opt(Marker), Sequence), ($) => ({
            ...$[1],
            marker: $[0]?.[0],
          })),
        ),
        ($) => $[1],
      ),
    ),
  ),
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
  seq(Identifier, LEFTARROW, expression, SEMICOLON),
  ($) => g.def($[0], $[2]),
);

/**
 * ```txt
 * Grammar <- Spacing Definition+ EndOfFile;
 * ```
 */
export const grammar = map(
  seq(Spacing, plus(definition), EndOfFile),
  ($) => $[1],
);
