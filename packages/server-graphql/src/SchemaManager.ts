import lodash from "lodash";
import { Schema, SchemaAdapter } from "./types";
const { merge, defaults } = lodash;

export default function SchemaManager(
  schemas: Set<Schema>,
  adapters: Map<string, SchemaAdapter<any>>
) {
  const fieldDefaults = {
    virtual: false,
    nullable: true,
    default: undefined,
    private: false,
    setter: undefined,
    getter: undefined,
    many: false,
    relationship: false,
  };

  // adapters add their defaults to affect all schemas
  adapters.forEach((adapter) => {
    if (adapter.defaults) {
      merge(fieldDefaults, adapter.defaults());
    }
  });

  const schemasCompiled: { [key: string]: Map<string, any> } = {};

  schemas.forEach((schema) => {
    // adapters mutate the current schema
    adapters.forEach((adapter) => {
      adapter.mutate && adapter.mutate(schema);
    });

    // apply the defaults to all the fields of the current schema
    Object.keys(schema.fields).forEach((fieldName) => {
      defaults(schema.fields[fieldName], fieldDefaults);
    });

    // compile the schema with all the adapters
    const schemaName = schema.name;

    schemasCompiled[schemaName] = new Map(
      [...adapters.entries()].map(([adapterName, adapter]) => [
        adapterName,
        adapter.compile(schema),
      ])
    );
  });

  return schemasCompiled;
}
