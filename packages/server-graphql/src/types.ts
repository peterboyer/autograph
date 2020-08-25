// utility
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// library
export type IModel<F = {}, S = {}> = {
  name: string;
  fields: { [key: string]: IModelField<F> };
} & S;

export type IModelField<F = {}> = {
  type: string;
} & F;

export type ISchemaAdapter = {
  defaults?: () => {};
  mutate?: (model: IModel) => void;
  compile: (model: IModel) => any;
};
