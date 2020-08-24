export default function SchemaGraphQLKnex(config: {
  knex: any;
  selectMap?: { [key: string]: (name: string, knex: any) => string };
}) {
  const { knex, selectMap: _selectMap = {} } = config;

  const selectMap = new Map(Object.entries(_selectMap));

  const tables = new Map<
    string,
    { columns: Map<string, { type: string }>; selectArgs: Set<string> }
  >();

  async function queryById(tableName: string, id: any) {
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

    const selectArgs = tables.get(tableName)?.selectArgs || [];
    return await knex(tableName)
      .select("*", ...selectArgs)
      .where({ id })
      .first();
  }

  return {
    queryById,
  };
}
