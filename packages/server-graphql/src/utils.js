export const selectColumnsPush = (table, columns) =>
  columns.map(column => `${table}.${column} as ${table}_${column}`);

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
