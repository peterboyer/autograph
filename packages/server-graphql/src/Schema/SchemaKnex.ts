import { SchemaAdapter, ISchema, IOC } from "./SchemaKnex.types";
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

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Config = WithOptional<IOC, "mapType">;

export default function SchemaKnex(config: Config) {
  const { knex, mapType = new Map() } = config;
  const ioc: IOC = {
    knex,
    mapType: new Map([...defaultsMapType.entries(), ...mapType.entries()]),
  };

  function defaults() {
    return {
      column: undefined,
      primary: false,
      unique: false,
    };
  }

  function mutate(schema: ISchema) {
    schema.fields = new Map([
      [
        "id",
        {
          type: "ID",
          primary: true,
          nullable: false,
        },
      ],
      ...schema.fields.entries(),
      [
        "createdAt",
        {
          type: "DateTime",
          default: knex.fn.now(),
          nullable: false,
        },
      ],
      [
        "updatedAt",
        {
          type: "DateTime",
          default: knex.fn.now(),
          nullable: false,
        },
      ],
    ]);
  }

  const CreateTable = _CreateTable(ioc);
  const DeleteTable = _DeleteTable(ioc);

  function compile(schema: ISchema) {
    const createTable = CreateTable(schema);
    const deleteTable = DeleteTable(schema);

    return {
      createTable,
      deleteTable,
    };
  }

  return {
    defaults,
    mutate,
    compile,
  } as SchemaAdapter<{}>;
}
