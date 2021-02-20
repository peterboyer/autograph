import { Type, Scalar } from "../types/type";
import { Typed, TypedRecord, AsScalar } from "../types/type-utils";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type GetResolver<
  Source,
  T extends Type = any,
  A extends Record<string, Scalar> = any
> = (
  source: Source,
  args: TypedRecord<A>,
  context: Context,
  info: Info
) => Typed<T>;

export type SetResolver<Source, T extends Type = any> = (
  value: Typed<AsScalar<T>>,
  source: Source,
  context: Context,
  info: Info
) => Partial<Source>;

export type Field<Source> = {
  name: string;
  type: Type;
  get: {
    resolver?: GetResolver<Source>;
    args?: Record<string, Scalar>;
  };
  set: {
    resolver?: SetResolver<Source>;
    type: Scalar;
  };
  orderTarget?: keyof Source;
  filterTarget?: keyof Source;
};
