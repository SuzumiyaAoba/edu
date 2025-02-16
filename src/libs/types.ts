/**
 * Extracts the private constructor parameters of a class.
 */
export type PrivateConstructorParameters<T> = ConstructorParameters<
  { new (): never } & T
>;
