import { Adapter, ISchema } from "./SchemaKnex.types";

export default function DeleteTable(adapter: Adapter) {
  const { knex, mapType } = adapter;

  return function (schema: ISchema) {
    return async function (): Promise<void> {
      const { name } = schema;
      await knex.schema.dropTable(name);
      return;
    };
  };
}
