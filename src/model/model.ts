import { Type, Scalar } from "../types/type";
import { AsScalar, asScalar } from "../types/type-utils";
import { Node } from "../types/graph";
import { Sources } from "../types/sources";
import { Hooks } from "../types/hooks";
import { Resolver } from "../types/resolver";
import { Field, GetResolver } from "./field";
import { Options, OptionsCallback } from "./field-options";
import { Filter, FilterResolver, Transport } from "./filter";
import { useMappers } from "./use-mappers";
import { useDefaultFilters } from "./use-default-filters";

export class Model<
  Name extends string,
  Source extends Name extends keyof Sources ? Sources[Name] : any
> {
  readonly name: Name;

  readonly fields: Record<string, Field<Source>>;
  readonly filters: Record<string, Filter>;
  readonly hooks: Partial<Hooks<Source>>;
  readonly typeDefs: Record<Node, string[]>;
  readonly resolvers: Record<Node, Resolver[]>;

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

  field<T extends Type | { get: Type; set: Scalar }>(
    name: string,
    type: T,
    options?:
      | Options<Source>
      | OptionsCallback<
          Source,
          T extends { get: Type } ? T["get"] : T extends Type ? T : unknown,
          T extends { set: Scalar }
            ? T["set"]
            : T extends Type
            ? AsScalar<T>
            : unknown
        >
  ) {
    const mappers = useMappers<
      Source,
      T extends { get: Type } ? T["get"] : T extends Type ? T : unknown,
      T extends { set: Scalar }
        ? T["set"]
        : T extends Type
        ? AsScalar<T>
        : unknown
    >();

    const {
      alias,
      get,
      set,
      setCreate,
      setUpdate,
      setAfterData,
      setCreateAfterData,
      setUpdateAfterData,
      hooks,
      orderTarget,
      filterTarget,
      defaultFilters = true,
      ...opts
    } = options
      ? typeof options === "function"
        ? options(mappers)
        : options
      : ({} as Options<Source>);
    const key = alias || (name as Exclude<keyof Source, number | symbol>);

    const defaultGet = {
      args: {},
      resolver: (source: any) => source[key],
    };

    const defaultSet = {
      resolver: (value: any) =>
        Object.assign({} as Partial<Source>, { [key]: value }),
    };

    /**
     * defaults of setCreate and setUpdate, known as setACTION
     * (1) if setACTION === null (forced off), use undefined
     * (2) if setACTION is specified in options, use setACTION
     * (3) if setACTION is not specified, check "set" definition
     * (4) if set === null (forced off), use undefined
     * (5) if setAfterData or setACTIONAfterData is specified, use undefined
     * (6) otherwise try set, or fallback to defaultSet handler
     *
     * In essence, if set isn't nulled, use default for ACTION. If specified,
     * the setACTION given will be used instead. If setACTIONAfterData is
     * specified then setACTION will not be used, unless setACTION is specified.
     */
    this.fields[name] = {
      name,
      type: {
        get: "get" in type ? (type as { get: Type }).get : (type as Type),
        set:
          "set" in type
            ? (type as { set: Scalar }).set
            : asScalar(type as Type),
      },
      get: get === null ? undefined : get || defaultGet,
      setCreate:
        setCreate === null
          ? undefined
          : setCreate ||
            (set === null
              ? undefined
              : !(setAfterData || setCreateAfterData)
              ? set || defaultSet
              : undefined),
      setUpdate:
        setUpdate === null
          ? undefined
          : setUpdate ||
            (set === null
              ? undefined
              : !(setAfterData || setUpdateAfterData)
              ? set || defaultSet
              : undefined),
      setCreateAfterData: setCreateAfterData || setAfterData,
      setUpdateAfterData: setUpdateAfterData || setAfterData,
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
  filter<T extends Scalar>(
    name: string,
    type: T,
    resolver: FilterResolver<T, "adapter">
  ) {
    this.filters[name] = {
      name,
      type,
      transport: "adapter",
      resolver,
    };

    return this;
  }

  hook<E extends keyof Hooks<Source>, H extends Hooks<Source>[E]>(
    event: E,
    handler: H
  ) {
    this.hooks[event] = handler;

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
export type ModelAny = Model<keyof Sources, any>;
