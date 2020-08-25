import { IIOC, IModel } from "./SchemaKnex.types";

export default function CreateTable(ioc: IIOC) {
  const { knex, mapType } = ioc;

  return function (model: IModel) {
    return async function <T = {}>(
      rows: Partial<T>[] = []
    ): Promise<T[] | false> {
      const { name, fields: _fields, constraints } = model;

      if (await knex.schema.hasTable(name)) {
        return false;
      }

      const fields = new Map(Object.entries(_fields));

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

      // resolve field names into potentially set field column names
      const rowsParsed = rows.map((row) =>
        Object.entries(row).reduce(
          (acc, [fieldName, value]) =>
            Object.assign(acc, {
              [fields.get(fieldName)?.column || fieldName]: value,
            }),
          {}
        )
      );

      // insert rows and return results
      return knex(name).insert(rowsParsed).returning("*");
    };
  };
}
