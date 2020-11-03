const resolverMutationDelete: TResolver<never, { ids: string[] }> = async (
  ..._args
) => {
  const [, args] = _args;
  const { ids = [] } = args || {};
  if (!ids.length) return [];
  return queryOnDelete(name, ids, _args);
};
