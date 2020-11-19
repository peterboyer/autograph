export { default as Model } from "./model";

/**
 * Model
 *
 * name: string
 * Name to use for this model when converted into a Graph.
 *
 * fields: object
 * Fields for this model, where keys are field names, and values can be: a Type
 * or an Field object.
 *
 * access?: object
 *
 * filters?: object
 * Filters for this model, where keys are filter names, and values are callbacks
 * in the shape of (Modifiers) => ...
 *
 * query?: object
 *
 * typeDefs?: object
 * Accepts typeDefs strings under keys "Root", "Query", or "Mutation" to be
 * injected alongside all other generated typeDefs for this model's Graph.
 *
 * limitDefault?: number
 * When requesting this model's Graph Many, this value is used as a default
 * limit if the user hasn't manually specified a limit.
 *
 * limitMax?: number
 * This value clamps down on the limit provided by the user/or set by the
 * default.
 *
 * Field
 *
 * type: Types (e.g. Types.String.List.NonNull)
 * Base types, or define custom Scalar or Object types corresponding to GraphQL.
 *
 * resolver?: string | object
 * If string, the resolver value is used as an alias for the field getting and
 * setting. If an object, can include a get and/or a set which are callbacks in
 * the shape of (Modifiers) => ... . If undefined (default) then the field's
 * name (as given by it's key in Model.fields) will be used for getting and
 * setting.
 *
 * access?: object
 *
 * order?: string
 * If undefined (default) and Field.type is a Scalar sub-type, will attempt to
 * resolve to resolver (if string), resolver.get (if string within object), or
 * the field's name, to allow for ordering results for the model's graph Many
 * endpoint.
 *
 * default?: any
 * If defined, will use this value as a program-level default value for this
 * field for the model's graph Create endpoint.
 *
 * Field.resolver.get.Modifiers
 *
 * Field.resolver.set.Modifiers
 *
 * Filters.Modifiers
 *
 */
