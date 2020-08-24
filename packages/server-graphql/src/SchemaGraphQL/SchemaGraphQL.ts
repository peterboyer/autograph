import { SchemaAdapter, WithOptional } from "../types";
import { ISchema, IOC } from "./SchemaGraphQL.types";
import _TypeDefs from "./SchemaGraphQL_TypeDefs";
import _Resolvers from "./SchemaGraphQL_Resolvers";

type Config = WithOptional<IOC, "mapType">;

export default function SchemaGraphQL(config: Config) {
  const { mapType = new Map(), queryById, errors } = config;

  const ioc: IOC = {
    mapType: new Map([...mapType.entries()]),
    queryById,
    errors,
  };

  const TypeDefs = _TypeDefs(ioc);
  const Resolvers = _Resolvers(ioc);

  function compile(schema: ISchema) {
    const typeDefs = TypeDefs(schema);
    const resolvers = Resolvers(schema);

    return {
      typeDefs,
      resolvers,
    };
  }

  return {
    compile,
  } as SchemaAdapter<{}>;
}
