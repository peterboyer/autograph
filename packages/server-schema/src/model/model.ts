import { Type, Scalar } from "../types/type";
import { asScalar } from "../types/type-utils";
import { Node } from "../types/graph";
import { Sources } from "../types/sources";
import { QueryTransport } from "../types/transports";
import { Hooks } from "../types/hooks";
import { Field, GetResolver } from "./field";
import { Options, OptionsCallback } from "./field-options";
import { Filter, FilterResolver, Transport } from "./filter";
import { useMappers } from "./use-mappers";
import { useDefaultFilters } from "./use-default-filters";

export class Model<Name extends keyof Sources, Source extends Sources[Name]> {
  readonly name: Name;

  readonly fields: Record<string, Field<Source>>;
  readonly filters: Record<string, Filter>;
  readonly hooks: Partial<Hooks<Source>>;
  readonly typeDefs: Record<Node, string[]>;
  readonly resolvers: Record<Node, GetResolver<any>[]>;

  readonly queryOne: string | undefined;
  readonly queryMany: string | undefined;
  readonly mutationCreate: string | undefined;
  readonly mutationUpdate: string | undefined;
  readonly mutationDelete: string | undefined;
  readonly limitDefault: number;
  readonly limitMax: number;
  readonly defaultDocs: boolean;

  constructor(
    name: Name,
    options?: Partial<
      {
        queryOne?: string | boolean;
        queryMany?: string | boolean;
        mutationCreate?: string | boolean;
        mutationUpdate?: string | boolean;
        mutationDelete?: string | boolean;
      } & Pick<Model<any, any>, "limitDefault" | "limitMax" | "defaultDocs">
    >
  ) {
    this.name = name;

    this.fields = {};
    this.filters = {};
    this.hooks = {};
    this.typeDefs = { root: [], query: [], mutation: [] };
    this.resolvers = { root: [], query: [], mutation: [] };

    const {
      queryOne = true,
      queryMany = true,
      mutationCreate = true,
      mutationUpdate = true,
      mutationDelete = true,
      limitDefault = 20,
      limitMax = 50,
      defaultDocs = true,
    } = options || {};

    this.queryOne = queryOne === true ? `${name}` : queryOne || undefined;
    this.queryMany =
      queryMany === true ? `${name}Many` : queryMany || undefined;
    this.mutationCreate =
      mutationCreate === true ? `${name}Create` : mutationCreate || undefined;
    this.mutationUpdate =
      mutationUpdate === true ? `${name}Update` : mutationUpdate || undefined;
    this.mutationDelete =
      mutationDelete === true ? `${name}Delete` : mutationDelete || undefined;
    this.limitDefault = limitDefault;
    this.limitMax = limitMax;
    this.defaultDocs = defaultDocs;
  }

  field<T extends Type>(
    name: string,
    type: T,
    options?: OptionsCallback<Source, T>
  ) {
    const mappers = useMappers<Source, T>(type);

    const {
      alias,
      get,
      set,
      setCreate,
      setUpdate,
      setCreateAfterData,
      setUpdateAfterData,
      hooks,
      orderTarget,
      filterTarget,
      defaultFilters = true,
      ...opts
    } = options ? options(mappers) : ({} as Options<Source>);
    const key = alias || (name as Exclude<keyof Source, number | symbol>);

    const setResolverDefault = (value: any) =>
      Object.assign({} as Partial<Source>, { [key]: value });

    this.fields[name] = {
      name,
      type,
      get:
        get === null
          ? undefined
          : get || {
              args: {},
              resolver: (source) => source[key],
            },
      setCreate:
        setCreate === null
          ? undefined
          : setCreate || set === null
          ? undefined
          : set || {
              type: asScalar(type),
              resolver: setResolverDefault,
            } ||
            undefined,
      setUpdate:
        setUpdate === null
          ? undefined
          : setUpdate || set === null
          ? undefined
          : set || {
              type: asScalar(type),
              resolver: setResolverDefault,
            } ||
            undefined,
      setCreateAfterData,
      setUpdateAfterData,
      hooks: hooks ?? {},
      orderTarget: orderTarget ?? get === undefined ? key : undefined,
      filterTarget: filterTarget ?? get === undefined ? key : undefined,
      ...opts,
    };

    if (defaultFilters) {
      useDefaultFilters(this.fields[name]!, this.filters);
    }

    return this;
  }

  /**
   *
   * @param name name of filter
   * @param type graph type to receive value
   * @param resolver
   */
  filter<T extends Scalar, Tr extends Transport>(
    name: string,
    type: T,
    transport: Tr,
    resolver: FilterResolver<T, Tr>
  ) {
    this.filters[name] = {
      name,
      type,
      transport,
      resolver,
    };

    return this;
  }

  hook<T extends keyof Hooks<Source>, H extends Hooks<Source>[T]>(
    type: T,
    handler: H
  ) {
    this.hooks[type] = handler;

    return this;
  }

  typeDef(node: Node, value: string) {
    this.typeDefs[node].push(value);

    return this;
  }

  resolver(node: Node, resolver: GetResolver<any>) {
    this.resolvers[node].push(resolver);

    return this;
  }
}

// @ts-ignore
export type ModelAny = Model<keyof Sources, { [key: string]: any }>;
