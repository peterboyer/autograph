import lodash from "lodash";
import { IModel, ISchemaAdapter } from "../types";
const { merge, defaults } = lodash;

export default function SchemaManager<T>(
  _models: IModel[],
  _adapters: { [key: string]: ISchemaAdapter },
  options: {
    mutate?: {
      before?: (model: IModel) => void;
      after?: (model: IModel) => void;
    };
  } = {}
): { [key: string]: T } {
  const models = new Set(_models);
  const adapters = new Map(Object.entries(_adapters));

  const fieldDefaults = {};

  // adapters add their defaults to affect all models
  adapters.forEach((adapter) => {
    if (adapter.defaults) {
      merge(fieldDefaults, adapter.defaults());
    }
  });

  const schemasCompiled: { [key: string]: any } = {};

  models.forEach((model) => {
    if (options.mutate?.before) {
      options.mutate?.before(model);
    }

    // adapters mutate the current model
    adapters.forEach((adapter) => {
      adapter.mutate && adapter.mutate(model);
    });

    if (options.mutate?.after) {
      options.mutate?.after(model);
    }

    // apply the defaults to all the fields of the current model
    Object.keys(model.fields).forEach((fieldName) => {
      defaults(model.fields[fieldName], fieldDefaults);
    });

    // compile the model with all the adapters
    const schemaName = model.name;
    schemasCompiled[schemaName] = [...adapters.entries()].reduce(
      (acc, [adapterName, adapter]) =>
        Object.assign(acc, { [adapterName]: adapter.compile(model) }),
      {}
    );
  });

  return schemasCompiled;
}
