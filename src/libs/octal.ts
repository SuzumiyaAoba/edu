export const isOctalDigit = (char: string): boolean => {
  return "0" <= char && char <= "7";
};

export const isOctalAscii = (str: string): boolean => {
  if (str.length === 1) {
    return isOctalDigit(str);
  }

  if (str.length === 2) {
    return isOctalAscii(str.charAt(0)) && isOctalAscii(str.charAt(1));
  }

  if (str.length === 3) {
    return (
      "0" <= str.charAt(0) &&
      str.charAt(0) <= "2" &&
      isOctalAscii(str.charAt(1)) &&
      isOctalAscii(str.charAt(2))
    );
  }

  return false;
};

export const octalDigitToChar = (char: string): string => {
  return String.fromCharCode(Number.parseInt(char, 8));
};
