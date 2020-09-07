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

export type IQueryById<T = any, TResolverArgs = Parameters<IResolverAny>> = (
  tableName: string,
  id: any,
  resolverArgs?: TResolverArgs
) => Promise<T | null>;

export type IQueryByArgs<T = any, TResolverArgs = Parameters<IResolverAny>> = (
  tableName: string,
  args: {
    cursor?: string;
    order?: { name: string; by?: string };
  },
  resolverArgs?: TResolverArgs
) => Promise<{ items: T[]; total?: number; cursor?: string }>;

export type IQueryOnCreate<
  T = any,
  TResolverArgs = Parameters<IResolverAny>
> = (
  tableName: string,
  transactors: ISchemaMutationTransactor<T>[],
  resolverArgs?: TResolverArgs
) => Promise<T[]>;

export type IQueryOnUpdate<
  T = any,
  TResolverArgs = Parameters<IResolverAny>
> = (
  tableName: string,
  transactors: ISchemaMutationTransactor<T>[],
  resolverArgs?: TResolverArgs
) => Promise<T[]>;

export type IQueryOnDelete<TResolverArgs = Parameters<IResolverAny>> = (
  tableName: string,
  ids: any[],
  resolverArgs?: TResolverArgs
) => Promise<string[]>;

export type IErrorNotFound<TResolverArgs = Parameters<IResolverAny>> = (
  tableName: string,
  query: Record<any, any>,
  resolverArgs?: TResolverArgs
) => Error;

export type IErrorNotValid<
  TExtensions = Record<any, any>,
  TResolverArgs = Parameters<IResolverAny>
> = (extensions?: TExtensions, resolverArgs?: TResolverArgs) => Error;

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
};

export type IModel = RIModel<IModelFieldAttributes, IModelAttributes>;
export type IModelField = RIModelField<IModelFieldAttributes>;
export type IModelAttributes = {};

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
