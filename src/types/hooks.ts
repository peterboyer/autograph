import { MaybePromise } from "./utils";
import { Context } from "./context";
import { Info } from "./info";
import { AdapterTransport } from "./transports";

export interface Hooks<Source> {
  /**
   * query hooks
   */
  onQuery: (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onQueryOne: (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onQueryMany: (
    query: AdapterTransport,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  /**
   * mutation hooks
   */
  onCreate: (
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  onCreateAfterData: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onUpdate: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  onUpdateAfterData: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onDelete: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onDeleteAfterData: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onMutation: (
    source: Source | undefined,
    context: Context,
    info: Info
  ) => MaybePromise<Partial<Source> | void>;
  onMutationAfterData: (
    source: Source,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onGet: (source: Source, context: Context, info: Info) => MaybePromise<void>;
  onSet: (
    source: Source | undefined,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
  onUse: (
    source: Source | undefined,
    context: Context,
    info: Info
  ) => MaybePromise<void>;
}

/**
 * exclude field only fields
 */
export type ModelHooks<Source> = Hooks<Source>;

/**
 * exclude model only fields
 *
 */
export type FieldHooks<Source> = Omit<
  Hooks<Source>,
  "onQuery" | "onQueryOne" | "onQueryMany"
>;
