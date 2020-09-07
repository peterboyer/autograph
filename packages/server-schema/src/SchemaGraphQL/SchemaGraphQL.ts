import { ISchemaAdapter } from "../types";
import { IIOC, IModel, IMapType } from "./SchemaGraphQL.types";
import _TypeDefs from "./SchemaGraphQL.TypeDefs";
import _Resolvers from "./SchemaGraphQL.Resolvers";

type IOptions = IIOC & Required<Pick<IIOC, "mapType">>;

export default function SchemaGraphQL(options: IOptions): ISchemaAdapter {
  const { mapType = new Map() } = options;

  const ioc = {
    ...options,
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
