import { MaybePromise } from "../types/utils";
import { Type, Scalar } from "../types/type";
import { Typed } from "../types/type-utils";
import { FieldHooks } from "../types/hooks";
import { Context } from "../types/context";
import { Info } from "../types/info";
import { Getter, Setter, GetResolver, SetResolver, Validator } from "./field";

export type Options<Source, SetType extends Scalar> = {
  alias?: Exclude<keyof Source, number | symbol>;
  get?: Getter<Source> | null;
  set?: Setter<Source, Source | undefined> | null;
  setCreate?: Setter<Source, undefined> | null;
  setUpdate?: Setter<Source> | null;
  setAfterData?: Setter<Source, Source, void>;
  setCreateAfterData?: Setter<Source, Source, void>;
  setUpdateAfterData?: Setter<Source, Source, void>;
  orderTarget?: Exclude<keyof Source, number | symbol>;
  filterTarget?: Exclude<keyof Source, number | symbol>;
  defaultFilters?: boolean;
  validate?: Validator<Source, SetType> | Validator<Source, SetType>[];
} & {
  onGet?: FieldHooks<Source>["onGet"];
  onSet?: FieldHooks<Source>["onSet"];
  onUse?: FieldHooks<Source>["onUse"];
  onModelCreate?: FieldHooks<Source>["onCreate"];
  onModelCreateAfterData?: FieldHooks<Source>["onCreateAfterData"];
  onModelUpdate?: FieldHooks<Source>["onUpdate"];
  onModelUpdateAfterData?: FieldHooks<Source>["onUpdateAfterData"];
  onModelDelete?: FieldHooks<Source>["onDelete"];
  onModelDeleteAfterData?: FieldHooks<Source>["onDeleteAfterData"];
  onModelMutation?: FieldHooks<Source>["onMutation"];
  onModelMutationAfterData?: FieldHooks<Source>["onMutationAfterData"];
};

export type OptionsCallback<
  Source,
  GetType extends Type,
  SetType extends Scalar
> = (mappers: {
  get: GetMapper<Source, GetType>;
  set: SetMapper<Source, SetType>;
}) => Options<Source, SetType>;

/**
 * MAPPERS
 */

export interface GetMapper<Source, T extends Type> {
  (
    resolver: (
      source: Source,
      context: Context,
      info: Info
    ) => MaybePromise<Typed<T>>
  ): {
    args: {};
    resolver: GetResolver<Source, T, {}>;
  };
  args<A extends Record<string, Scalar>>(
    args: A
  ): (
    resolver: GetResolver<Source, T, A>
  ) => {
    args: A;
    resolver: GetResolver<Source, T, A>;
  };
}

type WithoutSource<R extends SetResolver> = (
  value: Parameters<R>[0],
  context: Parameters<R>[2],
  info: Parameters<R>[3]
) => ReturnType<R>;

type AfterData<Source, T extends Scalar> = {
  (resolver: SetResolver<Source, Source, T, void>): Setter<
    Source,
    Source,
    void
  >;
};

export interface SetMapper<Source, T extends Scalar> {
  (resolver: SetResolver<Source, Source | undefined, T>): Setter<
    Source | undefined
  >;
  afterData: AfterData<Source, T>;

  create: {
    (resolver: WithoutSource<SetResolver<Source, T>>): Setter<
      Source | undefined
    >;
    afterData: AfterData<Source, T>;
  };

  update: {
    (resolver: SetResolver<Source, Source, T>): Setter<Source> | Typed<T>;
    afterData: AfterData<Source, T>;
  };
}
