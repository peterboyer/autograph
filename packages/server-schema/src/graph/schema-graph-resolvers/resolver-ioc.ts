import { TOptions } from "../schema-graph-types";

export type TResolverIOC = {
  limitDefault: TOptions["limitDefault"];
  limitMaxDefault: TOptions["limitMaxDefault"];
  queryById: TOptions["queryById"];
  queryByIdOrThrow: TOptions["queryById"];
  queryByArgs: TOptions["queryByArgs"];
  queryOnCreate: TOptions["queryOnCreate"];
  queryOnUpdate: TOptions["queryOnUpdate"];
  queryOnDelete: TOptions["queryOnDelete"];
  errors: TOptions["errors"];
};

export default TResolverIOC;
