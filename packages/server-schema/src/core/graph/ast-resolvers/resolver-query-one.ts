import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

export function ResolverQueryOne(name: string, options: TOptions) {
  return async (...resolverArgs: Parameters<TResolver>) => {
    const [, args] = resolverArgs;

    const { id } = args;
    const [queryResult] = await options.onQuery({
      name,
      id,
    });

    return queryResult;
  };
}

export default ResolverQueryOne;
