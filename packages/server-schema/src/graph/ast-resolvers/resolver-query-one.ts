import { TAST } from "../../types/types-ast";
import { TResolver } from "../../types/types-graphql";
import TOptions, { TQuery } from "./ast-resolvers-options";

export function ResolverQueryOne(ast: TAST, options: TOptions) {
  return async (
    ...resolverArgs: Parameters<TResolver<undefined, { id: string }>>
  ) => {
    const { name } = ast;
    const [, args, context] = resolverArgs;
    const { id } = args;

    const query_default: TQuery = {
      name,
      context,
    };

    const query = {
      ...query_default,
      id,
    };

    const queryResolver = ast.query.one || ast.query.default || undefined;
    const queryResolverWrapped =
      queryResolver &&
      ((query: Record<string, any>) => queryResolver(query, context));
    const {
      items: [item],
    } = (await options.adapter.onQuery(query, queryResolverWrapped)) as {
      items: (Record<string, any> | undefined)[];
    };

    if (!item) {
      throw new Error("NOT_FOUND");
    }

    return item;
  };
}

export default ResolverQueryOne;
