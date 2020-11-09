import Knex from "knex";
import { ApolloServer } from "apollo-server";
import { createTestClient } from 'apollo-server-testing'
import test from "tape";
import { Types as BaseTypes, Complex } from "./types/types-types";
import Parser from "./parser/parser";
import Graph from "./graph/graph";
import KnexDriver from "./knex/knex";
import { mapGraphs } from "./graph/graph-utils";

const clean = (source: string) => source.replace(/[\s\n]+/g, " ").trim();

const DEFAULT_DATABASE_URL =
  "postgresql://postgres:password@localhost:5432/postgres";

const knex = Knex({
  client: "pg",
  connection: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
});

const Types = Object.assign({}, BaseTypes, {
  User: Complex("User"),
});

const parser = Parser();
const graph = Graph({
  ...KnexDriver({
    knex,
    queryNameRemap: {
      User: "user",
    },
  }),
});

export type TUser = {
  id: number;
  name: string | null;
};

export const User = parser<TUser>({
  name: "User",
  fields: {
    id: Types.NoNull(Types.ID),
    friend: {
      type: Types.User,
      resolver: {
        get: ({ args }) =>
          args({
            id: Types.NoNull(Types.ID),
            aux: Types.String,
          })((source, args) => {
            console.log(args.id);
          }),
      },
    },
  },
});

const GraphUser = graph(User);
const options = mapGraphs([GraphUser]);
const server = new ApolloServer(options);

const { query, mutate } = createTestClient(server);

test("typeDefs", (t) => {
  t.test("Root", (t) => {
    const tdroot = clean(GraphUser.typeDefs.Root);
    console.log(tdroot);

    t.assert(
      tdroot.match(/type User {[^}]*([^(]id: ID![^)]).*}/),
      "id field correctly defined"
    );

    t.assert(
      tdroot.match(
        /type User {[^}]*(friend\(id: ID! aux: String\): User[^!]).*}/
      ),
      "friend field correctly defined with args"
    );

    t.end();
  });

  t.end();
});

test("resolvers", (t) => {
  t.test("One", (t) => {
    const { Query } = GraphUser.resolvers;

    Query.
  });
})
