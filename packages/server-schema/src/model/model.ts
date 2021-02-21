import { Type, Scalar } from "../types/type";
import { asScalar } from "../types/type-utils";
import { Sources } from "../types/sources";
import { Transports } from "../types/transports";
import { Field } from "./field";
import { Options, OptionsCallback } from "./field-options";
import { Filter, FilterResolver } from "./filter";
import { Hook } from "./hook";
import { useMappers } from "./use-mappers";

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
      useDefaultFilters = true,
      ...opts
    } = options ? options(mappers) : ({} as Options<Source>);
    const key = alias || (name as keyof Source);

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
      orderTarget:
        orderTarget ?? (!get && type._is === "scalar" ? key : undefined),
      filterTarget:
        filterTarget ?? (!get && type._is === "scalar" ? key : undefined),
      ...opts,
    });

    if (useDefaultFilters) {
      // TODO: migrate filters from below
    }

    return this;
  }

  // fields(schemaFields: Schema["fields"]) {
  //   Object.entries(schemaFields).forEach(([fieldName, fieldDefinition]) => {
  //     this.ast.fields[fieldName] = Field(fieldDefinition, fieldName);

  //     const field = this.ast.fields[fieldName];

  //     const target = field.filterTarget;
  //     if (!target) return;

  //     const operators =
  //       field.type._is === "scalar"
  //         ? SCALAR_OPERATORS
  //         : field.type._is === "object"
  //         ? OBJECT_OPERATORS
  //         : [];

  //     operators.forEach((operator) => {
  //       const filterName = `${fieldName}_${operator}`;

  //       // skip if already defined
  //       if (this.ast.filters[filterName]) return;

  //       let arg = (field.type._is === "scalar"
  //         ? field.type
  //         : Types.ID) as TScalar;

  //       if (["in", "ni"].includes(operator)) {
  //         // @ts-ignore
  //         if ("List" in arg) arg = arg.List;
  //       }

  //       this.ast.filters[filterName] = {
  //         stage: "pre",
  //         arg,
  //         transactor: (value, query) => {
  //           if (!("id" in query || "cursor" in query)) {
  //             query.filters = query.filters || [];
  //             query.filters.push({
  //               target,
  //               operator,
  //               value,
  //             });
  //           }
  //           return query;
  //         },
  //       };
  //     });
  //   });

  //   return this;
  // }

  /**
   *
   * @param name name of filter
   * @param type graph type to receive value
   * @param resolver
   */
  filter<T extends Scalar, Tr extends keyof Transports>(
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
