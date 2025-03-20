import { BufferedAsyncIterator } from "@/libs/buffered-iterator";
import { CharAsyncGenerator } from "@/libs/char-async-generator";
import { isOctalAscii, isOctalDigit, octalDigitToChar } from "@/libs/octal";
import type { PrivateConstructorParameters } from "@/libs/std/types";
import { PegSyntaxError } from "./error";
import { isEscapableChar, unescapeChar } from "./escape";
import type {
  CharClass,
  CharClassElement,
  Comment,
  Identifier,
  LeftArrow,
  Literal,
  Token,
} from "./token/grammar";
import { Tokens } from "./token/grammar";
import type { TokenWith } from "./token/grammar";

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
      await this.consumeLeftArrow(this.#iterator);
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

  async consumeLeftArrow(
    iter: CharIterator,
  ): Promise<ConsumeResult<LeftArrow>> {
    const leftArrow = await iter.next();
    if (leftArrow.done || leftArrow.value.char !== "<") {
      throw new PegSyntaxError(
        `'<' is expected, but EOF found`,
        ["LEFTARROW"],
        EofPos,
      );
    }

    const p = await iter.next();
    if (!p.done) {
      const { char } = p.value;
      if (char === "-") {
        iter.reset();

        return this.#token.leftArrow({
          pos: leftArrow.value.pos,
        });
      }

      throw new PegSyntaxError(
        `'<-' is expected, but '${char}' found`,
        ["LEFTARROW"],
        p.value.pos,
      );
    }

    throw new PegSyntaxError("Syntax Error", ["LEFTARROW"], EofPos);
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

    const c1 = await this.#iterator.next();
    if (c1.done) {
      throw new PegSyntaxError("Unexpected EOF", [], EofPos);
    }

    if (c1.value.char !== "-") {
      throw new Error("Unexpected char");
    }

    const c2 = await this.#iterator.next();
    if (c2.done) {
      throw new PegSyntaxError("Unexpected char", [], EofPos);
    }

    if (c2.value.char !== "-") {
      throw new PegSyntaxError("Unexpected char", [], c2.value.pos);
    }

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

    return token.comment(buf, { pos: c1.value.pos });
  }
}
