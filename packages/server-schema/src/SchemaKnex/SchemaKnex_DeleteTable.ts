import { IIOC, IModel } from "./SchemaKnex.types";

export default function DeleteTable(ioc: IIOC) {
  const { knex } = ioc;

  return function (model: IModel) {
    return async function (): Promise<null | false> {
      const { name } = model;

      if (!(await knex.schema.hasTable(name))) {
        return false;
      }

      await knex.schema.dropTable(name);
      return null;
    };
  };
}
