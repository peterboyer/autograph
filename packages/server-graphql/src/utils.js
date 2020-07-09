// TODO: add documentation
export const selectColumnsPush = (table, columns) =>
  columns.map(column => `${table}.${column} as ${table}_${column}`);

// TODO: add documentation
export const selectColumnsPop = (table, columns) => values =>
  Object.keys(values).reduce((acc, key) => {
    if (!key.startsWith(`${table}_`)) {
      return acc;
    }
    const [, keyColumn] = key.split(`${table}_`);
    if (columns.includes(keyColumn)) {
      acc[keyColumn] = values[key];
    }
    return acc;
  }, {});

// TODO: add documentation
export const schemaTableCreate = (knex) => async (schema, data = []) => {
  if (!(await knex.schema.hasTable(schema.name))) {
    await knex.schema.createTable(schema.name, schema.knex.table);
    if (data) {
      await knex(schema.name).insert(
        // resolve field names into potentially set field column names
        data.map(row => Object.entries(row).reduce((acc, [key, value]) =>
          Object.assign(acc, { [schema.fields[key].column || key]: value }),
        {}))
      );
    }
  }
};
