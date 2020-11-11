import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

export function ResolverQueryOne(name: string, options: TOptions) {
  return async (...resolverArgs: Parameters<TResolver>) => {
    const [, args] = resolverArgs;
    return options.queryById(name, args.id);
  };
}

export default ResolverQueryOne;
