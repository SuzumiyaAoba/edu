export const isEmptyArray = <T>(arr: T[]): arr is [] => {
  return arr.length === 0;
};

export const isNonEmptyArray = <T>(arr: T[]): arr is [T, ...T[]] => {
  return arr.length > 0;
};

export const isSingleElementArray = <T>(arr: T[]): arr is [T] => {
  return arr.length === 1;
};

export const replaceLast = <T>(arr: [T, ...T[]], callback: (last: T) => T) => {
  const last = arr.pop();

  if (last === undefined) {
    throw new Error("Illegal state");
  }

  const newElm = callback(last);

  arr.push(newElm);
};
