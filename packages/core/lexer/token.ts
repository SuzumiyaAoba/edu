export type TokenType = Token["type"];

export type Token =
  | Identifier
  | Literal
  | CharClass
  | Range
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

/** Identifier. */
export type Identifier = {
  type: "Identifier";
  value: string;
};

/** Literal `"..."`/`'...'`. */
export type Literal = {
  type: "Literal";
  value: string;
};

/** Class `[...]`. */
export type CharClass = {
  type: "CharClass";
  value: (string | Range)[];
};

export type Range = {
  type: "Range";
  value: [string, string];
};

/** LEFTARROW `<-`. */
export type LeftArrow = {
  type: "LEFTARROW";
};

/** SLASH `/`. */
export type Slash = {
  type: "SLASH";
};

/** AND `&`. */
export type And = {
  type: "AND";
};

/** NOT `!`. */
export type Not = {
  type: "NOT";
};

/** QUESTION `?`. */
export type Question = {
  type: "QUESTION";
};

/** STAR `*`. */
export type Star = {
  type: "STAR";
};

/** PLUS `+`. */
export type Plus = {
  type: "PLUS";
};

/** OPEN `(`. */
export type Open = {
  type: "OPEN";
};

/** CLOSE `)`. */
export type Close = {
  type: "CLOSE";
};

/** DOT `.`. */
export type Dot = {
  type: "DOT";
};

/** セミコロン `;` */
export type Semicolon = {
  type: "SEMICOLON";
};

/** コメント `# ...`. */
export type Comment = {
  type: "Comment";
  value: string;
};

/** スペース. */
export type Space = {
  type: "Space";
  value: string;
};

/** 行の終端. */
export type EndOfLine = {
  type: "EndOfLine";
};

/** ファイルの終端. */
export type EndOfFile = {
  type: "EndOfFile";
};

export type TokenWith<Meta, T extends Token = Token> = { token: T; meta: Meta };

export class Tokens<Meta> {
  identifier = (value: string, meta: Meta): TokenWith<Meta, Identifier> =>
    ({
      token: {
        type: "Identifier",
        value,
      },
      meta,
    }) as const;

  leftArrow = (meta: Meta): TokenWith<Meta, LeftArrow> =>
    ({
      token: {
        type: "LEFTARROW",
      },
      meta,
    }) as const;

  open = (meta: Meta): TokenWith<Meta, Open> =>
    ({
      token: {
        type: "OPEN",
      },
      meta,
    }) as const;

  close = (meta: Meta): TokenWith<Meta, Close> =>
    ({
      token: {
        type: "CLOSE",
      },
      meta,
    }) as const;

  charClass = (
    value: (string | Range)[],
    meta: Meta,
  ): TokenWith<Meta, CharClass> =>
    ({
      token: {
        type: "CharClass",
        value,
      },
      meta,
    }) as const;

  range = (value: [string, string], meta: Meta): TokenWith<Meta, Range> =>
    ({
      token: {
        type: "Range",
        value,
      },
      meta,
    }) as const;

  slash = (meta: Meta): TokenWith<Meta, Slash> =>
    ({
      token: {
        type: "SLASH",
      },
      meta,
    }) as const;

  dot = (meta: Meta): TokenWith<Meta, Dot> =>
    ({
      token: {
        type: "DOT",
      },
      meta,
    }) as const;

  star = (meta: Meta): TokenWith<Meta, Star> =>
    ({
      token: {
        type: "STAR",
      },
      meta,
    }) as const;

  plus = (meta: Meta): TokenWith<Meta, Plus> =>
    ({
      token: {
        type: "PLUS",
      },
      meta,
    }) as const;

  question = (meta: Meta): TokenWith<Meta, Question> =>
    ({
      token: {
        type: "QUESTION",
      },
      meta,
    }) as const;

  and = (meta: Meta): TokenWith<Meta, And> =>
    ({
      token: {
        type: "AND",
      },
      meta,
    }) as const;

  not = (meta: Meta): TokenWith<Meta, Not> =>
    ({
      token: {
        type: "NOT",
      },
      meta,
    }) as const;

  literal = (value: string, meta: Meta): TokenWith<Meta, Literal> =>
    ({
      token: {
        type: "Literal",
        value,
      },
      meta,
    }) as const;

  semicolon = (meta: Meta): TokenWith<Meta, Semicolon> =>
    ({
      token: {
        type: "SEMICOLON",
      },
      meta,
    }) as const;

  comment = (value: string, meta: Meta): TokenWith<Meta, Comment> =>
    ({
      token: {
        type: "Comment",
        value,
      },
      meta,
    }) as const;

  space = (value: string, meta: Meta): TokenWith<Meta, Space> =>
    ({
      token: {
        type: "Space",
        value,
      },
      meta,
    }) as const;

  endOfLine = (meta: Meta): TokenWith<Meta, EndOfLine> =>
    ({
      token: {
        type: "EndOfLine",
      },
      meta,
    }) as const;

  endOfFile = (meta: Meta): TokenWith<Meta, EndOfFile> =>
    ({
      token: {
        type: "EndOfFile",
      },
      meta,
    }) as const;
}
