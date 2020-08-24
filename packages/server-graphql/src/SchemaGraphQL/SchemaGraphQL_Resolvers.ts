import lodash from "lodash";
const { omit } = lodash;

export default function Resolvers(ioc: {
  queryById: (tableName: string, id: any) => any;
  errors: {
    NotFound: (tableName: string, queryArgs?: {}) => Error;
    NotValid: (details?: {}) => Error;
  };
}) {
  const { queryById, errors } = ioc;

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

  return function (schema) {
    const { name, fields: _fields } = schema;

    const fields = new Map(Object.entries(_fields));

    const graphResolversRoot = {
      [`${name}`]: Object.entries(fields).reduce((acc, [key, o]) => {
        if (o.private) return acc;
        if (!o.getter) return acc;

        return Object.assign(acc, {
          [key]: async (obj, args, context) => {
            if (typeof o.getter === "function") {
              const result = await o.getter(obj, args, context);
              if (!result && o.nullable === false)
                throw errors.NotFound(o.type, args);
              return result;
            }

            if (o.relationship) {
              const target =
                typeof o.getter === "string" ? o.getter : o.column || key;
              const result = await queryById(o.type, obj[target], context);
              if (!result && o.nullable === false)
                throw errors.NotFound(o.type, args);
              return result;
            }

            const value = obj[key] || null;
            return value;
          },
        });
      }, {}),
    };

    const graphResolversQuery = {
      [`${name}`]: async (_, args, context) => {
        const { id } = args;
        return queryById_throwNotFound(name, id);
      },
      [`${name}_many`]: async (_, args, context) => {
        const { knex } = context;
        // TODO: add pagination and other args/filters
        const rows = await knex(name);
        return rows;
      },
    };

    const graphResolversMutation = {
      [`${name}_create`]: async (_, args, context) => {
        const { knex } = context;
        const { data } = args;
        console.log(data);
        // TODO: implement bulk creation function
        const result = await knex(name).insert(data).returning("*");
        console.log(result);
        // const user = await queryById_throwNotFound(name, id);
        return [];
      },
      [`${name}_update`]: async (_, args, context) => {
        const { knex } = context;
        const { data } = args;

        if (!data.length) return [];
        const results = await Promise.all(
          data.map(async (item) => {
            const { id } = item;

            const itemData = Object.entries(item).reduce(
              (acc, [key, value]) => {
                // get field options from key of item
                const o = fields.get(key) as {};

                // TODO: raise error
                if (!o) return acc;

                if (o.primary) return acc;
                if (o.setter) {
                  if (typeof o.setter === "function") {
                    // TODO: setter function handling (pass item)
                    return acc;
                  }

                  const path =
                    typeof o.getter === "string" ? o.getter : o.column || key;

                  return Object.assign(acc, { [path]: value });
                }

                return Object.assign(acc, { [key]: value });
              },
              {}
            );

            const user = await queryById_throwNotFound(name, id);
            const obj = {
              ...omit(user, ["id"]),
              ...itemData,
            };

            await knex(name).where({ id }).update(obj);
            // TODO: optimise function to pass resolved .select for updated query,
            // TODO: instead of querying twice, via queryById
            const result = queryById(name, id, context);

            return result;
          })
        );

        return results;
      },
      [`${name}_delete`]: (_, args, context) => {
        // TODO: implement bulk deletion function
        console.log(_, args, context);
        return [];
      },
    };

    return {
      Root: graphResolversRoot,
      Query: graphResolversQuery,
      Mutation: graphResolversMutation,
    };
  };
}
