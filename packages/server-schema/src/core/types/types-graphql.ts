import { GraphQLResolveInfo } from "graphql";

export type TResolver<
  TSource = any,
  TArgs = any,
  TContext = any,
  TReturn = any
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TReturn;
