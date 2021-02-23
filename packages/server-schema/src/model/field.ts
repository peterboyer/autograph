import { MaybePromise } from "../types/utils";
import { Resolver } from "../types/resolver";
import { Type, Scalar } from "../types/type";
import { Typed, TypedRecord } from "../types/type-utils";
import { Hooks } from "../types/hooks";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type Field<Source> = {
  name: string;
  type: Type;
  get?: Getter<Source>;
  setCreate?: Setter<undefined, Partial<Source>>;
  setUpdate?: Setter<Source>;
  setCreateAfterData?: Setter<Source, void>;
  setUpdateAfterData?: Setter<Source, void>;
  hooks: Partial<Hooks<Source>>;
  orderTarget?: Exclude<keyof Source, number | symbol>;
  filterTarget?: Exclude<keyof Source, number | symbol>;
};

export type Getter<Source> = {
  args: Record<string, Scalar>;
  resolver: GetResolver<Source>;
};

export type Setter<Source, Return = Partial<Source> | void> = {
  type: Scalar;
  resolver: SetResolver<Source, any, Return>;
};

export type GetResolver<
  Source,
  T extends Type = any,
  A extends Record<string, Scalar> = any
> = Resolver<Source, TypedRecord<A>, Typed<T>>;

export type SetResolver<
  Source = any,
  T extends Scalar = any,
  Return = Partial<Source>
> = (
  value: Typed<T>,
  source: Source,
  context: Context,
  info: Info
) => MaybePromise<Return>;

export type MutationStage = "data" | "action";
