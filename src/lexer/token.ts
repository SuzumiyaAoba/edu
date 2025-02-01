export type TokenType = Token["type"];

export type Token =
  | Identifier
  | LeftArrow
  | LeftBracket
  | RightBracket
  | CharClass
  | Choice
  | KleeneStar
  | OneOrMore
  | Optional
  | PositiveLookahead
  | NegativeLookahead
  | Literal
  | Semicolon
  | Comment
  | Eol
  | Eof;

/** 非終端記号. */
export type Identifier = {
  type: "Identifier";
  value: string;
};

/** 左矢印 `<-`. */
export type LeftArrow = {
  type: "LeftArrow";
};

/** 左括弧 `(`. */
export type LeftBracket = {
  type: "LeftBracket";
};

/** 右括弧 `)`. */
export type RightBracket = {
  type: "RightBracket";
};

/** 文字クラス `[...]`. */
export type CharClass = {
  type: "CharClass";
  value: string;
};

/** 選択 `/`. */
export type Choice = {
  type: "Choice";
};

/** クリーネ・スター `*`. */
export type KleeneStar = {
  type: "KleeneStar";
};

/** 1回以上の繰り返し `+`. */
export type OneOrMore = {
  type: "OneOrMore";
};

/** 0回または1回 `?`. */
export type Optional = {
  type: "Optional";
};

/** 肯定先読み `&`. */
export type PositiveLookahead = {
  type: "PositiveLookahead";
};

/** 否定先読み `!`. */
export type NegativeLookahead = {
  type: "NegativeLookahead";
};

/** 文字列 `"`. */
export type Literal = {
  type: "Literal";
  value: string;
};

/** セミコロン `.` */
export type Semicolon = {
  type: "Semicolon";
};

/** コメント. */
export type Comment = {
  type: "Comment";
  value: string;
};

/** 行の終端. */
export type Eol = {
  type: "EOL";
};

/** ファイルの終端. */
export type Eof = {
  type: "EOF";
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
    type: "LeftArrow",
  },
  ...meta,
});

export const leftBracket = <T>(meta: T): TokenWith<LeftBracket, T> => ({
  token: {
    type: "LeftBracket",
  },
  ...meta,
});

export const rightBracket = <T>(meta: T): TokenWith<RightBracket, T> => ({
  token: {
    type: "RightBracket",
  },
  ...meta,
});

export const charClass = <T>(
  value: string,
  meta: T,
): TokenWith<CharClass, T> => ({
  token: {
    type: "CharClass",
    value,
  },
  ...meta,
});

export const choice = <T>(meta: T): TokenWith<Choice, T> => ({
  token: {
    type: "Choice",
  },
  ...meta,
});

export const kleeneStar = <T>(meta: T): TokenWith<KleeneStar, T> => ({
  token: {
    type: "KleeneStar",
  },
  ...meta,
});

export const oneOrMore = <T>(meta: T): TokenWith<OneOrMore, T> => ({
  token: {
    type: "OneOrMore",
  },
  ...meta,
});

export const optional = <T>(meta: T): TokenWith<Optional, T> => ({
  token: {
    type: "Optional",
  },
  ...meta,
});

export const positiveLookahead = <T>(
  meta: T,
): TokenWith<PositiveLookahead, T> => ({
  token: {
    type: "PositiveLookahead",
  },
  ...meta,
});

export const negativeLookahead = <T>(
  meta: T,
): TokenWith<NegativeLookahead, T> => ({
  token: {
    type: "NegativeLookahead",
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
    type: "Semicolon",
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

export const eol = <T>(meta: T): TokenWith<Eol, T> => ({
  token: {
    type: "EOL",
  },
  ...meta,
});

export const eof = <T>(meta: T): TokenWith<Eof, T> => ({
  token: {
    type: "EOF",
  },
  ...meta,
});
