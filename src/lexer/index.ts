import {
  type BufferableAsyncIterator,
  type CharGeneratorResult,
  bufferableAsyncIterator,
} from "@/libs/charGenerator";
import { PegSyntaxError } from "./error";
import {
  type CharIteratorResult,
  type Input,
  type Pos,
  charGenerator,
  toReadable,
} from "./input";
import type {
  CharClass,
  Comment,
  Identifier,
  LeftArrow,
  Literal,
  Token,
} from "./token";
import * as token from "./token";

type Lookahead = [CharIteratorResult] | [];

type ConsumeResult<T extends Token> = {
  token: T;
  lookahead: Lookahead;
};

type IteratorForLexer = BufferableAsyncIterator<
  CharGeneratorResult,
  void,
  unknown
>;

const consumeLeftArrow = async (
  iter: IteratorForLexer,
): Promise<ConsumeResult<LeftArrow>> => {
  const p = await iter.next();
  if (!p.done) {
    const { char } = p.value;

    if (char === "-") {
      return {
        token: {
          type: "LEFTARROW",
        },
        lookahead: [],
      };
    }
  }

  throw new Error("Syntax Error");
};

const identifierRegex = /[a-zA-Z]/;

const consumeIdentifier = async (
  fl: string,
  iter: IteratorForLexer,
): Promise<ConsumeResult<Identifier>> => {
  let buf = fl;

  let p: CharIteratorResult;
  for (p = await iter.next(); !p.done; p = await iter.next()) {
    const { char } = p.value;

    if (!char.match(identifierRegex)) {
      break;
    }

    buf += char;
  }

  return token.identifier(buf, {
    lookahead: [p],
  });
};

const consumeLiteral = async (
  iter: IteratorForLexer,
): Promise<ConsumeResult<Literal>> => {
  // TODO: escape

  let buf = "";
  for (let p = await iter.next(); !p.done; p = await iter.next()) {
    const { char } = p.value;
    if (char === '"') {
      break;
    }

    buf += char;
  }

  return token.literal(buf, {
    lookahead: [],
  });
};

const isEscapedChar = (char: string): boolean => {
  return (
    char === "n" ||
    char === "r" ||
    char === "t" ||
    char === "'" ||
    char === "[" ||
    char === "]" ||
    char === "\\"
  );
};

const isOctalDigit = (char: string): boolean => {
  return char >= "0" && char <= "7";
};

const octalDigitToChar = (char: string): string => {
  return String.fromCharCode(Number.parseInt(char, 8));
};

const consumeChar = async (iter: IteratorForLexer): Promise<string> => {
  let buf = "";
  let p = await iter.next();
  if (p.done) {
    throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
  }

  if (p.value.char === "\\") {
    // escaped char
    p = await iter.next();
    if (p.done) {
      throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
    }

    const { char } = p.value;
    if (isEscapedChar(char)) {
      buf += char;
    } else if (char === "0") {
    } else {
      throw new PegSyntaxError("Invalid escape sequence", [], {
        column: -1,
        line: -1,
      });
    }

    buf += p.value.char;
  } else {
    // normal char
    buf += p.value.char;
  }

  return buf;
};

const consumeCharClass = async (
  iter: IteratorForLexer,
): Promise<ConsumeResult<CharClass>> => {
  // TODO: escape
  let buf = "";
  for (let p = await iter.next(); !p.done; p = await iter.next()) {
    const { char } = p.value;
    if (char === "]") {
      break;
    }

    buf += char;
  }

  return token.charClass(buf, {
    lookahead: [],
  });
};

const consumeComment = async (
  iter: IteratorForLexer,
): Promise<ConsumeResult<Comment>> => {
  let buf = "";
  for (let p = await iter.next(); !p.done; p = await iter.next()) {
    const { char } = p.value;
    if (char === "\n") {
      break;
    }

    buf += char;
  }

  return token.comment(buf, {
    lookahead: [],
  });
};

const spaceRegex = /\s/;

export const parse = async function* (input: Input): AsyncGenerator<
  {
    token: Token;
    pos: Pos;
  },
  void,
  unknown
> {
  const readable = toReadable(input);
  const charGen = charGenerator(readable);
  const iter = bufferableAsyncIterator(charGen);

  let lookahead: [] | [CharIteratorResult] = [];
  for (
    let p = await iter.next();
    !p.done;
    p = lookahead.length === 0 ? await iter.next() : lookahead[0]
  ) {
    lookahead = [];
    const { char, pos } = p.value;

    if (char === "\n") {
      yield token.endOfLine({ pos });
    } else if (char.match(spaceRegex)) {
    } else if (char === '"') {
      const literal = await consumeLiteral(iter);
      yield token.literal(literal.token.value, { pos });
      lookahead = literal.lookahead ?? [];
    } else if (char === "<") {
      await consumeLeftArrow(iter);
      yield token.leftArrow({ pos });
    } else if (char === "/") {
      yield token.slash({ pos });
    } else if (char === "(") {
      yield token.open({ pos });
    } else if (char === ")") {
      yield token.close({ pos });
    } else if (char === "[") {
      const charClass = await consumeCharClass(iter);
      yield token.charClass(charClass.token.value, { pos });
    } else if (char === "*") {
      yield token.star({ pos });
    } else if (char === "+") {
      yield token.plus({ pos });
    } else if (char === "&") {
      yield token.and({ pos });
    } else if (char === "!") {
      yield token.not({ pos });
    } else if (char === ";") {
      yield token.semicolon({ pos });
    } else if (char === "#") {
      const comment = await consumeComment(iter);
      yield token.comment(comment.token.value, { pos });
      lookahead = comment.lookahead ?? [];
    } else if (char.match(identifierRegex)) {
      const identifier = await consumeIdentifier(char, iter);
      yield token.identifier(identifier.token.value, { pos });
      lookahead = identifier.lookahead ?? [];
    }
  }

  yield token.endOfFile({
    pos: {
      column: -1,
      line: -1,
    },
  });
};
