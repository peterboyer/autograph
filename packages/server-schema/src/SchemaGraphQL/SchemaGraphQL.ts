import { WithOptional, ISchemaAdapter } from "../types";
import { IIOC, IModel } from "./SchemaGraphQL.types";
import _TypeDefs from "./SchemaGraphQL_TypeDefs";
import _Resolvers from "./SchemaGraphQL_Resolvers";

type Config = WithOptional<IIOC, "mapType">;

export default function SchemaGraphQL(config: Config): ISchemaAdapter {
  const { mapType = new Map() } = config;

  const ioc: IIOC = {
    ...config,
    mapType: new Map([...mapType.entries()]),
  };

  function defaults() {
    return {
      column: undefined,
      virtual: false,
      relationship: undefined,
      many: false,
      primary: false,
      nullable: true,
      private: false,
      args: undefined,
      setter: undefined,
      getter: undefined,
    };
  }

  const TypeDefs = _TypeDefs(ioc);
  const Resolvers = _Resolvers(ioc);

  function compile(model: IModel) {
    const typeDefs = TypeDefs(model);
    const resolvers = Resolvers(model);

    return {
      typeDefs,
      resolvers,
    };
  }

  return {
    defaults,
    compile,
  };
}
