import { Adapter, ISchema } from "./SchemaKnex.types";

export default function CreateTable(adapter: Adapter) {
  const { knex, mapType } = adapter;

  return function (schema: ISchema) {
    return async function <T = {}>(
      rows: Set<Partial<T>> = new Set()
    ): Promise<Set<T> | false> {
      const { name, fields, constraints } = schema;

      if (await knex.schema.hasTable(name)) {
        return false;
      }

      await knex.schema.createTable(name, (table: any) => {
        fields.forEach((field, fieldName) => {
          if (field.virtual) return;

          const columnName = field.column || fieldName;
          const columnType = field.primary
            ? "increments"
            : mapType.get(field.relationship ? "ID" : field.type);

          if (!columnType) {
            throw new Error(
              `${name}.${fieldName}: Type '${field.type}' has no knex column type mapping.`
            );
          }

          if (!table[columnType]) {
            throw new Error(
              `${name}.${fieldName}: config.mapKnexType.${field.type}: Missing. (${columnType})`
            );
          }

          const column = table[columnType](columnName);
          if (field.nullable === false) column.notNullable();
          if (field.unique === true) table.unique(columnName);
          if (field.default !== undefined) column.default(field.default);
          if (field.relationship) {
            // if undefined relationship, default to id
            const path =
              field.relationship === true ? "id" : field.relationship;
            // complete relationship reference with Type if missing/default
            const references = !path.includes(".")
              ? `${field.type}.${path}`
              : path;
            table.foreign(columnName).references(references);
          }
        });

        if (constraints) {
          if (constraints.unique) {
            constraints.unique.forEach((set) => {
              table.unique(
                [...set.values()].map(
                  (fieldName) => fields.get(fieldName)?.column || fieldName
                )
              );
            });
          }
        }
      });

      return new Set(
        await knex(name)
          .insert(
            [...rows.values()].map((row) =>
              // resolve field names into potentially set field column names
              Object.entries(row).reduce(
                (acc, [fieldName, value]) =>
                  Object.assign(acc, {
                    [schema.fields.get(fieldName)?.column || fieldName]: value,
                  }),
                {}
              )
            )
          )
          .returning("*")
      );
    };
  };
}
