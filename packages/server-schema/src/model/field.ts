import { Type, Scalar } from "../types/type";
import { Typed, TypedRecord } from "../types/type-utils";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type Field<Source> = {
  name: string;
  type: Type;
  get?: Getter<Source>;
  setCreate?: Setter<undefined, Partial<Source>>;
  setUpdate?: Setter<Source>;
  setCreateToAction?: Setter<Source, void>;
  setUpdateToAction?: Setter<Source, void>;
  orderTarget?: keyof Source;
  filterTarget?: keyof Source;
};

export type Getter<Source> = {
  args?: Record<string, Scalar>;
  resolver?: GetResolver<Source>;
};

export type Setter<Source, Return = Partial<Source>> = {
  type: Scalar;
  stage: MutationStage;
  resolver?: SetResolver<Source, any, Return>;
};

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

export type SetResolver<
  Source,
  T extends Scalar = any,
  Return = Partial<Source>
> = (value: Typed<T>, source: Source, context: Context, info: Info) => Return;

export type MutationStage = "data" | "action";
