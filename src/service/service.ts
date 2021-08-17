import { codeBlock } from "common-tags";
import { Middleware, MiddlewareArgs, MiddlewareNext } from "../middleware";
import { Type, ValueTypedRecord } from "../type";
import { QueryType } from "./query-type";

export type ServiceName = string;
export type ServiceReturns = Type;
export type ServiceArgs = MiddlewareArgs;

interface Options {
  Parent?: any;
  Context?: any;
  Info?: any;
}

export type { Options as ServiceOptions };

export interface Service {
  name: ServiceName;
  returns: ServiceReturns;
  args?: ServiceArgs;
  resolver?: Middleware;
  middlewares: Middleware[];
  docstring?: string;
  type?: QueryType;

  query: () => this;
  mutation: () => this;
  subscription: () => this;
  use: (middleware: Middleware | Middleware[]) => this;
  fn: (
    resolver: Middleware<{
      Parent: PARENT;
      Args: ARGS;
      Context: CONTEXT;
      Info: INFO;
      Returns: RETURNS;
      Next: undefined;
    }>
  ) => this;
}

/**
 * Build Service entrypoint builder with Context for a GraphQL.
 */
export function buildService<
  OPTIONS extends Options = {},
  CONTEXT extends any = OPTIONS["Context"] extends undefined
    ? any
    : NonNullable<OPTIONS["Context"]>,
  INFO extends any = OPTIONS["Info"] extends undefined
    ? any
    : NonNullable<OPTIONS["Info"]>
>() {
  return function <
    // potentially unique
    PARENT extends any = Options["Parent"] extends undefined
      ? undefined
      : NonNullable<Options["Parent"]>,
    // constructor generics
    RETURNS extends ServiceReturns = any,
    ARGS extends ServiceArgs = any
  >(name: ServiceName, returns: RETURNS, args?: ARGS) {
    const self: Service = {
      name: name,
      returns: returns,
      args: args,
      middlewares: [],
    };

    self.query = () => {
      self.type = QueryType.QUERY;
      return self;
    };

    self.mutation = () => {
      self.type = QueryType.MUTATION;
      return self;
    };

    self.subscription = () => {
      self.type = QueryType.SUBSCRIPTION;
      return self;
    };

    self.use = () => {
      self.middlewares.push(
        ...(Array.isArray(middleware) ? middleware : [middleware])
      );
      return self;
    };

    self.fn = (
      resolver: Middleware<{
        Parent: PARENT;
        Args: ARGS;
        Context: CONTEXT;
        Info: INFO;
        Returns: RETURNS;
        Next: undefined;
      }>
    ) => {
      self.resolver = resolver;
      return self;
    };

    self.docs = (docstring: string) => {
      self.docstring = docstring;
      return self;
    };

    self.buildSchemaString = () => {
      const { name, args, returns, docstring } = self;
      return codeBlock`
        ${docstring ? `"""${docstring}"""` : ""}
        ${name}${Type.toSchemaArgsString(args)}: ${returns.toSchemaString()}
      `;
    };

    self.buildExecutionFunction = () => {
      const { middlewares } = self;
      return async (
        parent: PARENT,
        args: ValueTypedRecord<ARGS>,
        context: CONTEXT,
        info: INFO
      ) => {
        const props = { parent, args, context, info };

        let prevIndex = -1;

        const runner = async (index: number): Promise<void> => {
          if (index === prevIndex) {
            throw new Error("next() called multiple times");
          }

          prevIndex = index;

          const middleware = middlewares[index] as Middleware | undefined;

          if (middleware) {
            const next = () => runner(index + 1);
            await middleware(props, next);
          }
        };

        await runner(0);

        return;
      };
    };

    return self;
  };
}

export const Service = buildService();
