import { Type, Scalar } from "../types/type";
import { asScalar } from "../types/type-utils";
import { Sources } from "../types/sources";
import { Context } from "../types/context";
import { Field } from "./field";
import { OptionsCallback, GetMapper, SetMapper } from "./field-options";
import { Filter } from "./filter";
import { Hook } from "./hook";

import { TGraph } from "../types/types-graph";
import TGraphOptions from "../graph/ast-resolvers/ast-resolvers-options";
import TypeDefs from "../graph/ast-typedefs/ast-typedefs";
import Resolvers from "../graph/ast-resolvers/ast-resolvers";

export class FieldAccessError extends Error {}

export class Model<Name extends keyof Sources> {
  name: string;
  fields: Map<string, Field<Sources[Name]>>;
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
        Model<any>,
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
    options?: OptionsCallback<Sources[Name], T>
  ) {
    const get: GetMapper<Sources[Name], T> = (resolver) => ({
      resolver: (...args) => resolver(args[0], args[2], args[3]),
      args: undefined,
    });
    get.with = (args) => (resolver) => ({
      resolver,
      args,
    });

    const set: SetMapper<Sources[Name], T> = (resolver) => ({
      resolver,
      type,
    });
    set.with = (type) => (resolver) => ({
      resolver,
      type,
    });

    const opts = options ? options({ get, set }) : {};
    const key = opts.alias || (name as keyof Sources[Name]);

    this.fields.set(name, {
      name,
      type,
      get: {
        resolver: (source) => source[key],
      },
      set: {
        resolver: (value) =>
          Object.assign({} as Partial<Sources[Name]>, { [key]: value }),
        type: asScalar(type),
      },
      orderTarget: type._is === "scalar" ? key : undefined,
      filterTarget: type._is === "scalar" ? key : undefined,
      ...opts,
    });

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

  filter(name: string) {}

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

  toGraph(options: TGraphOptions<Context>): TGraph {
    const model = {
      name: this.name,
      fields: this.fields,
      hooks: this.hooks,
      typedefs: this.typedefs,
    };

    return {
      typeDefs: TypeDefs(model),
      resolvers: Resolvers(model, options),
    };
  }

  toString() {
    return this.name;
  }
}

export default Model;
