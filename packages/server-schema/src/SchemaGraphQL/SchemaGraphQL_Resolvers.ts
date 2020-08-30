import {
  IIOC,
  IModel,
  GQLResolver,
  ISchemaMutationResolver,
} from "./SchemaGraphQL.types";

export default function Resolvers(ioc: IIOC) {
  const {
    queryById,
    queryByFilter,
    queryOnCreate,
    queryOnUpdate,
    queryOnDelete,
    errors,
  } = ioc;

  async function queryById_throwNotFound(
    ...args: Parameters<typeof queryById>
  ) {
    const result = await queryById(...args);
    if (!result) {
      const [table, id] = args;
      throw errors.NotFound(table, { id });
    }
    return result;
  }

  return function (model: IModel) {
    const { name, fields: _fields } = model;

    const fields = new Map(Object.entries(_fields));

    const resolverRoot = [...fields.entries()].reduce(
      (acc, [fieldName, field]) => {
        if (field.private) return acc;
        if (field.getter === null) return acc;

        const resolver: GQLResolver = async (..._args) => {
          const [parent, args] = _args;

          if (typeof field.getter === "function") {
            const result = await field.getter(..._args);
            if (!result && field.nullable === false)
              throw errors.NotFound(field.type, args);
            return result;
          }

          const key =
            typeof field.getter === "string"
              ? field.getter
              : field.column || fieldName;

          if (field.relationship) {
            const result = await queryById(field.type, parent[key], _args);
            if (!result && field.nullable === false)
              throw errors.NotFound(field.type, args);
            return result;
          }

          const value = parent[key] || null;
          return value;
        };

        return Object.assign(acc, {
          [fieldName]: resolver,
        });
      },
      {}
    );

    const resolverQuery: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { id } = args || {};
      return queryById_throwNotFound(name, id);
    };

    const resolverQueryMany: GQLResolver = async (..._args) => {
      // TODO: add pagination and other args/filters
      return queryByFilter(name);
    };

    const getItemDataResolvers = (data: { [key: string]: any }[]) => {
      const resolvers = data.map(
        (item): ISchemaMutationResolver =>
          async function resolver(trx?: any) {
            const { id = null } = item;
            if (id) await queryById_throwNotFound(name, id);

            const itemData = {};
            for (const [_key, _value] of Object.entries(item)) {
              const field = fields.get(_key);

              // TODO: raise error
              if (!field) continue;

              // skip
              if (field.primary) continue;
              if (field.setter === null) continue;

              let key = _key;
              let value = _value;

              if (field.setter) {
                if (typeof field.setter === "function") {
                  value = await field.setter(trx)(value, item);
                } else {
                  key =
                    typeof field.setter === "string"
                      ? field.setter
                      : field.column || key;
                }
              }
              Object.assign(itemData, { [key]: value });
            }

            return [id, itemData];
          }
      );

      return resolvers;
    };

    const resolverMutationCreate: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { data } = args || {};
      if (!data.length) return [];
      const resolvers = getItemDataResolvers(data);
      return queryOnCreate(name, resolvers, _args);
    };

    const resolverMutationUpdate: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { data } = args || {};
      if (!data.length) return [];
      const resolvers = getItemDataResolvers(data);
      return queryOnUpdate(name, resolvers, _args);
    };

    const resolverMutationDelete: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { ids = [] } = args || {};
      if (!ids.length) return [];
      return queryOnDelete(name, ids, _args);
    };

    const graphResolversRoot = {
      [`${name}`]: resolverRoot,
    };

    const graphResolversQuery = {
      [`${name}`]: resolverQuery,
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
}
