/**
 * @module Schema
 *
 * @description
 *    Use declarative schemas to generate database models and CRUD graphql.
 */

/**
 * @typedef {object} Context.RequiredProperties
 * @property {Knex} knex
 *    Reference to initialised knex instance.
 *    Used to create database queries from schema information.
 * @property {Error} ResolverError
 *    Reference to an error constructor used for resolver errors.
 *    (i.e. ApolloError) Called with `new ResolverError(message, code)`.
 */

/**
 * Generated GraphQL.Resolvers from a schema refer to properties from the
 * context argument to a resolver. Ensure you pass valid values as according
 * to the Context.RequiredProperties object typedef to your context property
 * of your ApolloServer constructor.
 *
 * @function
 * @static
 * @param {function} [configOverride]
 *    Configures additional schema generation options.
 *    Optional function called with (defaultConfig) returning a new config
 *    object.
 *
 * @example
 * const schema = Schema(config => ({
 *   ...config,
 *   knex,
 *   mapKnexType: {
 *     ...config.mapKnexType,
 *     Email: "text",
 *   },
 * }))
 *
 * @param {Knex} [configOverride.knex]
 *    Reference to initialised knex instance.
 *
 * @param {object} [configOverride.mapKnexType]
 *    Provides mappings for Schema types into knex column types.
 *
 * <pre>// defaults
 * ID -> integer
 * Int -> integer
 * String -> text
 * DateTime -> timestamp
 * Boolean -> boolean</pre>
 *
 * @param {object} [configOverride.mapGraphType]
 *    Provides mappings for Schema types into alternate GraphQL types.
 *    Although Schema types are primarily compatible graph types, it provides
 *    a chance to remap types that, for example, might not have custom scalars
 *    defined yet, but are ultimately rendered as a String|Int|etc.
 *
 * <pre>// defaults
 * DateTime -> string</pre>
 *
 * @param {object} [configOverride.mapKnexTypeSelect]
 *    Provides a chance for additional selector args to be added to
 *    `knex(table).select("*", ...args)` statements when resolvers fetch data.
 *    Motivated by cases where the certain columns used custom postgis geometry
 *    types and the data needed to be select/casted into JSON instead of it's
 *    raw binary type.
 *
 * <pre>// no defaults</pre>
 *
 * @returns {SchemaParser}
 *    Schema parsing function.
 */

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
 * @returns {SchemaResult}
 */
