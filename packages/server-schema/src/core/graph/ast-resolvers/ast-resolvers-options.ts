export type TQuery<TContext = unknown> = {
  name: string;
  id?: string;
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

export type TQueryList = {
  items: Object[];
  total: number;
  cursor?: string;
};

export type TOptions = {
  onQuery: (query: TQuery) => Promise<TQueryList>;
};

export default TOptions;
