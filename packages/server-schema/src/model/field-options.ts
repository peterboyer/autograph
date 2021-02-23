import { MaybePromise } from "../types/utils";
import { Type, Scalar } from "../types/type";
import { Typed, AsScalar } from "../types/type-utils";
import { Hooks } from "../types/hooks";
import { Context } from "../types/context";
import { Info } from "../types/info";
import { Getter, Setter, GetResolver, SetResolver } from "./field";

export type Options<Source> = {
  alias?: Exclude<keyof Source, number | symbol>;
  get?: Getter<Source> | null;
  set?: Setter<Source | undefined, Partial<Source>> | null;
  setCreate?: Setter<undefined, Partial<Source>> | null;
  setUpdate?: Setter<Source> | null;
  setAfterData?: Setter<Source, void>;
  setCreateAfterData?: Setter<Source, void>;
  setUpdateAfterData?: Setter<Source, void>;
  hooks?: Partial<Hooks<Source>>;
  orderTarget?: Exclude<keyof Source, number | symbol>;
  filterTarget?: Exclude<keyof Source, number | symbol>;
  defaultFilters?: boolean;
};

export type OptionsCallback<Source, T extends Type> = (mappers: {
  get: GetMapper<Source, T>;
  set: SetMapper<Source, T>;
}) => Options<Source>;

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
  with<A extends Record<string, Scalar>>(
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
  (resolver: SetResolver<Source, T, void>): Setter<Source, void>;
  with: <TT extends Scalar>(
    type: TT
  ) => (resolver: SetResolver<Source, TT, void>) => Setter<Source, void>;
};

export interface SetMapper<Source, T extends Type> {
  (
    resolver: SetResolver<Source | undefined, AsScalar<T>, Partial<Source>>
  ): Setter<Source | undefined, Partial<Source>>;
  with: <TT extends Scalar>(
    type: TT
  ) => (
    resolver: SetResolver<Source | undefined, TT, Partial<Source>>
  ) => Setter<Source | undefined, Partial<Source>>;
  afterData: AfterData<Source, AsScalar<T>>;

  create: {
    (resolver: WithoutSource<SetResolver<Source, AsScalar<T>>>): Setter<
      Source | undefined,
      Partial<Source>
    >;
    with: <TT extends Scalar>(
      type: TT
    ) => (
      resolver: WithoutSource<SetResolver<Source, TT>>
    ) => Setter<Source | undefined, Partial<Source>>;
    afterData: AfterData<Source, AsScalar<T>>;
  };

  update: {
    (resolver: SetResolver<Source, AsScalar<T>>): Setter<Source>;
    with: <TT extends Scalar>(
      type: TT
    ) => (resolver: SetResolver<Source, TT>) => Setter<Source>;
    afterData: AfterData<Source, AsScalar<T>>;
  };
}
