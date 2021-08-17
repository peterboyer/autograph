import { source } from "common-tags";
import { buildSchema as graphqlBuildSchema } from "graphql";
import { Middleware } from "./middleware";
import { Service, QueryType } from "./service";

export class Autograph {
  #middlewares: Middleware[];
  #services: Service[];

  constructor() {
    this.#middlewares = [];
    this.#services = [];
  }

  use(source: Service | Middleware | (Service | Middleware)[]) {
    const sources = Array.isArray(source) ? source : [source];
    sources.forEach((source) => {
      if (source instanceof Service) {
        this.#services.push(source);
      } else {
        this.#middlewares.push(source);
      }
    });
    return this;
  }

  build() {
    const servicesByType = new Map<QueryType, Service[]>([
      [QueryType.QUERY, []],
      [QueryType.MUTATION, []],
      [QueryType.SUBSCRIPTION, []],
    ]);

    this.#services.forEach((service) => {
      const { type = QueryType.QUERY } = service;
      servicesByType.get(type)!.push(service);
    });

    const schemaSources = new Map<QueryType, string>([
      [QueryType.QUERY, ""],
      [QueryType.MUTATION, ""],
      [QueryType.SUBSCRIPTION, ""],
    ]);

    const rootValueSources = new Map<QueryType, Record<string, any>>([
      [QueryType.QUERY, {}],
      [QueryType.MUTATION, {}],
      [QueryType.SUBSCRIPTION, {}],
    ]);

    servicesByType.forEach((services, type) => {
      // skip if empty
      if (!services.length) return;

      schemaSources.set(
        type,
        source`
          type ${type} {
            ${services.map((service) => service.buildSchemaString()).join("\n")}
          }
        `
      );

      rootValueSources.set(
        type,
        Object.fromEntries(
          services.map(
            (service) =>
              [service.name, service.buildExecutionFunction()] as const
          )
        )
      );
    });

    const schemaSource = source`
      ${schemaSources.get(QueryType.QUERY)!}
      ${schemaSources.get(QueryType.MUTATION)!}
      ${schemaSources.get(QueryType.SUBSCRIPTION)!}
    `;

    console.log(schemaSource);
    console.log(rootValueSources);

    const schema = graphqlBuildSchema(schemaSource);
    const rootValue = Object.fromEntries(rootValueSources);

    return {
      schema,
      rootValue,
    };
  }
}
