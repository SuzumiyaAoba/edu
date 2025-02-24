/**
 * プライベートコンストラクタの引数の型を取得するための型。
 */
export type PrivateConstructorParameters<T> = ConstructorParameters<
  { new (): never } & T
>;
