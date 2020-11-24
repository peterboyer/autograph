export type TQueryCursor<EXT = {}> = { name: string; cursor: string } & EXT;
export type TQueryOne<EXT = {}> = { name: string; id: string } & EXT;
export type TQueryMany<EXT = {}> = {
  name: string;
  limit: number;
  order?: {
    target: string;
    direction: "asc" | "desc";
  };
  filters?: {
    target: string;
    operator: string;
    value: any;
  }[];
} & EXT;

export type TQuery<EXT = {}> =
  | TQueryCursor<EXT>
  | TQueryOne<EXT>
  | TQueryMany<EXT>;

export type TQueryList = {
  items: Object[];
  total: number;
  cursor?: string;
};

export type TOptions = {
  onQuery: (query: TQuery) => Promise<TQueryList>;
};

export default TOptions;
