import { GraphQLResolveInfo } from "graphql";
import { IModel as RIModel, IModelField as RIModelField } from "../types";

export type IResolver<
  TSource = unknown,
  TArgs = {},
  TContext = unknown,
  TReturn = any
> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TReturn;

export type IResolverAny = IResolver<any, any, any>;

export type ISchemaMutationTransactor<T extends Object> = (
  trx?: any
) => Promise<[any, T]>;

export type IModelResolversGetter = (
  defaultGetter: any,
  context: { tableName: string; selectArgs: Set<string> }
) => IResolverAny;

export type IModelFilter = {
  type: String;
  use: (config: any, value: any) => any;
};

export type IQueryById = (
  tableName: string,
  args: { id: string },
  resolverArgs: Parameters<IResolverAny>,
  getter?: IModelResolversGetter
) => Promise<any>;

export type IQueryByArgs = (
  tableName: string,
  args: {
    cursor?: string;
    order?: { name: string; by?: string };
    filters: (
      | { name: string; type: string; value: any }
      | { _custom: IModelFilter; value: any }
    )[];
    limit: number;
  },
  resolverArgs: Parameters<IResolverAny>,
  getter?: IModelResolversGetter
) => Promise<{ items: any[]; total?: number; cursor?: string }>;

export type IQueryOnCreate<T = any> = (
  tableName: string,
  transactors: ISchemaMutationTransactor<T>[],
  resolverArgs: Parameters<IResolverAny>
) => Promise<T[]>;

export type IQueryOnUpdate<T = any> = (
  tableName: string,
  transactors: ISchemaMutationTransactor<T>[],
  resolverArgs: Parameters<IResolverAny>
) => Promise<T[]>;

export type IQueryOnDelete = (
  tableName: string,
  ids: any[],
  resolverArgs: Parameters<IResolverAny>
) => Promise<string[]>;

export type IErrorNotFound<TResolverArgs = Parameters<IResolverAny>> = (
  tableName: string,
  query: Record<any, any>,
  resolverArgs: TResolverArgs
) => Error;

export type IErrorNotValid<TExtensions = Record<any, any>> = (
  extensions?: TExtensions,
  resolverArgs?: Parameters<IResolverAny>
) => Error;

export type IMapType = Map<string, string>;

export type IIOC = {
  queryById: IQueryById;
  queryByArgs: IQueryByArgs;
  queryOnCreate: IQueryOnCreate;
  queryOnUpdate: IQueryOnUpdate;
  queryOnDelete: IQueryOnDelete;
  errors: {
    NotFound: IErrorNotFound;
    NotValid: IErrorNotValid;
  };
  mapType: IMapType;
  limitDefault: number;
  limitMaxDefault: number;
};

export type IModel = RIModel<IModelFieldAttributes, IModelAttributes>;
export type IModelField = RIModelField<IModelFieldAttributes>;
export type IModelAttributes = {
  filters?: {
    [key: string]: IModelFilter;
  };
  resolvers?: {
    getter?: IModelResolversGetter;
    getterOne?: IModelResolversGetter;
    getterMany?: IModelResolversGetter;
  };
};

export type IModelFieldAttributes = {
  // TODO: consider different name for "column"
  column?: string;
  virtual?: boolean;
  relationship?: boolean | string;
  many?: boolean;
  primary?: boolean;
  nullable?: boolean;
  private?: boolean;
  args?: Record<any, string>;
  getter?: IModelGetter;
  setter?: IModelSetter;
};

export type IModelGetter = IResolverAny | string | null;
export type IModelSetter = IModelSetterCallback | string | null;
export type IModelSetterCallback<T = unknown> = (
  trx: any
) => (value: unknown, item: T) => Promise<any>;

export type ISchemaNodeType = "Root" | "Query" | "Mutation";
export type ISchemaTypeDefs = Record<ISchemaNodeType, string>;
export type ISchemaResolvers = Record<ISchemaNodeType, IResolverAny>;

export type ISchema = {
  typeDefs: ISchemaTypeDefs;
  resolvers: ISchemaResolvers;
};
