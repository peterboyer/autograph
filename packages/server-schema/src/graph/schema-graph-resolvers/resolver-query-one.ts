import { TQuerier, TResolver } from "../schema-graph-types";
import TResolverIOC from "./resolver-ioc";

export function ResolverQueryOne(ioc: TResolverIOC) {
  return function (querier?: TQuerier): TResolver<undefined, { id: string }> {
    return async (...resolverArgs: Parameters<TResolver>) => {
      const [, args] = resolverArgs;
      return ioc.queryByIdOrThrow(args, resolverArgs, querier);
    };
  };
}
