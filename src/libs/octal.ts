export const isOctalDigit = (char: string): boolean => {
  return char >= "0" && char <= "7";
};

export const octalDigitToChar = (char: string): string => {
  return String.fromCharCode(Number.parseInt(char, 8));
};
