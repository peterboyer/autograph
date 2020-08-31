import { IIOC, IModel } from "./SchemaKnex.types";

export default function DeleteTable(ioc: IIOC) {
  const { knex } = ioc;

  return function (model: IModel) {
    return async function (): Promise<void> {
      const { name } = model;
      await knex.schema.dropTableIfExists(name);
    };
  };
}
