import { bufferableAsyncIterator } from "@/libs/bufferable-iterator";
import { PegSyntaxError } from "./error";
import { type Input, charGenerator, toReadable } from "./input";
import type {
  CharClass,
  Comment,
  Identifier,
  LeftArrow,
  Literal,
  Token,
} from "./token";
import * as token from "./token";

type Pos = {
  column: number;
  line: number;
};

type Char<T> = T & {
  char: string;
};

type CharWithPos = Char<{ pos: Pos }>;

type CharIteratorResult = IteratorResult<CharWithPos, unknown>;
type CharIterator = {
  next: () => Promise<CharIteratorResult>;
  peek: () => Promise<CharIteratorResult>;
  reset: () => void;
};

type ConsumeResult<T extends Token> = {
  token: T;
};

const consumeLeftArrow = async (
  iter: CharIterator,
): Promise<ConsumeResult<LeftArrow>> => {
  const p = await iter.next();
  if (!p.done) {
    const { char } = p.value;

    if (char === "-") {
      return {
        token: {
          type: "LEFTARROW",
        },
      };
    }
  }

  throw new Error("Syntax Error");
};

const identifierRegex = /[a-zA-Z]/;

const consumeIdentifier = async (
  fl: string,
  iter: CharIterator,
): Promise<ConsumeResult<Identifier>> => {
  let buf = fl;

  let p: CharIteratorResult;
  for (p = await iter.peek(); !p.done; p = await iter.peek()) {
    const { char } = p.value;

    if (!char.match(identifierRegex)) {
      break;
    }

    buf += char;

    iter.reset();
  }

  return token.identifier(buf, {});
};

const consumeLiteral = async (
  iter: CharIterator,
): Promise<ConsumeResult<Literal>> => {
  // TODO: escape

  let buf = "";
  for (let p = await iter.peek(); !p.done; p = await iter.peek()) {
    const { char } = p.value;
    if (char === '"') {
      iter.reset();
      break;
    }

    buf += char;

    iter.reset();
  }

  return token.literal(buf, {});
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

const consumeChar = async (iter: CharIterator): Promise<string> => {
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
  iter: CharIterator,
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

  return token.charClass(buf, {});
};

const consumeComment = async (
  iter: CharIterator,
): Promise<ConsumeResult<Comment>> => {
  let buf = "";
  for (let p = await iter.peek(); !p.done; p = await iter.peek()) {
    const { char } = p.value;
    if (char === "\n") {
      break;
    }

    buf += char;

    iter.reset();
  }

  return token.comment(buf, {});
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
  const iter: CharIterator = bufferableAsyncIterator(charGen);

  for (let p = await iter.next(); !p.done; p = await iter.next()) {
    const { char, pos } = p.value;

    if (char === "\n") {
      yield token.endOfLine({ pos });
    } else if (char.match(spaceRegex)) {
    } else if (char === '"') {
      const literal = await consumeLiteral(iter);
      yield token.literal(literal.token.value, { pos });
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
    } else if (char.match(identifierRegex)) {
      const identifier = await consumeIdentifier(char, iter);
      yield token.identifier(identifier.token.value, { pos });
    }
  }

  yield token.endOfFile({
    pos: {
      column: -1,
      line: -1,
    },
  });
};
