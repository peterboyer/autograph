import { Scalar } from "../types/type";
import { Typed } from "../types/type-utils";
import { QueryTransport, AdapterTransport } from "../types/transports";
import { Context } from "../types/context";
import { Info } from "../types/info";

export type Transport = "query" | "adapter";

export type Filter = {
  name: string;
  type: Scalar;
  transport: Transport;
  resolver: FilterResolver;
};

export type FilterResolver<
  T extends Scalar = any,
  Tr extends Transport = any
> = (
  value: Typed<T>,
  query: Tr extends "query" ? QueryTransport : AdapterTransport,
  context: Context,
  info: Info
) => void;
