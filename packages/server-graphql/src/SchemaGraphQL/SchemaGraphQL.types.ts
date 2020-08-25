import { IModel as RIModel, IModelField as RIModelField } from "../types";

export type GQLString = string & {};
export type GQLResolver = (
  parent?: { [key: string]: any },
  args?: { [key: string]: any },
  context?: { [key: string]: any },
  info?: { [key: string]: any }
) => any;

export type IIOC = {
  queryById: (
    tableName: string,
    id: any,
    args?: Parameters<GQLResolver>
  ) => Promise<{} | null>;
  queryByFilter: (tableName: string) => Promise<{}[]>;
  queryOnCreate: (
    tableName: string,
    data: { [key: string]: any }[]
  ) => Promise<{}[]>;
  queryOnUpdate: (
    tableName: string,
    data: { id: any; [key: string]: any }[]
  ) => Promise<{}[]>;
  queryOnDelete: (tableName: string, data: any[]) => Promise<any[]>;
  errors: {
    NotFound: (tableName: string, queryArgs?: {}) => Error;
    NotValid: (details?: {}) => Error;
  };
  mapType: Map<string, string>;
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
  args?: Map<string, string>;
  getter?: GQLResolver | string | null;
  setter?:
    | ((trx: any) => (value: any, item: { [key: string]: any }) => Promise<any>)
    | string
    | null;
};

export type ISchema = {
  typeDefs: ISchemaTypeDefs;
  resolvers: ISchemaResolvers;
};

export type ISchemaNode = "Root" | "Query" | "Mutation";

export type ISchemaTypeDefs = {
  Root: GQLString;
  Query: GQLString;
  Mutation: GQLString;
};

export type ISchemaResolvers = {
  Root: { [key: string]: GQLResolver };
  Query: { [key: string]: GQLResolver };
  Mutation: { [key: string]: GQLResolver };
};

export type ISchemaMutationResolver = (
  trx?: any
) => Promise<[any, { [key: string]: any }]>;
