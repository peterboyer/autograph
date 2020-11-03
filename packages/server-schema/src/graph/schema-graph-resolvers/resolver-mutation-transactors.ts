const getDataItemTransactors = <T extends { id: any | null }>(
  data: T[],
  resolverArgs: Parameters<IResolverAny>
) =>
  data.map((dataItem) => {
    const pre: ISchemaMutationTransactorPre = async (trx) => {
      const { id = null } = dataItem;
      if (id) {
        await queryById_throwNotFound(name, { id }, resolverArgs, queryOne);
      }

      const itemData = {};
      for (const [_key, _value] of Object.entries(dataItem)) {
        const node = _nodes.get(_key);

        // TODO: raise error
        if (!node) continue;

        // skip
        if (node.primary) continue;
        if (node.setter === null) continue;
        if (typeof node.setter === "function" && node.setter.length !== 1)
          continue;

        let key = _key;
        let assignment = {};

        key =
          typeof node.setter === "string" ? node.setter : node.column || key;

        if (typeof node.setter === "function") {
          assignment = await node.setter(trx)(_value, dataItem);
        } else {
          assignment = { [key]: _value };
        }

        Object.assign(itemData, assignment);
      }

      return [id, itemData];
    };
    const post: ISchemaMutationTransactorPost = async (trx, id) => {
      for (const [_key, _value] of Object.entries(dataItem)) {
        const node = _nodes.get(_key);

        // TODO: raise error
        if (!node) continue;

        // skip
        if (node.primary) continue;
        if (node.setter === null) continue;
        if (typeof node.setter !== "function") continue;
        if (node.setter.length !== 2) continue;

        await node.setter(trx, id)(_value, dataItem);
      }
    };
    return { pre, post };
  });
