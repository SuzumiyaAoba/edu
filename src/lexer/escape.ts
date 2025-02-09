export type Escapable = "n" | "r" | "t" | "'" | "[" | "]" | "\\";

export const isEscapableChar = (char: string): char is Escapable => {
  return (
    char === "n" ||
    char === "r" ||
    char === "t" ||
    char === "'" ||
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
    case "[":
      return "[";
    case "]":
      return "]";
    case "\\":
      return "\\";
  }
};
