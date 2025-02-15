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

/** 行の終端. */
export type EndOfLine = {
  type: "EndOfLine";
};

/** ファイルの終端. */
export type EndOfFile = {
  type: "EndOfFile";
};

export type TokenWith<T extends Token, Meta> = { token: T } & Meta;

export const identifier = <T>(
  value: string,
  meta: T,
): TokenWith<Identifier, T> =>
  ({
    token: {
      type: "Identifier",
      value,
    },
    ...meta,
  }) as const;

export const leftArrow = <T>(meta: T): TokenWith<LeftArrow, T> =>
  ({
    token: {
      type: "LEFTARROW",
    },
    ...meta,
  }) as const;

export const open = <T>(meta: T): TokenWith<Open, T> =>
  ({
    token: {
      type: "OPEN",
    },
    ...meta,
  }) as const;

export const close = <T>(meta: T): TokenWith<Close, T> =>
  ({
    token: {
      type: "CLOSE",
    },
    ...meta,
  }) as const;

export const charClass = <T>(
  value: (string | Range)[],
  meta: T,
): TokenWith<CharClass, T> =>
  ({
    token: {
      type: "CharClass",
      value,
    },
    ...meta,
  }) as const;

export const range = <T>(
  value: [string, string],
  meta: T,
): TokenWith<Range, T> =>
  ({
    token: {
      type: "Range",
      value,
    },
    ...meta,
  }) as const;

export const slash = <T>(meta: T): TokenWith<Slash, T> =>
  ({
    token: {
      type: "SLASH",
    },
    ...meta,
  }) as const;

export const dot = <T>(meta: T): TokenWith<Dot, T> =>
  ({
    token: {
      type: "DOT",
    },
    ...meta,
  }) as const;

export const star = <T>(meta: T): TokenWith<Star, T> =>
  ({
    token: {
      type: "STAR",
    },
    ...meta,
  }) as const;

export const plus = <T>(meta: T): TokenWith<Plus, T> =>
  ({
    token: {
      type: "PLUS",
    },
    ...meta,
  }) as const;

export const question = <T>(meta: T): TokenWith<Question, T> =>
  ({
    token: {
      type: "QUESTION",
    },
    ...meta,
  }) as const;

export const and = <T>(meta: T): TokenWith<And, T> =>
  ({
    token: {
      type: "AND",
    },
    ...meta,
  }) as const;

export const not = <T>(meta: T): TokenWith<Not, T> =>
  ({
    token: {
      type: "NOT",
    },
    ...meta,
  }) as const;

export const literal = <T>(value: string, meta: T): TokenWith<Literal, T> =>
  ({
    token: {
      type: "Literal",
      value,
    },
    ...meta,
  }) as const;

export const semicolon = <T>(meta: T): TokenWith<Semicolon, T> =>
  ({
    token: {
      type: "SEMICOLON",
    },
    ...meta,
  }) as const;

export const comment = <T>(value: string, meta: T): TokenWith<Comment, T> =>
  ({
    token: {
      type: "Comment",
      value,
    },
    ...meta,
  }) as const;

export const endOfLine = <T>(meta: T): TokenWith<EndOfLine, T> =>
  ({
    token: {
      type: "EndOfLine",
    },
    ...meta,
  }) as const;

export const endOfFile = <T>(meta: T): TokenWith<EndOfFile, T> =>
  ({
    token: {
      type: "EndOfFile",
    },
    ...meta,
  }) as const;
