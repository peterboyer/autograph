import express, { Express } from "express";
import { graphqlHTTP } from "express-graphql";
import { Autograph } from "../autograph";
import * as DEFAULTS from "./autograph-express-defaults";

interface Options {
  port?: number;
}

export type { Options as AutographExpressOptions };

export class AutographExpress {
  #autograph: Autograph;
  #express: Express;
  #port: number;

  constructor(autograph: Autograph, options: Options = {}) {
    const { port = DEFAULTS.PORT } = options;

    this.#autograph = autograph;
    this.#express = express();
    this.#port = port;

    const schema = this.#autograph.buildSchema();
    const rootValue = this.#autograph.buildRootValue();

    const app = this.#express;
    app.use(
      "/graphql",
      graphqlHTTP({
        schema,
        rootValue,
        pretty: true,
      })
    );
  }

  listen(): void {
    const port = this.#port;
    this.#express.listen(port, () => {
      console.log(
        `Running a GraphQL API server at http://localhost:${port}/graphql ...`
      );
    });
  }
}
