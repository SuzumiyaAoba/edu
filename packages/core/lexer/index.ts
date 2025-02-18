import { BufferedAsyncIterator } from "@/libs/buffered-iterator";
import { CharAsyncGenerator } from "@/libs/char-async-generator";
import { isOctalAscii, isOctalDigit, octalDigitToChar } from "@/libs/octal";
import { PegSyntaxError } from "./error";
import { isEscapableChar, unescapeChar } from "./escape";
import { type Input, toReadable } from "./input";
import type {
  CharClass,
  Comment,
  Identifier,
  LeftArrow,
  Literal,
  Range,
  Token,
} from "./token";
import * as token from "./token";
import type { TokenWith } from "./token";

export type Pos = {
  column: number;
  line: number;
};

type Char<T> = T & {
  char: string;
};

export type CharWithPos = Char<{ pos: Pos }>;

export type CharIteratorResult = IteratorResult<CharWithPos, unknown>;
export type CharIterator = {
  next(): Promise<CharIteratorResult>;
  peek(n?: number): Promise<CharIteratorResult>;
  skip(): Promise<void>;
  reset(resetBuffer?: boolean): void;
  backtrack(n?: number): void;
};

type ConsumeResult<T extends Token> = {
  token: T;
};

const EofPos: Pos = {
  column: -1,
  line: -1,
} as const;

const consumeLeftArrow = async (
  iter: CharIterator,
): Promise<ConsumeResult<LeftArrow>> => {
  let p = await iter.next();
  if (p.done) {
    throw new PegSyntaxError(
      `'<' is expected, but EOF found`,
      ["LEFTARROW"],
      EofPos,
    );
  }

  p = await iter.next();
  if (!p.done) {
    const { char } = p.value;
    if (char === "-") {
      iter.reset();

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

  throw new PegSyntaxError("Syntax Error", ["LEFTARROW"], EofPos);
};

const identifierRegex = /[a-zA-Z]/;

const consumeIdentifier = async (
  iter: CharIterator,
): Promise<ConsumeResult<Identifier>> => {
  const { value, done } = await iter.next();
  if (done) {
    throw new PegSyntaxError("Unexpected EOF", [], EofPos);
  }

  let buf = value.char;

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
    throw new PegSyntaxError("Unexpected EOF", [], EofPos);
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
  let p = await iter.next();
  if (p.done) {
    return { value: undefined, done: true };
  }

  if (p.value.char !== "\\") {
    // normal char
    return {
      value: {
        char: p.value.char,
        escaped: false,
      },
      done: false,
    };
  }

  // escaped char
  p = await iter.next();
  if (p.done) {
    throw new PegSyntaxError("Unexpected EOF", [], EofPos);
  }

  let buf = p.value.char;

  // '\x'
  if (isEscapableChar(buf)) {
    return {
      value: {
        char: unescapeChar(buf),
        escaped: true,
      },
      done: false,
    };
  }

  if (!isOctalDigit(p.value.char)) {
    throw new PegSyntaxError("Octal digit expected", [], p.value.pos);
  }

  // octal digits
  for (let i = 0; i < 2; i++) {
    const { value, done } = await iter.peek();
    if (done) {
      break;
    }

    if (!isOctalDigit(value.char)) {
      break;
    }

    buf += value.char;

    iter.reset();
  }

  if (!isOctalAscii(buf)) {
    throw new PegSyntaxError(`Invalid octal ASCII: ${buf}`, [], p.value.pos);
  }

  return {
    value: {
      char: octalDigitToChar(buf),
      escaped: true,
    },
    done: false,
  };
};

const consumeCharClass = async (
  iter: CharIterator,
): Promise<ConsumeResult<CharClass>> => {
  const { value, done } = await iter.next();
  if (done) {
    throw new PegSyntaxError("Unexpected EOF", [], EofPos);
  }

  if (value.char !== "[") {
    throw new PegSyntaxError("Unexpected char", ["CLOSE"], value.pos);
  }

  const buf: (string | Range)[] = [];
  for (let p = await consumeChar(iter); !p.done; p = await consumeChar(iter)) {
    const { char, escaped } = p.value;
    if (char === "]" && !escaped) {
      break;
    }

    const end = await consumeRange(iter);

    buf.push(end ? token.range([char, end], {}).token : char);
  }

  return token.charClass(buf, {});
};

const consumeRange = async (
  iter: CharIterator,
): Promise<string | undefined> => {
  const { value, done } = await iter.peek();
  if (done || value.char !== "-") {
    return;
  }

  await iter.skip();

  const end = await consumeChar(iter);
  if (end.done) {
    throw new PegSyntaxError("Unexpected EOF", [], EofPos);
  }

  return end.value.char;
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

export class Lexer
  implements AsyncGenerator<{ token: Token; pos: Pos }, void, unknown>
{
  #charGenerator: CharAsyncGenerator;
  #iterator: CharIterator;

  constructor(readableStream: ReadableStream) {
    this.#charGenerator = CharAsyncGenerator.from(readableStream);
    this.#iterator = BufferedAsyncIterator.from(this.#charGenerator);
  }

  static async from(input: Input) {
    const readableStream = await toReadable(input);

    return new Lexer(readableStream);
  }

  async next(
    ...[_value]: [] | [unknown]
  ): Promise<IteratorResult<{ token: Token; pos: Pos }, void>> {
    const p = await this.#iterator.peek();
    if (p.done) {
      return { done: true, value: undefined };
    }

    const { char, pos } = p.value;

    let value: TokenWith<Token, { pos: Pos }> = token.endOfFile({ pos });
    if (char === "\n") {
      value = token.endOfLine({ pos });
      this.#iterator.reset();
    } else if (char === '"' || char === "'") {
      const literal = await consumeLiteral(this.#iterator);
      value = token.literal(literal.token.value, { pos });
    } else if (char === "<") {
      await consumeLeftArrow(this.#iterator);
      value = token.leftArrow({ pos });
    } else if (char === "/") {
      value = token.slash({ pos });
      this.#iterator.reset();
    } else if (char === "(") {
      value = token.open({ pos });
      this.#iterator.reset();
    } else if (char === ")") {
      value = token.close({ pos });
      this.#iterator.reset();
    } else if (char === "[") {
      const charClass = await consumeCharClass(this.#iterator);
      value = token.charClass(charClass.token.value, { pos });
    } else if (char === ".") {
      value = token.dot({ pos });
      this.#iterator.reset();
    } else if (char === "*") {
      value = token.star({ pos });
      this.#iterator.reset();
    } else if (char === "+") {
      value = token.plus({ pos });
      this.#iterator.reset();
    } else if (char === "?") {
      value = token.question({ pos });
      this.#iterator.reset();
    } else if (char === "&") {
      value = token.and({ pos });
      this.#iterator.reset();
    } else if (char === "!") {
      value = token.not({ pos });
      this.#iterator.reset();
    } else if (char === ";") {
      value = token.semicolon({ pos });
      this.#iterator.reset();
    } else if (char === "#") {
      const comment = await consumeComment(this.#iterator);
      value = token.comment(comment.token.value, { pos });
    } else if (char.match(identifierRegex)) {
      const identifier = await consumeIdentifier(this.#iterator);
      value = token.identifier(identifier.token.value, { pos });
    } else if (char.match(spaceRegex)) {
      value = token.space(char, { pos });
      this.#iterator.reset();
    } else {
      throw new Error(`Unexpected char: ${char}`);
    }

    return { done: false, value };
  }

  return(
    _value: void | PromiseLike<void>,
  ): Promise<IteratorResult<{ token: Token; pos: Pos }, void>> {
    throw new Error("Method not implemented.");
  }

  throw(
    _e: unknown,
  ): Promise<IteratorResult<{ token: Token; pos: Pos }, void>> {
    throw new Error("Method not implemented.");
  }

  [Symbol.asyncIterator](): AsyncGenerator<
    { token: Token; pos: Pos },
    void,
    unknown
  > {
    return this;
  }

  [Symbol.asyncDispose](): PromiseLike<void> {
    throw new Error("Method not implemented.");
  }
}
