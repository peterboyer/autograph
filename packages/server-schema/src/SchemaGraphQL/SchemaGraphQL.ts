import { ISchemaAdapter } from "../types";
import {
  IModel,
  IQueryById,
  IQueryByArgs,
  IQueryOnCreate,
  IQueryOnUpdate,
  IQueryOnDelete,
  IErrorNotFound,
  IErrorNotValid,
  IMapType,
} from "./SchemaGraphQL.types";
import _TypeDefs from "./SchemaGraphQL_TypeDefs";
import _Resolvers from "./SchemaGraphQL_Resolvers";

type IOptions = {
  queryById: IQueryById;
  queryByArgs: IQueryByArgs;
  queryOnCreate: IQueryOnCreate;
  queryOnUpdate: IQueryOnUpdate;
  queryOnDelete: IQueryOnDelete;
  errors: {
    NotFound: IErrorNotFound;
    NotValid: IErrorNotValid;
  };
  mapType?: IMapType;
};

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
