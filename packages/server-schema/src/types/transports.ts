import { Sources } from "./sources";
import { Context } from "./context";
import { Config } from "./config";

export interface QueryTransport {
  context: Context;
  name: Exclude<keyof Sources, number | symbol>;
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
}

export interface MutationTransport<Source = {}> {
  context: Context;
  name: Exclude<keyof Sources, number | symbol>;
  id?: string;
  data?: Partial<Record<Exclude<keyof Source, number | symbol>, any>>;
}

export type AdapterTransport = "AdapterTransport" extends keyof Config
  ? Config["AdapterTransport"]
  : unknown;
