import { IOC, ISchema } from "./SchemaKnex.types";

export default function DeleteTable(ioc: IOC) {
  const { knex } = ioc;

  return function (schema: ISchema) {
    return async function (): Promise<void> {
      const { name } = schema;
      await knex.schema.dropTable(name);
      return;
    };
  };
}
