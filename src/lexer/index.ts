import { PegSyntaxError } from "./error";
import {
  type CharGenerator,
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

const consumeLeftArrow = async (
  gen: CharGenerator,
): Promise<ConsumeResult<LeftArrow>> => {
  const p = await gen.next();
  if (!p.done) {
    const { char } = p.value;

    if (char === "-") {
      return {
        token: {
          type: "LeftArrow",
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
  gen: CharGenerator,
): Promise<ConsumeResult<Identifier>> => {
  let buf = fl;

  let p: CharIteratorResult;
  while (
    // biome-ignore lint/suspicious/noAssignInExpressions:
    (p = await gen.next()) &&
    !p.done
  ) {
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
  gen: CharGenerator,
): Promise<ConsumeResult<Literal>> => {
  // TODO: escape

  let buf = "";
  let p: CharIteratorResult;
  while (
    // biome-ignore lint/suspicious/noAssignInExpressions:
    (p = await gen.next()) &&
    !p.done
  ) {
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

const consumeCharClass = async (
  gen: CharGenerator,
): Promise<ConsumeResult<CharClass>> => {
  // TODO: escape

  let buf = "";
  let p: CharIteratorResult;
  while (
    // biome-ignore lint/suspicious/noAssignInExpressions:
    (p = await gen.next()) &&
    !p.done
  ) {
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
  gen: CharGenerator,
): Promise<ConsumeResult<Comment>> => {
  let buf = "";
  let p: CharIteratorResult;
  while (
    // biome-ignore lint/suspicious/noAssignInExpressions:
    (p = await gen.next()) &&
    !p.done
  ) {
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
  const gen = charGenerator(readable);

  let lookahead: [] | [CharIteratorResult] = [];
  let p: CharIteratorResult;
  while (
    // biome-ignore lint/suspicious/noAssignInExpressions:
    (p = lookahead.length === 0 ? await gen.next() : lookahead[0]) &&
    !p.done
  ) {
    lookahead = [];
    const { char, pos } = p.value;

    if (char === "\n") {
      yield token.eol({ pos });
    } else if (char.match(spaceRegex)) {
    } else if (char === '"') {
      const literal = await consumeLiteral(gen);
      yield token.literal(literal.token.value, { pos });
      lookahead = literal.lookahead ?? [];
    } else if (char === "<") {
      await consumeLeftArrow(gen);
      yield token.leftArrow({ pos });
    } else if (char === "/") {
      yield token.choice({ pos });
    } else if (char === "(") {
      yield token.leftBracket({ pos });
    } else if (char === ")") {
      yield token.rightBracket({ pos });
    } else if (char === "[") {
      const charClass = await consumeCharClass(gen);
      yield token.charClass(charClass.token.value, { pos });
    } else if (char === "*") {
      yield token.kleeneStar({ pos });
    } else if (char === "+") {
      yield token.oneOrMore({ pos });
    } else if (char === "&") {
      yield token.positiveLookahead({ pos });
    } else if (char === "!") {
      yield token.negativeLookahead({ pos });
    } else if (char === ";") {
      yield token.semicolon({ pos });
    } else if (char === "-") {
      const { value, done } = await gen.next();
      if (done) {
        throw new PegSyntaxError(
          "Expected `-`, but actual is EOF",
          "Comment",
          pos,
        );
      }
      if (value.char === "-") {
        const comment = await consumeComment(gen);
        yield token.comment(comment.token.value, { pos });
        lookahead = comment.lookahead ?? [];
      } else {
        throw new PegSyntaxError(
          `Expected \`-\`, but actual is \`${value.char}\` at ${JSON.stringify(pos)}`,
          "Comment",
          pos,
        );
      }
    } else if (char.match(identifierRegex)) {
      const identifier = await consumeIdentifier(char, gen);
      yield token.identifier(identifier.token.value, { pos });
      lookahead = identifier.lookahead ?? [];
    }
  }

  yield token.eof({
    pos: {
      column: -1,
      line: -1,
    },
  });
};
