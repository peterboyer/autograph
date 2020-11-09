import Knex from "knex";

export type ITableInfo = {
  columns: Map<string, { type: string }>;
  selectArgs: Set<string>;
};

export type ISelectMapType = (name: string, knex: any) => string;

export function TableInfo(
  knex: Knex,
  selectMap: Map<string, ISelectMapType> = new Map()
) {
  const tables = new Map<string, ITableInfo>();

  const resolve = async (tableName: string) => {
    if (!tables.has(tableName)) {
      const query = await knex.raw(
        `select * from information_schema.columns where table_name = '${tableName}'`
      );

      const columns = new Set<{ column_name: string; udt_name: string }>(
        query.rows
      );
      const tableColumns = new Map<string, { type: string }>();
      const tableSelectArgs = new Set<string>();

      columns.forEach(({ column_name: name, udt_name: type }) => {
        tableColumns.set(name, { type });
        if (selectMap.has(type)) {
          const selectMapType = selectMap.get(type);
          selectMapType && tableSelectArgs.add(selectMapType(name, knex));
        }
      });

      tables.set(tableName, {
        columns: tableColumns,
        selectArgs: tableSelectArgs,
      });
    }
  };

  const getSelectArgs = (tableName: string) => {
    return tables.get(tableName)?.selectArgs || new Set();
  };

  return {
    resolve,
    getSelectArgs,
  };
}

export default TableInfo;
