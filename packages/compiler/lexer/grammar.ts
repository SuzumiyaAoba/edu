import {
  PegSyntaxError,
  UnexpectedCharError,
  UnexpectedEofError,
} from "@/compiler/error";
import { isEscapableChar, unescapeChar } from "@/compiler/escape";
import type {
  CharClass,
  CharClassElement,
  Comment,
  Identifier,
  LeftArrow,
  Literal,
  Token,
} from "@/compiler/token/grammar";
import { Tokens } from "@/compiler/token/grammar";
import type { TokenWith } from "@/compiler/token/grammar";
import { BufferedAsyncIterator } from "@/libs/buffered-iterator";
import { CharAsyncGenerator } from "@/libs/char-async-generator";
import { isOctalAscii, isOctalDigit, octalDigitToChar } from "@/libs/octal";
import { type NonEmptyArray, isNonEmptyArray } from "@/libs/std/array";
import type { PrivateConstructorParameters } from "@/libs/std/types";

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

type ConsumeResult<T extends Token> = TokenWith<{ pos: Pos }, T>;

const EofPos: Pos = {
  column: -1,
  line: -1,
} as const;

const spaceRegex = /\s/;
const identifierRegex = /[a-zA-Z]/;

type Meta = { pos: Pos };

export class Lexer implements AsyncGenerator<TokenWith<Meta>, void, unknown> {
  #charGenerator: CharAsyncGenerator;
  #iterator: CharIterator;
  #token = new Tokens<Meta>();

  private constructor(readableStream: ReadableStream | string) {
    this.#charGenerator = CharAsyncGenerator.from(readableStream);
    this.#iterator = BufferedAsyncIterator.from(this.#charGenerator);
  }

  static from(...args: PrivateConstructorParameters<typeof Lexer>) {
    return new Lexer(...args);
  }

  async next(
    ...[_value]: [] | [unknown]
  ): Promise<IteratorResult<TokenWith<{ pos: Pos }>, void>> {
    const token = this.#token;
    const p = await this.#iterator.peek();

    if (p.done) {
      return { done: true, value: undefined };
    }

    const { char, pos } = p.value;

    let value: TokenWith<{ pos: Pos }> = token.endOfFile({ pos });
    if (char === "\n" || char === "\r\n") {
      value = token.endOfLine(char, { pos });
      this.#iterator.reset();
    } else if (char === '"' || char === "'") {
      const literal = await this.consumeLiteral();
      value = token.literal(literal.token.value, { pos });
    } else if (char === "<") {
      await this.consumeLeftArrow();
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
      value = await this.consumeCharClass();
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
    } else if (char === "-") {
      const comment = await this.consumeComment();
      value = token.comment(comment.token.value, { pos });
    } else if (char.match(identifierRegex)) {
      const identifier = await this.consumeIdentifier();
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
  ): Promise<IteratorResult<TokenWith<{ pos: Pos }>, void>> {
    throw new Error("Method not implemented.");
  }

  throw(_e: unknown): Promise<IteratorResult<TokenWith<{ pos: Pos }>, void>> {
    throw new Error("Method not implemented.");
  }

  [Symbol.asyncIterator](): AsyncGenerator<
    TokenWith<{ pos: Pos }>,
    void,
    unknown
  > {
    return this;
  }

  [Symbol.asyncDispose](): PromiseLike<void> {
    throw new Error("Method not implemented.");
  }

  async consumeLeftArrow(): Promise<ConsumeResult<LeftArrow>> {
    const p = await this.expectString("<-");

    return this.#token.leftArrow({
      pos: p[0].value.pos,
    });
  }

  async consumeIdentifier(): Promise<ConsumeResult<Identifier>> {
    const token = this.#token;

    const { value, done } = await this.#iterator.next();
    if (done) {
      throw new PegSyntaxError("Unexpected EOF", [], EofPos);
    }

    let buf = value.char;

    for (
      let p = await this.#iterator.peek();
      !p.done;
      p = await this.#iterator.peek()
    ) {
      const { char } = p.value;

      if (!char.match(identifierRegex)) {
        break;
      }

      buf += char;

      this.#iterator.reset();
    }

    return token.identifier(buf, { pos: value.pos });
  }

  async consumeLiteral(): Promise<ConsumeResult<Literal>> {
    const token = this.#token;

    const open = await this.#iterator.next();
    if (open.done || (open.value.char !== '"' && open.value.char !== "'")) {
      throw new PegSyntaxError("Unexpected EOF", [], EofPos);
    }

    const close = open.value.char === '"' ? '"' : "'";

    let buf = "";
    for (
      let p = await this.consumeChar();
      !p.done;
      p = await this.consumeChar()
    ) {
      const {
        value: { char, escaped },
      } = p;
      if (!escaped && char === close) {
        break;
      }

      buf += char;
    }

    this.#iterator.reset();

    return token.literal(buf, { pos: open.value.pos });
  }

  async consumeChar(): Promise<
    IteratorResult<{ char: string; escaped: boolean }, unknown>
  > {
    let p = await this.#iterator.next();
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
    p = await this.#iterator.next();
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
      const { value, done } = await this.#iterator.peek();
      if (done) {
        break;
      }

      if (!isOctalDigit(value.char)) {
        break;
      }

      buf += value.char;

      this.#iterator.reset();
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
  }

  async consumeCharClass(): Promise<ConsumeResult<CharClass>> {
    const token = this.#token;

    const { value, done } = await this.#iterator.next();
    if (done) {
      throw new PegSyntaxError("Unexpected EOF", [], EofPos);
    }

    if (value.char !== "[") {
      throw new PegSyntaxError("Unexpected char", ["CLOSE"], value.pos);
    }

    const buf: CharClassElement[] = [];
    for (
      let p = await this.consumeChar();
      !p.done;
      p = await this.consumeChar()
    ) {
      const { char, escaped } = p.value;
      if (char === "]" && !escaped) {
        break;
      }

      const end = await this.consumeRange();

      buf.push(end ? token.range([char, end]) : token.char(char));
    }

    return token.charClass(buf, { pos: value.pos });
  }

  async consumeRange(): Promise<string | undefined> {
    const { value, done } = await this.#iterator.peek();
    if (done || value.char !== "-") {
      return;
    }

    await this.#iterator.skip();

    const end = await this.consumeChar();
    if (end.done) {
      throw new PegSyntaxError("Unexpected EOF", [], EofPos);
    }

    return end.value.char;
  }

  async consumeComment(): Promise<ConsumeResult<Comment>> {
    const token = this.#token;

    const chars = await this.expectString("--");

    this.#iterator.reset();

    let buf = "";
    for (
      let p = await this.#iterator.peek();
      !p.done;
      p = await this.#iterator.peek()
    ) {
      const { char } = p.value;
      if (char === "\n") {
        break;
      }

      buf += char;

      this.#iterator.reset();
    }

    return token.comment(buf, { pos: chars[0].value.pos });
  }

  async expectString(
    str: string,
  ): Promise<NonEmptyArray<IteratorYieldResult<CharWithPos>>> {
    const results: IteratorYieldResult<CharWithPos>[] = [];

    let i = 0;
    for (
      let p = await this.#iterator.next();
      !p.done && i < str.length;
      p = await this.#iterator.peek(i++)
    ) {
      if (p.value.char !== str.charAt(i)) {
        throw new UnexpectedCharError({
          expected: str.charAt(i),
          actual: p.value,
        });
      }

      results.push(p);
    }

    if (results.length !== str.length) {
      throw new UnexpectedEofError("");
    }

    if (isNonEmptyArray(results)) {
      return results;
    }

    throw new UnexpectedEofError("");
  }
}
