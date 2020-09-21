import {
  IIOC,
  IModel,
  IResolver,
  IResolverAny,
  ISchemaMutationTransactorPre,
  ISchemaMutationTransactorPost,
} from "./SchemaGraphQL.types";

export default (ioc: IIOC) => {
  return (model: IModel) => {
    const { name, fields: _fields, filters: _filters = {}, resolvers } = model;

    const fields = new Map(Object.entries(_fields));
    const modelFilters = new Map(Object.entries(_filters));

    const getterOne = resolvers?.getterOne || resolvers?.getter;
    const getterMany = resolvers?.getterMany || resolvers?.getter;

    const {
      queryById,
      queryByArgs,
      queryOnCreate,
      queryOnUpdate,
      queryOnDelete,
      errors,
      limitDefault,
      limitMaxDefault,
    } = ioc;

    const queryById_throwNotFound = async (
      ..._args: Parameters<typeof queryById>
    ) => {
      const result = await queryById(..._args);
      if (!result) {
        const [table, args, resolverArgs] = _args;
        throw errors.NotFound(table, args, resolverArgs);
      }
      return result;
    };

    const resolverRoot: Record<any, IResolver<{ [key: string]: any }>> = {};

    for (const [fieldName, field] of fields) {
      if (field.private) continue;
      if (field.getter === null) continue;

      resolverRoot[fieldName] = async (...resolverArgs) => {
        const [source, args] = resolverArgs;

        if (typeof field.getter === "function") {
          const result = await field.getter(...resolverArgs);
          if (!result && field.nullable === false)
            throw errors.NotFound(field.type, args, resolverArgs);
          return result;
        }

        const key =
          typeof field.getter === "string"
            ? field.getter
            : field.column || fieldName;

        if (field.relationship) {
          const result = await queryById(field.type, source[key], resolverArgs);
          if (!result && field.nullable === false)
            throw errors.NotFound(field.type, args, resolverArgs);
          return result;
        }

        const value = source[key] || null;
        return value;
      };
    }

    const resolverQueryOne: IResolver<undefined, { id: string }> = async (
      ...resolverArgs
    ) => {
      const [, args] = resolverArgs;
      return queryById_throwNotFound(name, args, resolverArgs, getterOne);
    };

    const resolverQueryMany: IResolver<
      undefined,
      {
        cursor?: string;
        order?: string;
        filters?: { [key: string]: any };
        limit?: number;
      }
    > = async (...resolverArgs) => {
      const [, args] = resolverArgs;
      const {
        cursor,
        order: orderArg,
        limit: limitArg,
        filters: filtersArg,
      } = args;
      const [, orderKey, orderDirection] =
        (orderArg && orderArg.match(/^([\w\d]+)(?::(asc|desc))?$/)) || [];

      // resolve view to data layer field name resolutions for queries
      if (orderKey && !fields.get(orderKey)) {
        throw new Error("INVALID_QUERY_ORDER_KEY");
      }

      const order =
        (orderKey && {
          name: fields.get(orderKey)?.column || orderKey,
          by: orderDirection,
        }) ||
        undefined;

      const filters = filtersArg
        ? Object.entries(filtersArg).map(([identifier, value]) => {
            const modelFilter = modelFilters.get(identifier);
            if (modelFilter) {
              return { _custom: modelFilter, value };
            }
            const [, key, type] = identifier.match(/^([\w]+)(?:_(\w+)$)/) || [];
            return { name: fields.get(key)?.column || key, type, value };
          })
        : [];

      // limit clamped by max
      const limit = Math.min(limitArg || limitDefault, limitMaxDefault);

      return queryByArgs(
        name,
        { cursor, order, filters, limit },
        resolverArgs,
        getterMany
      );
    };

    const getDataItemTransactors = <T extends { id: any | null }>(
      data: T[],
      resolverArgs: Parameters<IResolverAny>
    ) =>
      data.map((dataItem) => {
        const pre: ISchemaMutationTransactorPre = async (trx) => {
          const { id = null } = dataItem;
          if (id) {
            await queryById_throwNotFound(
              name,
              { id },
              resolverArgs,
              getterOne
            );
          }

          const itemData = {};
          for (const [_key, _value] of Object.entries(dataItem)) {
            const field = fields.get(_key);

            // TODO: raise error
            if (!field) continue;

            // skip
            if (field.primary) continue;
            if (field.setter === null) continue;
            if (typeof field.setter === "function" && field.setter.length !== 1)
              continue;

            let key = _key;
            let assignment = {};

            key =
              typeof field.setter === "string"
                ? field.setter
                : field.column || key;

            if (typeof field.setter === "function") {
              assignment = await field.setter(trx)(_value, dataItem);
            } else {
              assignment = { [key]: _value };
            }

            Object.assign(itemData, assignment);
          }

          return [id, itemData];
        };
        const post: ISchemaMutationTransactorPost = async (trx, id) => {
          for (const [_key, _value] of Object.entries(dataItem)) {
            const field = fields.get(_key);

            // TODO: raise error
            if (!field) continue;

            // skip
            if (field.primary) continue;
            if (field.setter === null) continue;
            if (typeof field.setter !== "function") continue;
            if (field.setter.length !== 2) continue;

            await field.setter(trx, id)(_value, dataItem);
          }
        };
        return { pre, post };
      });

    const resolverMutationCreate: IResolver<
      never,
      { data: { id: any; [key: string]: any }[] }
    > = async (...resolverArgs) => {
      const [, args] = resolverArgs;
      const { data } = args || {};
      if (!data.length) return [];
      const itemTransactors = getDataItemTransactors(data, resolverArgs);
      return queryOnCreate(name, itemTransactors, resolverArgs, getterOne);
    };

    const resolverMutationUpdate: IResolver<
      never,
      { data: { id: any; [key: string]: any }[] }
    > = async (...resolverArgs) => {
      const [, args] = resolverArgs;
      const { data } = args || {};
      if (!data.length) return [];
      const itemTransactors = getDataItemTransactors(data, resolverArgs);
      return queryOnUpdate(name, itemTransactors, resolverArgs, getterOne);
    };

    const resolverMutationDelete: IResolver<never, { ids: string[] }> = async (
      ..._args
    ) => {
      const [, args] = _args;
      const { ids = [] } = args || {};
      if (!ids.length) return [];
      return queryOnDelete(name, ids, _args);
    };

    const graphResolversRoot = {
      [`${name}`]: resolverRoot,
    };

    const graphResolversQuery = {
      [`${name}`]: resolverQueryOne,
      [`${name}_many`]: resolverQueryMany,
    };

    const graphResolversMutation = {
      [`${name}_create`]: resolverMutationCreate,
      [`${name}_update`]: resolverMutationUpdate,
      [`${name}_delete`]: resolverMutationDelete,
    };

    return {
      Root: graphResolversRoot,
      Query: graphResolversQuery,
      Mutation: graphResolversMutation,
    };
  };
};
