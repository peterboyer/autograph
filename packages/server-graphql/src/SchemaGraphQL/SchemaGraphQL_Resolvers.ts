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

    const resolverRoot = Object.entries(fields).reduce((acc, [key, o]) => {
      if (o.private) return acc;
      if (!o.getter) return acc;

      const resolver: GQLResolver = async (..._args) => {
        const [parent, args] = _args;

        if (typeof o.getter === "function") {
          const result = await o.getter(..._args);
          if (!result && o.nullable === false)
            throw errors.NotFound(o.type, args);
          return result;
        }

        if (o.relationship) {
          const target =
            typeof o.getter === "string" ? o.getter : o.column || key;
          const result = await queryById(
            o.type,
            parent && parent[target],
            _args
          );
          if (!result && o.nullable === false)
            throw errors.NotFound(o.type, args);
          return result;
        }

        const value = (parent && parent[key]) || null;
        return value;
      };

      return Object.assign(acc, {
        [key]: resolver,
      });
    }, {});

    const resolverQuery: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { id } = args || {};
      return queryById_throwNotFound(name, id);
    };

    const resolverQueryMany: GQLResolver = async (..._args) => {
      // TODO: add pagination and other args/filters
      return queryByFilter(name);
    };

    const resolverMutationCreate: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { data } = args || {};
      if (!data.length) return [];

      return queryOnCreate(name, data);
    };

    const resolverMutationUpdate: GQLResolver = async (..._args) => {
      const [, args] = _args;
      const { data } = args || {};
      if (!data.length) return [];

      const resolvers = data.map(
        (item: { [key: string]: any }): ISchemaMutationResolver => {
          return async function resolver(trx?: any) {
            const { id } = item;
            await queryById_throwNotFound(name, id);

            const itemData = {};
            for (const [_key, _value] of Object.entries(item)) {
              const field = fields.get(_key);

              // TODO: raise error
              if (!field) continue;

              // skip
              if (field.primary) continue;

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
          };
        }
      );

      return queryOnUpdate(name, resolvers);
    };

    const resolverMutationDelete: GQLResolver = async (..._args) => {
      const [parent, args] = _args;
      // TODO: implement bulk deletion function
      console.log(..._args);
      return [];
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
