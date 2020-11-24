import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions from "./ast-resolvers-options";

export function ResolverQueryOne(ast: TAST, options: TOptions) {
  return async (
    ...resolverArgs: Parameters<TResolver<undefined, { id: string }>>
  ) => {
    const { name } = ast;
    const [, args, context] = resolverArgs;
    const { id } = args;

    const {
      items: [item],
    } = await options.onQuery({ name, id, context });

    return item;
  };
}

export default ResolverQueryOne;
