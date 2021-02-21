import { Type, Scalar } from "../types/type";
import { asScalar } from "../types/type-utils";
import { Sources } from "../types/sources";
import { QueryTransports } from "../types/transports";
import { Hooks } from "../types/hooks";
import { Field, GetResolver } from "./field";
import { Options, OptionsCallback } from "./field-options";
import { Filter, FilterResolver } from "./filter";
import { useMappers } from "./use-mappers";
import { useDefaultFilters } from "./use-default-filters";

export type Node = "root" | "query" | "mutation";

export class Model<Name extends keyof Sources, Source extends Sources[Name]> {
  readonly name: string;

  readonly fields: Partial<Record<string, Field<Source>>>;
  readonly filters: Partial<Record<string, Filter>>;
  readonly hooks: Partial<Hooks<Source>>;
  readonly typeDefs: Record<Node, string[]>;
  readonly resolvers: Record<Node, GetResolver<any>[]>;

  readonly queryOne: boolean;
  readonly queryMany: boolean;
  readonly mutationCreate: boolean;
  readonly mutationUpdate: boolean;
  readonly mutationDelete: boolean;
  readonly limitDefault: number;
  readonly limitMax: number;

  constructor(
    name: Name,
    options?: Partial<
      Pick<
        Model<any, any>,
        | "queryOne"
        | "queryMany"
        | "mutationCreate"
        | "mutationUpdate"
        | "mutationDelete"
        | "limitDefault"
        | "limitMax"
      >
    >
  ) {
    this.name = name;

    this.fields = {};
    this.filters = {};
    this.hooks = {};
    this.typeDefs = { root: [], query: [], mutation: [] };
    this.resolvers = { root: [], query: [], mutation: [] };

    this.queryOne = options?.queryOne ?? true;
    this.queryMany = options?.queryMany ?? true;
    this.mutationCreate = options?.mutationCreate ?? true;
    this.mutationUpdate = options?.mutationUpdate ?? true;
    this.mutationDelete = options?.mutationDelete ?? true;
    this.limitDefault = options?.limitDefault ?? 20;
    this.limitMax = options?.limitMax ?? 50;
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
      setCreateToAction,
      setUpdateToAction,
      orderTarget,
      filterTarget,
      enableDefaultFilters = true,
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
              resolver: (source) => source[key],
            },
      setCreate:
        setCreate === null
          ? undefined
          : setCreate || set === null
          ? undefined
          : set || {
              type: asScalar(type),
              stage: "data",
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
              stage: "data",
              resolver: setResolverDefault,
            } ||
            undefined,
      setCreateToAction,
      setUpdateToAction,
      orderTarget: orderTarget ?? get === undefined ? key : undefined,
      filterTarget: filterTarget ?? get === undefined ? key : undefined,
      ...opts,
    };

    if (enableDefaultFilters) {
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
  filter<T extends Scalar, Tr extends keyof QueryTransports>(
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
  }

  hook<T extends keyof Hooks<Source>, H extends Hooks<Source>[T]>(
    type: T,
    handler: H
  ) {
    this.hooks[type] = handler;
  }

  typeDef(node: Node, value: string) {
    this.typeDefs[node].push(value);
  }

  resolver(node: Node, resolver: GetResolver<any>) {
    this.resolvers[node].push(resolver);
  }
}

export default Model;
