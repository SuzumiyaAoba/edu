import { bufferableAsyncIterator } from "@/libs/bufferable-iterator";
import { isOctalDigit, octalDigitToChar } from "@/libs/octal";
import { PegSyntaxError } from "./error";
import { isEscapableChar, unescapeChar } from "./escape";
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
  peekN: (n: number) => Promise<IteratorResult<CharWithPos[], unknown>>;
  consume: () => Promise<void>;
  reset: () => void;
};

type ConsumeResult<T extends Token> = {
  token: T;
};

const consumeLeftArrow = async (
  iter: CharIterator,
): Promise<ConsumeResult<LeftArrow>> => {
  iter.reset();

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

    throw new PegSyntaxError(
      `'<-' is expected, but '${char}' found`,
      ["LEFTARROW"],
      p.value.pos,
    );
  }

  throw new PegSyntaxError("Syntax Error", ["LEFTARROW"], {
    column: -1,
    line: -1,
  });
};

const identifierRegex = /[a-zA-Z]/;

const consumeIdentifier = async (
  iter: CharIterator,
): Promise<ConsumeResult<Identifier>> => {
  const first = await iter.next();
  if (first.done) {
    throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
  }

  let buf = first.value.char;

  for (let p = await iter.peek(); !p.done; p = await iter.peek()) {
    const { char } = p.value;

    if (!char.match(identifierRegex)) {
      break;
    }

    buf += char;

    iter.reset();
  }

  return token.identifier(buf, {});
};

export const consumeLiteral = async (
  iter: CharIterator,
): Promise<ConsumeResult<Literal>> => {
  const open = await iter.next();
  if (open.done || (open.value.char !== '"' && open.value.char !== "'")) {
    throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
  }

  const close = open.value.char === '"' ? '"' : "'";

  let buf = "";
  for (let p = await consumeChar(iter); !p.done; p = await consumeChar(iter)) {
    const {
      value: { char, escaped },
    } = p;
    if (!escaped && char === close) {
      break;
    }

    buf += char;
  }

  iter.reset();

  return token.literal(buf, {});
};

export const consumeChar = async (
  iter: CharIterator,
): Promise<IteratorResult<{ char: string; escaped: boolean }, unknown>> => {
  let buf = "";
  let p = await iter.next();
  if (p.done) {
    return { value: undefined, done: true };
  }

  if (p.value.char !== '\\') {
    // normal char
    buf += p.value.char;
  } else {
    // escaped char
    p = await iter.next();

    if (p.done) {
      throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
    }

    // '\x'
    if (isEscapableChar(p.value.char)) {
      return {
        value: {
          char: unescapeChar(p.value.char),
          escaped: true,
        },
        done: false,
      };
    }

    if (!isOctalDigit(p.value.char)) {
      throw new PegSyntaxError("Octal digit expected", [], p.value.pos);
    }

    // octal digits
    buf += p.value.char;
    iter.reset();

    const { value, done } = await iter.peekN(2);
    if (done) {
      throw new PegSyntaxError("Unexpected EOF", [], { column: -1, line: -1 });
    }
    for (const c of value) {
      if (isOctalDigit(c.char)) {
        buf += c.char;

        iter.consume();
      } else {
        break;
      }
    }

    buf = octalDigitToChar(buf);

    return {
      value: {
        char: buf,
        escaped: true,
      },
      done: false,
    };
  }

  return {
    value: {
      char: buf,
      escaped: false,
    },
    done: false,
  };
};

const consumeCharClass = async (
  iter: CharIterator,
): Promise<ConsumeResult<CharClass>> => {
  iter.reset();

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
  iter.reset();

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

  for (let p = await iter.peek(); !p.done; p = await iter.peek()) {
    const { char, pos } = p.value;

    if (char === "\n") {
      yield token.endOfLine({ pos });
    } else if (char.match(spaceRegex)) {
    } else if (char === '"' || char === "'") {
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
      const identifier = await consumeIdentifier(iter);
      yield token.identifier(identifier.token.value, { pos });
    }

    iter.reset();
  }

  yield token.endOfFile({
    pos: {
      column: -1,
      line: -1,
    },
  });
};
