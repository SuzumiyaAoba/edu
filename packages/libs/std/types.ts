export type PrivateConstructorParameters<T> = ConstructorParameters<
  { new (): never } & T
>;

export type RecursiveRequired<T> = {
  [P in keyof T]-?: RecursiveRequired<T[P]>;
};
