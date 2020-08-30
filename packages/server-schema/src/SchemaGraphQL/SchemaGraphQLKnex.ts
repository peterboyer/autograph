import { ISchemaMutationResolver } from "./SchemaGraphQL.types";

type TableInfo = {
  columns: Map<string, { type: string }>;
  selectArgs: Set<string>;
};

type QuerySelectMap = { [key: string]: (name: string, knex: any) => string };

export default function SchemaGraphQLKnex(config: {
  knex: any;
  selectMap?: QuerySelectMap;
}) {
  const { knex, selectMap: _selectMap = {} } = config;

  const selectMap = new Map(Object.entries(_selectMap));

  const tables = new Map<string, TableInfo>();

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

  async function queryByFilter(tableName: string) {
    // TODO: add queryById select filters for selectMap
    const rows = await knex(tableName);
    return rows;
  }

  async function queryOnCreate(
    tableName: string,
    resolvers: ISchemaMutationResolver[]
  ) {
    // ! TODO: use update SETTER data resolution logic
    // TODO: implement bulk creation function
    return [];
  }

  async function queryOnUpdate(
    tableName: string,
    resolvers: ISchemaMutationResolver[]
  ) {
    let items: { [key: string]: any }[] = [];
    await knex.transaction(async (trx: any) => {
      items = await Promise.all(
        resolvers.map(async (resolver) => {
          const [id, data] = await resolver(trx);
          await knex(tableName).transacting(trx).where({ id }).update(data);
          // TODO: optimise, avoid second query?
          return queryById(tableName, id);
        })
      );
    });
    return items;
  }

  async function queryOnDelete(tableName: string, ids: any[]) {
    return [];
  }

  return {
    queryById,
    queryByFilter,
    queryOnCreate,
    queryOnUpdate,
    queryOnDelete,
  };
}
