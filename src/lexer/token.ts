export type TokenType = Token["type"];

export type Token =
  | Identifier
  | LeftArrow
  | Open
  | Close
  | CharacterClass
  | Slash
  | Dot
  | Star
  | Plus
  | Question
  | And
  | Not
  | Literal
  | Semicolon
  | Comment
  | EndOfLine
  | EndOfFile;

/** 非終端記号. */
export type Identifier = {
  type: "Identifier";
  value: string;
};

/** 左矢印 `<-`. */
export type LeftArrow = {
  type: "LEFTARROW";
};

/** OPEN `(`. */
export type Open = {
  type: "OPEN";
};

/** CLOSE `)`. */
export type Close = {
  type: "CLOSE";
};

/** 文字クラス `[...]`. */
export type CharacterClass = {
  type: "CharacterClass";
  value: string;
};

/** STAR `/`. */
export type Slash = {
  type: "SLASH";
};

/** DOT `.`. */
export type Dot = {
  type: "DOT";
};

/** STAR `*`. */
export type Star = {
  type: "STAR";
};

/** PLUS `+`. */
export type Plus = {
  type: "PLUS";
};

/** QUESTION `?`. */
export type Question = {
  type: "QUESTION";
};

/** AND `&`. */
export type And = {
  type: "AND";
};

/** NOT `!`. */
export type Not = {
  type: "NOT";
};

/** 文字列 `"..."`. */
export type Literal = {
  type: "Literal";
  value: string;
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
): TokenWith<Identifier, T> => ({
  token: {
    type: "Identifier",
    value,
  },
  ...meta,
});

export const leftArrow = <T>(meta: T): TokenWith<LeftArrow, T> => ({
  token: {
    type: "LEFTARROW",
  },
  ...meta,
});

export const open = <T>(meta: T): TokenWith<Open, T> => ({
  token: {
    type: "OPEN",
  },
  ...meta,
});

export const close = <T>(meta: T): TokenWith<Close, T> => ({
  token: {
    type: "CLOSE",
  },
  ...meta,
});

export const charClass = <T>(
  value: string,
  meta: T,
): TokenWith<CharacterClass, T> => ({
  token: {
    type: "CharacterClass",
    value,
  },
  ...meta,
});

export const slash = <T>(meta: T): TokenWith<Slash, T> => ({
  token: {
    type: "SLASH",
  },
  ...meta,
});

export const dot = <T>(meta: T): TokenWith<Dot, T> => ({
  token: {
    type: "DOT",
  },
  ...meta,
});

export const star = <T>(meta: T): TokenWith<Star, T> => ({
  token: {
    type: "STAR",
  },
  ...meta,
});

export const plus = <T>(meta: T): TokenWith<Plus, T> => ({
  token: {
    type: "PLUS",
  },
  ...meta,
});

export const question = <T>(meta: T): TokenWith<Question, T> => ({
  token: {
    type: "QUESTION",
  },
  ...meta,
});

export const and = <T>(
  meta: T,
): TokenWith<And, T> => ({
  token: {
    type: "AND",
  },
  ...meta,
});

export const not = <T>(
  meta: T,
): TokenWith<Not, T> => ({
  token: {
    type: "NOT",
  },
  ...meta,
});

export const literal = <T>(value: string, meta: T): TokenWith<Literal, T> => ({
  token: {
    type: "Literal",
    value,
  },
  ...meta,
});

export const semicolon = <T>(meta: T): TokenWith<Semicolon, T> => ({
  token: {
    type: "SEMICOLON",
  },
  ...meta,
});

export const comment = <T>(value: string, meta: T): TokenWith<Comment, T> => ({
  token: {
    type: "Comment",
    value,
  },
  ...meta,
});

export const endOfLine = <T>(meta: T): TokenWith<EndOfLine, T> => ({
  token: {
    type: "EndOfLine",
  },
  ...meta,
});

export const endOfFile = <T>(meta: T): TokenWith<EndOfFile, T> => ({
  token: {
    type: "EndOfFile",
  },
  ...meta,
});
