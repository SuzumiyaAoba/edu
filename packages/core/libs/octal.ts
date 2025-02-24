/**
 * 引数で受け取った文字列が 8 進数 (正規表現: `[0-7]`) かどうかを判定する。
 *
 * @param char 長さ1の文字列
 * @returns 0 から 7 の文字のときは `true`、それ以外は `false`
 */
export const isOctalDigit = (char: string): boolean => {
  return char.length === 1 && "0" <= char && char <= "7";
};

/**
 * 引数で受け取った文字列が ASCII 文字を表現する 8 進数 (`[0-7][0-7]?|[0-2][0-7][0-7]`) かどうかを判定する。
 *
 * @param str 文字列
 * @returns ASCII 文字を表現する 8 進数のときは `true`、それ以外は `false`
 */
export const isOctalAscii = (str: string): boolean => {
  if (str.length === 1) {
    return isOctalDigit(str);
  }

  if (str.length === 2) {
    return isOctalDigit(str.charAt(0)) && isOctalDigit(str.charAt(1));
  }

  if (str.length === 3) {
    const char = str.charAt(0);
    return (
      "0" <= char &&
      char <= "2" &&
      isOctalDigit(str.charAt(1)) &&
      isOctalDigit(str.charAt(2))
    );
  }

  return false;
};

/**
 * ASCII 文字を表現する 8 進数を文字に変換して返す。
 *
 * @param str ASCII 文字を表現する 8 進数
 * @returns ASCII 文字
 */
export const octalDigitToChar = (str: string): string => {
  if (!isOctalAscii(str)) {
    throw new Error("Invalid octal ASCII");
  }
  return String.fromCharCode(Number.parseInt(str, 8));
};
