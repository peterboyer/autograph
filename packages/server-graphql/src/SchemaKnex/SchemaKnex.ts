import { WithOptional, ISchemaAdapter } from "../types";
import { IIOC, IModel } from "./SchemaKnex.types";
import _CreateTable from "./SchemaKnex_CreateTable";
import _DeleteTable from "./SchemaKnex_DeleteTable";

const defaultsMapType = new Map<string, string>([
  ["ID", "integer"],
  ["Int", "integer"],
  ["Float", "float"],
  ["String", "text"],
  ["Boolean", "boolean"],
  ["DateTime", "timestamp"],
  ["Date", "date"],
  ["Time", "time"],
]);

type Config = WithOptional<IIOC, "mapType">;

export default function SchemaKnex(config: Config): ISchemaAdapter {
  const { knex, mapType = new Map() } = config;

  const ioc: IIOC = {
    ...config,
    mapType: new Map([...defaultsMapType.entries(), ...mapType.entries()]),
  };

  function defaults() {
    return {
      column: undefined,
      primary: false,
      unique: false,
      nullable: true,
      default: undefined,
      virtual: false,
      relationship: false,
      relationshipOnDelete: "CASCADE",
      relationshipOnUpdate: "CASCADE",
    };
  }

  function mutate(model: IModel) {
    model.fields = {
      id: model.fields.id || {
        type: "ID",
        primary: true,
        nullable: false,
      },
      ...model.fields,
      createdAt: model.fields.createdAt || {
        type: "DateTime",
        nullable: false,
        default: knex.fn.now(),
      },
      updatedAt: model.fields.updatedAt || {
        type: "DateTime",
        nullable: false,
        default: knex.fn.now(),
      },
    };
  }

  const CreateTable = _CreateTable(ioc);
  const DeleteTable = _DeleteTable(ioc);

  function compile(model: IModel) {
    const createTable = CreateTable(model);
    const deleteTable = DeleteTable(model);

    return {
      createTable,
      deleteTable,
    };
  }

  return {
    defaults,
    mutate,
    compile,
  };
}
