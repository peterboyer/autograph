// utility
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// library
export type FieldResolver = (
  parent: {} | null,
  args: {} | null,
  context: {},
  info: {}
) => any;

export type Schema<S = {}, F = {}> = {
  name: string;
  fields: { [key: string]: Field<F> };
} & S;

export type Field<F = {}> = {
  type: string;
} & F;

export type SchemaAdapter<T> = {
  defaults?: () => {};
  mutate?: (schema: Schema) => void;
  compile: (schema: Schema) => T;
};

export type SchemaFieldName = string & {};
