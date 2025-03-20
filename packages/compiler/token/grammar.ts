export type TokenType = Token["type"];

export type Token =
  | Identifier
  | Literal
  | CharClass
  | LeftArrow
  | Slash
  | And
  | Not
  | Question
  | Star
  | Plus
  | Open
  | Close
  | Dot
  | Semicolon
  | Comment
  | Space
  | EndOfLine
  | EndOfFile;

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
  value: readonly CharClassElement[];
};

export type CharClassElement =
  | {
      type: "char";
      value: string;
    }
  | {
      type: "range";
      value: [string, string];
    };

export type LeftArrow = {
  type: "LEFTARROW";
  value: "<-";
};

export type Slash = {
  type: "SLASH";
  value: "/";
};

export type And = {
  type: "AND";
  value: "&";
};

export type Not = {
  type: "NOT";
  value: "!";
};

export type Question = {
  type: "QUESTION";
  value: "?";
};

export type Star = {
  type: "STAR";
  value: "*";
};

export type Plus = {
  type: "PLUS";
  value: "+";
};

export type Open = {
  type: "OPEN";
  value: "(";
};

export type Close = {
  type: "CLOSE";
  value: ")";
};

export type Dot = {
  type: "DOT";
  value: ".";
};

export type Semicolon = {
  type: "SEMICOLON";
  value: ";";
};

export type Comment = {
  type: "Comment";
  value: string;
};

export type Space = {
  type: "Space";
  value: string;
};

export type EndOfLine = {
  type: "EndOfLine";
  value: string;
};

export type EndOfFile = {
  type: "EndOfFile";
  value: "\0";
};

export type TokenWith<META, TOKEN extends Token = Token> = {
  token: TOKEN;
  meta: META;
};

export class Tokens<META> {
  identifier = (value: string, meta: META): TokenWith<META, Identifier> =>
    ({
      token: {
        type: "Identifier",
        value,
      },
      meta,
    }) as const;

  leftArrow = (meta: META): TokenWith<META, LeftArrow> =>
    ({
      token: {
        type: "LEFTARROW",
        value: "<-",
      },
      meta,
    }) as const;

  open = (meta: META): TokenWith<META, Open> =>
    ({
      token: {
        type: "OPEN",
        value: "(",
      },
      meta,
    }) as const;

  close = (meta: META): TokenWith<META, Close> =>
    ({
      token: {
        type: "CLOSE",
        value: ")",
      },
      meta,
    }) as const;

  charClass = (
    value: CharClassElement[],
    meta: META,
  ): TokenWith<META, CharClass> =>
    ({
      token: {
        type: "CharClass",
        value,
      },
      meta,
    }) as const;

  char = (value: string): CharClassElement =>
    ({
      type: "char",
      value,
    }) as const;

  range = (value: [string, string]): CharClassElement =>
    ({
      type: "range",
      value,
    }) as const;

  slash = (meta: META): TokenWith<META, Slash> =>
    ({
      token: {
        type: "SLASH",
        value: "/",
      },
      meta,
    }) as const;

  dot = (meta: META): TokenWith<META, Dot> =>
    ({
      token: {
        type: "DOT",
        value: ".",
      },
      meta,
    }) as const;

  star = (meta: META): TokenWith<META, Star> =>
    ({
      token: {
        type: "STAR",
        value: "*",
      },
      meta,
    }) as const;

  plus = (meta: META): TokenWith<META, Plus> =>
    ({
      token: {
        type: "PLUS",
        value: "+",
      },
      meta,
    }) as const;

  question = (meta: META): TokenWith<META, Question> =>
    ({
      token: {
        type: "QUESTION",
        value: "?",
      },
      meta,
    }) as const;

  and = (meta: META): TokenWith<META, And> =>
    ({
      token: {
        type: "AND",
        value: "&",
      },
      meta,
    }) as const;

  not = (meta: META): TokenWith<META, Not> =>
    ({
      token: {
        type: "NOT",
        value: "!",
      },
      meta,
    }) as const;

  literal = (value: string, meta: META): TokenWith<META, Literal> =>
    ({
      token: {
        type: "Literal",
        value,
      },
      meta,
    }) as const;

  semicolon = (meta: META): TokenWith<META, Semicolon> =>
    ({
      token: {
        type: "SEMICOLON",
        value: ";",
      },
      meta,
    }) as const;

  comment = (value: string, meta: META): TokenWith<META, Comment> =>
    ({
      token: {
        type: "Comment",
        value,
      },
      meta,
    }) as const;

  space = (value: string, meta: META): TokenWith<META, Space> =>
    ({
      token: {
        type: "Space",
        value,
      },
      meta,
    }) as const;

  endOfLine = (value: string, meta: META): TokenWith<META, EndOfLine> =>
    ({
      token: {
        type: "EndOfLine",
        value: value,
      },
      meta,
    }) as const;

  endOfFile = (meta: META): TokenWith<META, EndOfFile> =>
    ({
      token: {
        type: "EndOfFile",
        value: "\0",
      },
      meta,
    }) as const;
}
