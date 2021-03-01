import { MaybePromise } from "../types/utils";
import { Resolver } from "../types/resolver";
import { Type, Scalar } from "../types/type";
import { Typed, TypedRecord } from "../types/type-utils";
import { FieldHooks } from "../types/hooks";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type Field<Source> = {
  key: string;
  name: string;
  type: { get: Type; set: Scalar };
  get?: Getter<Source>;
  setCreate?: Setter<Source, undefined>;
  setUpdate?: Setter<Source>;
  setCreateAfterData?: Setter<Source, Source, void>;
  setUpdateAfterData?: Setter<Source, Source, void>;
  hooks: Partial<FieldHooks<Source>>;
  orderTarget?: Exclude<keyof Source, number | symbol>;
  filterTarget?: Exclude<keyof Source, number | symbol>;
  validate?: Validator<Source>;
};

export type Getter<Source> = {
  args: Record<string, Scalar>;
  resolver: GetResolver<Source>;
};

export type Setter<S, Source = S, Return = Partial<S> | any> = {
  resolver: SetResolver<S, Source, any, Return>;
};

export type GetResolver<
  Source,
  T extends Type = any,
  A extends Record<string, Scalar> = any
> = Resolver<Source, TypedRecord<A>, Typed<T>>;

export type SetResolver<
  S = any,
  Source = S,
  T extends Scalar = any,
  Return = Partial<S> | Typed<T>
> = (
  value: Typed<T>,
  source: Source,
  context: Context,
  info: Info
) => MaybePromise<Return>;

export type MutationStage = "data" | "action";

export type Validator<Source, T extends Scalar = any> = (
  value: Typed<T>,
  source: Source | undefined,
  context: Context,
  info: Info
) => MaybePromise<void | boolean | string>;
