// TODO: add documentation
export const selectColumnsPush = (tableName: string, columns: string[]) =>
  columns.map((column) => `${tableName}.${column} as ${tableName}_${column}`);

// TODO: add documentation
export const selectColumnsPop = (
  tableName: string,
  columns: string[]
) => (values: { [key: string]: any }) =>
  Object.keys(values).reduce((acc, key) => {
    if (!key.startsWith(`${tableName}_`)) {
      return acc;
    }
    const [, keyColumn] = key.split(`${tableName}_`);
    if (columns.includes(keyColumn)) {
      acc[keyColumn] = values[key];
    }
    return acc;
  }, {} as { [key: string]: any });
