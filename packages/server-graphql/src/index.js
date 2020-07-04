import lodash from "lodash";
const { omit, defaults } = lodash;

const configDefault = {
  mapKnexType: {
    ID: "integer",
    Int: "integer",
    String: "text",
    DateTime: "timestamp",
    Boolean: "boolean",
  },
  mapGraphType: {
    DateTime: "String",
  },
  mapKnexTypeSelect: {},
};

// TODO: update schema api using jsdocs format
// TODO: update schema with new flattened definition layout in User
/**
 * Schema API
 *  name: string (required) table/graph entity type name
 *  fields: object (required) Object of [field name]: [field options]
 *    * primary key "id" is added automatically
 *    * createdAt and updatedAt property is added automatically also
 *      * defaults to knex.fn.now() on creation
 *
 *    type: string (required) graph type, is cast for matching knex database type
 *      * if "Relationship", no db column created for field (like isVirtual)
 *    primary: bool (false) if true, set db column to use primary key "increments"
 *      * only allowed for one column (id)
 *    default: any (undefined) if set, applies db column default for field
 *    references: string (undefined) if set, applies foreign key, as: "Table.column"
 *    private: bool (false), if true, does not add to graph schema
 *    isVirtual: bool (false) if true, does not create db column for field
 *      * only adds to graph schema, for virtualised/generated values
 *    isNotNullable: bool (false) if true, adds notNullable db constraint for field
 *      * also, adds ! not nullable to graph typedefs
 *    isUnique: bool (false) if true, adds unique constraint for db column to table
 *    join: object (required if type = Relationship), otherwise ignored
 *      type: string (required) schema name of related join
 *      many: bool (false) set graph to use [type] instead, for result array
 *      setter: bool|resolver (false), method invoked to correctly assign new value
 *      getter: bool|resolver (false), method invoked to correctly fetch/join values
 *      args: object (undefined) Of [arg name]: [arg graph type]
 *  constraints: object (undefined) Object of db table constraints
 *    unique: array<array> (undefined) List of unique constraint sets as lists
 */

const fieldDefaults = {
  // REQUIRED
  type: undefined, // String (db/graph)
  // OPTIONAL
  column: null, // String|null (db)
  relationship: false, // Boolean|String (db)
  nullable: true, // Boolean (db/graph)
  private: false, // Boolean (graph)
  virtual: false, // Boolean (db)
  primary: false, // Boolean (db)
  unique: false, // Boolean (db)
  default: undefined, // Any|null (db)
  setter: true, // Boolean|String|Function (resolver)
  getter: true, // Boolean|String|Function (resolver)
};

export const Parse = (configOverride) => {
  const config = configOverride ? configOverride(configDefault) : configDefault;
  const { mapKnexType, mapGraphType, mapKnexTypeSelect } = config;

  const getKnexType = (type) => mapKnexType[type];
  const getGraphType = (type) => mapGraphType[type] || type;

  return (schema, ioc) => {
    const { knex, ResolverError } = ioc;

    const name = schema.name;

    const fields = Object.entries({
      id: {
        type: "ID",
        primary: true,
        nullable: false,
      },
      ...(schema.fields || {}),
      createdAt: {
        type: "DateTime",
        default: knex.fn.now(),
        nullable: false,
      },
      updatedAt: {
        type: "DateTime",
        default: knex.fn.now(),
        nullable: false,
      },
    })
      .reduce(
        (acc, [key, o]) =>
          Object.assign(acc, {[key]: defaults(o, fieldDefaults)}),
        {},
      );

    const constraints = {
      ...(schema.constraints || {}),
    };

    const knexTable = (table) => {
      Object.entries(fields).forEach(([key, o]) => {
        if (o.virtual) return;
        const typeKnex = o.primary ? "increments" : getKnexType(o.relationship ? "ID" : o.type);
        const columnName = o.column || key;
        let column;
        if (typeof typeKnex === "function") {
          column = typeKnex(table, columnName);
        } else {
          if (!table[typeKnex]) {
            throw new Error(`${name}.${key}: config.mapKnexType.${o.type}: Missing. (${typeKnex})`);
          }
          column = table[typeKnex](columnName);
        }
        if (o.nullable === false) column.notNullable();
        if (o.unique === true) table.unique(columnName);
        if (o.default !== undefined) column.default(o.default);
        if (o.relationship) {
          // if undefined relationship, default to id
          const path = o.relationship === true ? "id" : o.relationship;
          // complete relationship reference with Type if missing/default
          const references = !path.includes(".") ? `${o.type}.${path}` : path;
          table.foreign(columnName).references(references);
        }
      });

      if (constraints.unique) {
        constraints.unique.forEach((keys) => {
          table.unique(keys.map(key => fields[key].column || key));
        });
      }
    };

    function stringGraphFieldJoinArgs(args) {
      return Object.entries(args).map(([key, type]) => `${key}: ${type}`).join(",");
    }

    function mapGraphFieldsTypeDefs() {
      return Object.entries(fields)
        .map(([key, o]) => {
          if (o.private) return;
          if (!o.getter) return;
          const typeGraph = getGraphType(o.type);
          return `${
            key
          }${
            o.args ? `(${stringGraphFieldJoinArgs(o.args)})` : ""
          }: ${
            o.many ? `[${typeGraph}!]` : `${typeGraph}`
          }${o.nullable === false ? "!" : ""}`;
        }).filter(field => field);
    }

    function mapGraphFieldsTypeDefsInput() {
      return Object.entries(fields)
        .map(([key, o]) => {
          if (o.private) return;
          if (o.primary) return;
          if (!o.setter) return;
          const typeGraph = o.relationship ? "ID" : getGraphType(o.type);
          return `${
            key
          }: ${
            o.many ? `[${typeGraph}!]` : `${typeGraph}`
          }`;
        }).filter(field => field);
    }

    const graphFieldsTypeDefs = mapGraphFieldsTypeDefs().join("\n");
    const graphFieldsTypeDefsInput = mapGraphFieldsTypeDefsInput().join("\n");

    const graphTypeDefsRoot = `
      type ${name} {
        ${graphFieldsTypeDefs}
      }
      input ${name}Input {
        ${graphFieldsTypeDefsInput}
      }
      input ${name}InputID {
        id: ID!
        ${graphFieldsTypeDefsInput}
      }
    `;

    // TODO: convert query into ${name}QueryInput with field accessors etc.
    const graphTypeDefsQuery = `
      ${name}(id: ID!): ${name}!
      ${name}_many(query: String): [${name}!]!
    `;

    const graphTypeDefsMutation = `
      ${name}_create(data: [${name}Input!]!): [${name}!]!
      ${name}_update(data: [${name}InputID!]!): [${name}!]!
      ${name}_delete(ids: [ID!]!): [ID!]!
    `;

    async function queryById(table, id, context) {
      const { knex } = context;

      if (!(queryById.columns && queryById.columns[table])) {
        const columns = await knex.raw(
          `select * from information_schema.columns where table_name = '${table}'`
        );

        const tableColumns = columns.rows.reduce(
          (
            acc,
            { column_name: name, udt_name: type },
          ) => Object.assign(
            acc,
            ({ [name]: { name, type } }),
            {},
          ),
          {}
        );

        const tableSelectArgs = Object.entries(tableColumns).reduce((acc, [key, o]) => {
          if (mapKnexTypeSelect[o.type]) {
            acc.push(mapKnexTypeSelect[o.type](key, context));
          }
          return acc;
        }, []);

        queryById.columns = Object.assign(queryById.columns || {}, {
          [table]: {
            columns: tableColumns,
            selectArgs: tableSelectArgs,
          },
        });
      }

      const {selectArgs} = queryById.columns[table];
      return await knex(table).select("*", ...selectArgs).where({ id }).first();
    }

    function NotFound(table, args) {
      return new ResolverError(
        `Cannot resolve '${table}' with ${args.toString()}.`,
        "NOT_FOUND"
      );
    }

    queryById.throwNotFound = async (...args) => {
      const result = await queryById(...args);
      if (!result) {
        const [table, id] = args;
        throw NotFound(table, { id });
      }
      return result;
    };

    const graphResolversRoot = {
      [`${name}`]: Object.entries(fields).reduce((acc, [key, o]) => {
        if (o.private) return acc;
        if (!o.getter) return acc;

        return Object.assign(acc, {
          [key]: async (obj, args, context) => {
            if (typeof o.getter === "function") {
              const result = await o.getter(obj, args, context);
              if (!result && o.nullable === false) throw NotFound(o.type, args);
              return result;
            }

            const path = typeof o.getter === "string"
              ? o.getter
              : o.column || key;

            if (o.relationship) {
              const result = await queryById(o.type, obj[path], context);
              if (!result && o.nullable === false) throw NotFound(o.type, args);
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
        return queryById.throwNotFound(name, id, context);
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
        // const user = await queryById.throwNotFound(name, id);
        return [];
      },
      [`${name}_update`]: async (_, args, context) => {
        const { knex } = context;
        const { data } = args;

        if (!data.length) return [];
        const results = await Promise.all(data.map(async (item) => {
          const { id } = item;

          const itemData = Object.entries(item).reduce((acc, [key, value]) => {
            // get field options from key of item
            const o = fields[key];
            if (o.primary) return acc;
            if (o.setter) {
              if (typeof o.setter === "function") {
                // TODO: setter function handling (pass item)
                return acc;
              }

              const path = typeof o.getter === "string"
                ? o.getter
                : o.column || key;

              return Object.assign(acc, { [path]: value });
            }

            return Object.assign(acc, { [key]: value });
          }, {});

          const user = await queryById.throwNotFound(name, id, context);
          const obj = {
            ...omit(user, ["id"]),
            ...itemData,
          };

          await knex(name).where({ id }).update(obj);
          // TODO: optimise function to pass resolved .select for updated query,
          // TODO: instead of querying twice, via queryById
          const result = queryById(name, id, context);

          return result;
        }));

        return results;
      },
      [`${name}_delete`]: (_, args, context) => {
        // TODO: implement bulk deletion function
        console.log(_, args, context);
        return [];
      },
    };

    return {
      ...schema,
      fields,
      knex: {
        table: knexTable,
      },
      graph: {
        typeDefs: {
          Root: graphTypeDefsRoot,
          Query: graphTypeDefsQuery,
          Mutation: graphTypeDefsMutation,
        },
        resolvers: {
          Root: graphResolversRoot,
          Query: graphResolversQuery,
          Mutation: graphResolversMutation,
        },
      },
    };
  };
};

export const mergeTypeDefs = (schemas, node = "Root") => {
  return schemas.map((schema) => schema.graph.typeDefs[node]).join("\n");
};

export const mergeResolvers = (schemas, node = "Root") => {
  return schemas.reduce((acc, schema) => {
    return Object.assign(acc, schema.graph.resolvers[node]);
  }, {});
};
