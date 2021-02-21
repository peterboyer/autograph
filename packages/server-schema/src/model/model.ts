import { Type, Scalar } from "../types/type";
import { asScalar } from "../types/type-utils";
import { Sources } from "../types/sources";
import { QueryTransports } from "../types/transports";
import { Field } from "./field";
import { Options, OptionsCallback } from "./field-options";
import { Filter, FilterResolver } from "./filter";
import { Hook } from "./hook";
import { useMappers } from "./use-mappers";
import { useDefaultFilters } from "./use-default-filters";

export class FieldAccessError extends Error {}

export class Model<Name extends keyof Sources, Source extends Sources[Name]> {
  name: string;
  fields: Map<string, Field<Source>>;
  filters: Map<string, Filter>;
  hooks: Map<string, Hook>;
  typedefs: Map<string, string>;

  queryOne: boolean;
  queryMany: boolean;
  mutationCreate: boolean;
  mutationUpdate: boolean;
  mutationDelete: boolean;

  limitDefault: number;
  limitMax: number;

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

    this.fields = new Map();
    this.filters = new Map();
    this.hooks = new Map();
    this.typedefs = new Map();

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

    this.fields.set(name, {
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
    });

    if (enableDefaultFilters) {
      useDefaultFilters(this.fields.get(name)!, this.filters);
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
    this.filters.set(name, {
      type,
      transport,
      resolver,
    });
  }

  // filters(schemaFilters: Schema["filters"]) {
  //   Object.entries(schemaFilters || {}).forEach(([filterName, filter]) => {
  //     this.ast.filters[filterName] = Filter(filter);
  //   });

  //   return this;
  // }

  hook() {}

  // hooks(schemaHooks: Partial<Schema["hooks"]>) {
  //   Object.assign(this.ast.hooks, schemaHooks);

  //   return this;
  // }

  // query(schemaQuery: Partial<Schema["query"]>) {
  //   Object.assign(this.ast.query, schemaQuery);

  //   return this;
  // }

  // typeDefs(schemaTypeDefs: Partial<Schema["typeDefs"]>) {
  //   Object.assign(this.ast.typeDefs, schemaTypeDefs);

  //   return this;
  // }

  // limitDefault(schemaLimitDefault: Schema["limitDefault"]) {
  //   this.ast.limitDefault = schemaLimitDefault;

  //   return this;
  // }

  // limitMax(schemaLimitMax: Schema["limitMax"]) {
  //   this.ast.limitMax = schemaLimitMax;

  //   return this;
  // }

  // toGraph(options: TGraphOptions<Context>): TGraph {
  //   const model = {
  //     name: this.name,
  //     fields: this.fields,
  //     hooks: this.hooks,
  //     typedefs: this.typedefs,
  //   };

  //   return {
  //     typeDefs: TypeDefs(model),
  //     resolvers: Resolvers(model, options),
  //   };
  // }

  toString() {
    return this.name;
  }
}

export default Model;
