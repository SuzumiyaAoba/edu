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

export const identifier = <Meta>(
  value: string,
  meta: Meta,
): TokenWith<Meta, Identifier> =>
  ({
    token: {
      type: "Identifier",
      value,
    },
    meta,
  }) as const;

export const leftArrow = <Meta>(meta: Meta): TokenWith<Meta, LeftArrow> =>
  ({
    token: {
      type: "LEFTARROW",
    },
    meta,
  }) as const;

export const open = <Meta>(meta: Meta): TokenWith<Meta, Open> =>
  ({
    token: {
      type: "OPEN",
    },
    meta,
  }) as const;

export const close = <Meta>(meta: Meta): TokenWith<Meta, Close> =>
  ({
    token: {
      type: "CLOSE",
    },
    meta,
  }) as const;

export const charClass = <Meta>(
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

export const range = <Meta>(
  value: [string, string],
  meta: Meta,
): TokenWith<Meta, Range> =>
  ({
    token: {
      type: "Range",
      value,
    },
    meta,
  }) as const;

export const slash = <Meta>(meta: Meta): TokenWith<Meta, Slash> =>
  ({
    token: {
      type: "SLASH",
    },
    meta,
  }) as const;

export const dot = <Meta>(meta: Meta): TokenWith<Meta, Dot> =>
  ({
    token: {
      type: "DOT",
    },
    meta,
  }) as const;

export const star = <Meta>(meta: Meta): TokenWith<Meta, Star> =>
  ({
    token: {
      type: "STAR",
    },
    meta,
  }) as const;

export const plus = <Meta>(meta: Meta): TokenWith<Meta, Plus> =>
  ({
    token: {
      type: "PLUS",
    },
    meta,
  }) as const;

export const question = <Meta>(meta: Meta): TokenWith<Meta, Question> =>
  ({
    token: {
      type: "QUESTION",
    },
    meta,
  }) as const;

export const and = <Meta>(meta: Meta): TokenWith<Meta, And> =>
  ({
    token: {
      type: "AND",
    },
    meta,
  }) as const;

export const not = <Meta>(meta: Meta): TokenWith<Meta, Not> =>
  ({
    token: {
      type: "NOT",
    },
    meta,
  }) as const;

export const literal = <Meta>(
  value: string,
  meta: Meta,
): TokenWith<Meta, Literal> =>
  ({
    token: {
      type: "Literal",
      value,
    },
    meta,
  }) as const;

export const semicolon = <Meta>(meta: Meta): TokenWith<Meta, Semicolon> =>
  ({
    token: {
      type: "SEMICOLON",
    },
    meta,
  }) as const;

export const comment = <Meta>(
  value: string,
  meta: Meta,
): TokenWith<Meta, Comment> =>
  ({
    token: {
      type: "Comment",
      value,
    },
    meta,
  }) as const;

export const space = <Meta>(
  value: string,
  meta: Meta,
): TokenWith<Meta, Space> =>
  ({
    token: {
      type: "Space",
      value,
    },
    meta,
  }) as const;

export const endOfLine = <Meta>(meta: Meta): TokenWith<Meta, EndOfLine> =>
  ({
    token: {
      type: "EndOfLine",
    },
    meta,
  }) as const;

export const endOfFile = <Meta>(meta: Meta): TokenWith<Meta, EndOfFile> =>
  ({
    token: {
      type: "EndOfFile",
    },
    meta,
  }) as const;
