export type TQuery = {
  name: string;
  id?: string;
  cursor?: string;
  orders: {
    target: string;
    direction: "asc" | "desc";
  }[];
  filters: {
    target: string;
    operator: string;
    value: any;
  }[];
  limit?: number;
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
