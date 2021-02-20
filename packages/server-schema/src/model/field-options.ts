import { Type, Scalar } from "../types/type";
import { Typed } from "../types/type-utils";
import { Context } from "../types/context";
import { Info } from "../types/info";
import { GetResolver, SetResolver } from "./field";

export type Options<Source> = {
  alias?: Exclude<keyof Source, number | symbol>;
  get?: {
    resolver: GetResolver<Source>;
    args?: Record<string, Scalar>;
  };
  set?: {
    resolver: SetResolver<Source>;
    type: Scalar;
  };
  orderTarget?: Exclude<keyof Source, number | symbol>;
  filterTarget?: Exclude<keyof Source, number | symbol>;
};

export type OptionsCallback<Source, T extends Type> = (mappers: {
  get: GetMapper<Source, T>;
  set: SetMapper<Source, T>;
}) => Options<Source>;

/**
 * MAPPERS
 */

export interface GetMapper<Source, T extends Type> {
  (resolver: (source: Source, context: Context, info: Info) => Typed<T>): {
    resolver: GetResolver<Source, T, {}>;
    args: undefined;
  };
  with<A extends Record<string, Scalar>>(
    args: A
  ): (
    resolver: GetResolver<Source, T, A>
  ) => {
    resolver: GetResolver<Source, T, A>;
    args: A;
  };
}

export interface SetMapper<Source, T extends Type> {
  (resolver: SetResolver<Source, T>): {
    resolver: SetResolver<Source, T>;
    type: T;
  };
  with<TT extends Scalar>(
    type: TT
  ): (
    resolver: SetResolver<Source, TT>
  ) => {
    resolver: SetResolver<Source, TT>;
    type: TT;
  };
}
