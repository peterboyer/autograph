import { IModel as RIModel } from "../types";

export type IKnex = any;

export type IIOC = {
  knex: IKnex;
  mapType: Map<string, string>;
};

export type IModel = RIModel<IModelFieldAttributes, IModelAttributes>;

export type IModelAttributes = {
  constraints?: {
    unique?: string[][];
  };
};

export type IModelFieldAttributes = {
  column?: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
  virtual?: boolean;
  relationship?: boolean | string;
};

export type ISchema = {
  createTable: (rows?: {}[]) => Promise<{}[]>;
  deleteTable: () => Promise<void>;
};
