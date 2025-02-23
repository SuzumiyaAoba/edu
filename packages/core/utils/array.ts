export const isEmptyArray = <T>(arr: T[]): arr is [] => {
  return arr.length === 0;
};

export const isNonEmptyArray = <T>(arr: T[]): arr is [T, ...T[]] => {
  return arr.length > 0;
};

export const isSingleElementArray = <T>(arr: T[]): arr is [T] => {
  return arr.length === 1;
};
