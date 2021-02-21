import { Scalar } from "../types/type";
import { Typed } from "../types/type-utils";
import { QueryTransports } from "../types/transports";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type Filter = {
  type: Scalar;
  transport: keyof QueryTransports;
  resolver: FilterResolver;
};

export type FilterResolver<
  T extends Scalar = any,
  Tr extends keyof QueryTransports = any
> = (
  value: Typed<T>,
  query: QueryTransports[Tr],
  context: Context,
  info: Info
) => void;
