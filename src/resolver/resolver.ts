import { Type, ValueTyped, ValueTypedRecord } from "../types";

export interface Context {}

export interface Info {}

export interface PluginRequest<
  PARENT = any,
  ARGS extends ResolverArgs = ResolverArgs,
  CONTEXT extends Context = Context,
  INFO extends Info = Info
> {
  parent: PARENT;
  args: ValueTypedRecord<ARGS>;
  context: CONTEXT;
  info: INFO;
}

export enum RootType {
  QUERY = "query",
  MUTATION = "mutation",
  SUBSCRIPTION = "subscription",
}

export interface Plugin<
  REQ extends PluginRequest = PluginRequest,
  RETURNS extends Type = any
> {
  (req: REQ): ValueTyped<RETURNS>;
  rootType?: RootType;
}

export type ResolverName = string;
export type ResolverArgs = Record<string, Type>;
export type ResolverReturns = Type;

export class Resolver<
  PARENT = undefined,
  ARGS extends ResolverArgs = ResolverArgs,
  RETURNS extends ResolverReturns = ResolverReturns
> {
  #name: ResolverName;
  #args: ARGS;
  #returns: RETURNS;
  #fn: Plugin<any, any> | undefined;

  constructor(name: ResolverName, args: ARGS, returns: RETURNS) {
    this.#name = name;
    this.#args = args;
    this.#returns = returns;
  }

  use(fn: Plugin<PluginRequest<PARENT, ARGS>, RETURNS>): this {
    this.#fn = fn;
    return this;
  }
}
