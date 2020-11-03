import getTransactors from "./resolver-mutation-transactors";

const resolverMutationUpdate: TResolver<
  never,
  { data: { id: any; [key: string]: any }[] }
> = async (...resolverArgs) => {
  const [, args] = resolverArgs;
  const { data } = args || {};
  if (!data.length) return [];
  const itemTransactors = getDataItemTransactors(data, resolverArgs);
  return queryOnUpdate(name, itemTransactors, resolverArgs, queryOne);
};
