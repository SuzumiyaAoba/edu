/**
 * @see https://zenn.dev/chot/articles/321f58dfa01339
 */
export type NonEmptyArray<T> = [T, ...T[]] | [...T[], T];

export type ReadOnlyNonEmptyArray<T> =
  | readonly [T, ...T[]]
  | readonly [...T[], T];

export const isEmptyArray = <T>(arr: readonly T[]): arr is [] => {
  return arr.length === 0;
};

export const isNonEmptyArray = <T>(
  arr: readonly T[],
): arr is NonEmptyArray<T> => {
  return arr.length > 0;
};

export const isSingleElementArray = <T>(arr: readonly T[]): arr is [T] => {
  return arr.length === 1;
};

export const replaceLast = <T>(
  arr: NonEmptyArray<T>,
  callback: (last: T) => T,
): void => {
  const exsiting = arr.pop();

  if (exsiting === undefined) {
    throw new Error("Illegal state");
  }

  const replacement = callback(exsiting);

  arr.push(replacement);
};
