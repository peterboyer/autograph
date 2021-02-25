import { MaybePromise } from "./utils";
import { Context } from "./context";
import { Info } from "./info";
import { AdapterTransport } from "./transports";

export interface Hooks<Source> {
  /**
   * query hooks
   */
  "on-query": (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-query-one": (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-query-many": (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  /**
   * mutation hooks
   */
  "on-create": (
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  "on-create-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-update": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  "on-update-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-delete": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-delete-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  "on-mutation": (
    source: Source | undefined,
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  "on-mutation-after-data": (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
}

export type FieldHooks<Source> = Omit<
  Hooks<Source>,
  "on-query" | "on-query-one" | "on-query-many"
>;
