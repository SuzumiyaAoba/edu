export type Escapable = "n" | "r" | "t" | "'" | '"' | "[" | "]" | "\\";

export const isEscapableChar = (char: string): char is Escapable => {
  return (
    char === "n" ||
    char === "r" ||
    char === "t" ||
    char === "'" ||
    char === '"' ||
    char === "[" ||
    char === "]" ||
    char === "\\"
  );
};

export const unescapeChar = (char: Escapable): string => {
  switch (char) {
    case "n":
      return "\n";
    case "r":
      return "\r";
    case "t":
      return "\t";
    case "'":
      return "'";
    case '"':
      return '"';
    case "[":
      return "[";
    case "]":
      return "]";
    case "\\":
      return "\\";
  }
};

const escapeChar = (char: string, inCharClass = false): string => {
  switch (char) {
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "\t":
      return "\\t";
    case "'":
      return inCharClass ? "'" : "\\'";
    case '"':
      return inCharClass ? '"' : '\\"';
    case "[":
      return inCharClass ? "\\[" : "[";
    case "]":
      return inCharClass ? "\\]" : "]";
    case "\\":
      return "\\\\";
  }

  return char;
};

export const escapeString = (str: string, inCharClass = false): string => {
  let buf = "";
  for (let i = 0; i < str.length; i++) {
    buf += escapeChar(str.charAt(i), inCharClass);
  }

  return buf;
};
