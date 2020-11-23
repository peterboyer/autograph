// @ts-nocheck
import getTransactors from "./resolver-mutation-transactors";

const resolverMutationCreate: TResolver<
  never,
  { data: { id: any; [key: string]: any }[] }
> = async (...resolverArgs) => {
  const [, args] = resolverArgs;
  const { data } = args || {};
  if (!data.length) return [];
  const itemTransactors = getDataItemTransactors(data, resolverArgs);
  return queryOnCreate(name, itemTransactors, resolverArgs, queryOne);
};
