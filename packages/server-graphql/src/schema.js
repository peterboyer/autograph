/**
 * @module Schema
 *
 * @description
 *    Use declarative schemas to generate database models and CRUD graphql.
 */

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

const fieldDefaults = {
  type: undefined,
  column: null,
  many: false,
  relationship: false,
  nullable: true,
  private: false,
  virtual: false,
  primary: false,
  unique: false,
  default: undefined,
  setter: true,
  getter: true,
};

/**
 * @function
 * @static
 * @param {object} [config]
 *    Configures universal schema generation options.
 *
 * @param {object} [config.mapKnexType]
 *    Provides mappings for Schema types into knex column types.
 *
 * <pre>// defaults
 * ID -> integer
 * Int -> integer
 * String -> text
 * DateTime -> timestamp
 * Boolean -> boolean</pre>
 *
 * @param {object} [config.mapGraphType]
 *    Provides mappings for Schema types into alternate GraphQL types.
 *    Although Schema types are primarily compatible graph types, it provides
 *    a chance to remap types that, for example, might not have custom scalars
 *    defined yet, but are ultimately rendered as a String|Int|etc.
 *
 * <pre>// defaults
 * DateTime -> string</pre>
 *
 * @param {object} [config.mapKnexTypeSelect]
 *    Provides a chance for additional selector args to be added to
 *    `knex(table).select("*", ...args)` statements when resolvers fetch data.
 *    Motivated by cases where the certain columns used custom postgis geometry
 *    types and the data needed to be select/casted into JSON instead of it's
 *    raw binary type.
 *
 * <pre>// no defaults</pre>
 * @returns {SchemaParser}
 *    Schema parsing function.
 */
export const Schema = (configOverride) => {
  const config = configOverride ? configOverride(configDefault) : configDefault;
  const { mapKnexType, mapGraphType, mapKnexTypeSelect } = config;

  const getKnexType = (type) => mapKnexType[type];
  const getGraphType = (type) => mapGraphType[type] || type;

  /**
   * @function
   * @name SchemaParser
   * @param {Object} schema
   *    Input schema to be parsed.
   * @param {string} schema.name
   *    Entity name for database table and graph typedefs.
   *
   * @param {object} schema.fields
   *    Object key is field name.
   *    Field definitions for the database columns and graph typedefs.
   *
   * @param {string} schema.fields.type
   *    Graph type (String|Boolean|etc.) or Schema name (User|etc.).
   *    This value is mapped to a knex database type via `config.mapKnexType` is
   *    this field will be a database column.
   *    If used with relationship, this value can be a Schema name for the
   *    generated resolver to resolve the data for this field.
   *
   * @param {boolean} [schema.fields.virtual=false]
   *    If true, this field will not have a corresponding database column.
   *    It will only exist as a graph entity key.
   *    Use this for generated/virtual resolved values etc.
   *
   * @param {string} [schema.fields.column=null]
   *    Use this value to change the database column name used for this field.
   *    All generated relationships and resolvers will automatically resolve this
   *    field's name to access the database column specified here instead.
   *
   * @param {boolean|string} [schema.fields.relationship=false]
   *    Configures this field to resolve to a relationship to another entity.
   *    If set to true, the relationship will default to use `${field.type}.id`
   *    when querying the remote table via this field's type. A different column
   *    can be used if passed as a string instead of `true`.
   *    If `many` is not specified, this field will be considered a database column
   *    and a foreign key will be set using the `Table.column` value determined.
   *    If `many` is true, this field will be considered a virtual field.
   *
   * @param {boolean} [schema.fields.many=false]
   *    If `true`, typedefs use `[]` and generated resolvers will use arrays.
   *    If `many` is used with a relationship field, this field is considered
   *    virtual.
   *
   * @param {boolean} [schema.fields.nullable=true]
   *    If `false`, adds the `NOT NULL` constraint for the database column, and
   *    adds the `!` not nullable modifier to generated graph typedefs for this
   *    schema.
   *
   * @param {boolean} [schema.fields.private=false]
   *    If `true`, does not expose this field on graph schema.
   *    Setting `setter` and `getter` to `false` has the same effect.
   *
   * @param {boolean} [schema.fields.primary=false]
   *    Reserved `id` primary key column, which is automatically added to this
   *    schema when generated, and must only be used for one field.
   *    If `true`, resolves the database column type to "increments".
   *
   * @param {boolean} [schema.fields.unique=false]
   *    If `true`, adds unique constraint for this field's database column.
   *
   * @param {*} [schema.fields.default]
   *    If set, applies db column default for field.
   *
   * @param {boolean|string|GraphQL.Resolver} [schema.fields.getter=true]
   *    Modifies the generated resolver for getting this field's value.
   *    If `true`, returned value is `obj[field.name]` (or `field.column` if set).
   *    If `string`, returned value is `obj[field.getter|string]`.
   *    If `GraphQL.Resolver`, returned value is the result of this resolver
   *    function, called with standard resolver parameters:
   *    `GraphQL.Resolver(parent, args, context, info)`.
   *    Has no effect if `virtual` is true.
   * @param {boolean|string|GraphQL.Resolver} [schema.fields.setter=true]
   *    Modifies the generated resolver for setting this field's value.
   *    If `true`, returned value is `obj[field.name]` (or `field.column` if set).
   *    If `string`, value
   *    If `Resolver` function, will be called will Resolver args, and uses return
   *      as new value for create/update mutations.
   *    Has no effect if `virtual` is true.
   *
   * @param {object} [schema.constraints={}]
   *    Allows database table-level constraints to be set for fields/columns.
   *
   * @param {string[][]} [schema.constraints.unique=[]]
   *    An array of unique constraint sets of columns referenced by schema name
   *    (not by `column` alias!). An example value of e.g. `[["userA", "userB"]]`
   *    will ensure that no other database row can have the same two values set.
   *
   * @param {Object} ioc
   *    Object with references to knex and an ResolverError handler.
   * @param {Knex} ioc.knex
   *    Reference to initialised knex instance.
   * @param {function} ioc.ResolverError
   *    Reference to an error constructor used for resolver errors.
   *    (i.e. ApolloError) Called with `new ResolverError(message, code)`.
   *
   * @returns {SchemaResult}
   */
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

    /**
     * @typedef {object} SchemaResult
     * @property {object} name
     *    Provided input schema's name.
     * @property {object} fields
     *    Provided input schema's fields object updated with any generated
     *    fields and default property values.
     * @property {object} constraints
     *    Provided input schema's constraints objected (if provided).
     * @property {object} knex
     *    Object containing knex/database related generated objects.
     * @property {function} knex.table
     *    Function that accepts table as an argument, to be used with
     *    `knex.schema.createTable`-like functions.
     *    (e.g. await knex.schema.createTable(MySchema.knex.table))
     * @property {object} graph
     *    Object containing apollo/graphql related generated objects.
     * @property {object} graph.typeDefs
     *    Object containing `gql` typedefs objects under `.Root`, `.Query`, and
     *    `.Mutation` keys, to be used with as-is, or nested in other typeDefs.
     * <pre>// example
     * const typeDefs = gql`
     *   ${MySchema.graph.typeDefs.Root}
     *   Query {
     *     ${MySchema.graph.typeDefs.Query}
     *   }
     *   Mutation {
     *     ${MySchema.graph.typeDefs.Mutation}
     *   }
     * `;
     * </pre>
     * @property {object} graph.resolvers
     *    Object containing resolvers objects under `.Root`, `.Query`, and
     *    `.Mutation` keys, to be used as-is, or destructured into other
     *    resolver maps.
     * <pre>// example
     * const resolvers = {
     *   ...MySchema.graph.resolvers.Root,
     *   Query: {
     *     ...MySchema.graph.resolvers.Query,
     *   },
     *   Mutation: {
     *     MySchema.graph.resolvers.Mutation,
     *   },
     * };
     * </pre>
     */
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

/**
 * Convenience function to return merge many schemas' typeDefs.
 * @function
 * @param {SchemaResult[]} schemas
 *    Array of schemas to be iterated on.
 * @param {string} [node="Root"]
 *    TypeDefs node to reference when iterating over schemas.
 */
export const mergeTypeDefs = (schemas, node = "Root") => {
  return schemas.map((schema) => schema.graph.typeDefs[node]).join("\n");
};

/**
 * Convenience function to return merge many schemas' resolvers.
 * @function
 * @param {SchemaResult[]} schemas
 *    Array of schemas to be iterated on.
 * @param {string} [node="Root"]
 *    Resolvers node to reference when iterating over schemas.
 */
export const mergeResolvers = (schemas, node = "Root") => {
  return schemas.reduce((acc, schema) => {
    return Object.assign(acc, schema.graph.resolvers[node]);
  }, {});
};
