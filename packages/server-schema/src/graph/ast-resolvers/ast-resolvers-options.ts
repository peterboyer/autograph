import { TResolver } from "../../types/types-graphql";

export type TQuery<TContext = any> = {
  name: string;
  id?: string | null;
  cursor?: string;
  limit?: number;
  order?: {
    target: string;
    direction: "asc" | "desc";
  };
  filters?: {
    target: string;
    operator: string;
    value: any;
  }[];
  context: TContext;
};

export type TMutation<TContext = any> = {
  name: string;
  id?: string;
  data?: Record<string, any>;
  context: TContext;
};

export type TQueryList = {
  items: Record<string, any>[];
  total: number;
  cursor?: string;
};

export type TQueryResolver = (
  query: Record<string, any>
) => Record<string, any> | Promise<Record<string, any>> | void;

export interface Adapter {
  onQuery(query: TQuery, queryResolver?: TQueryResolver): Promise<TQueryList>;
  onMutation(mutation: TMutation): Promise<Record<string, any> | undefined>;
}

export type TOptions<Context = any> = {
  adapter: Adapter;
  middleware?: (
    resolverArgs: Parameters<TResolver<any, any, Context>>,
    next: TResolver
  ) => Promise<any>;
};

export default TOptions;
