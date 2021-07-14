// @ts-nocheck

import Knex from "knex";
import { ApolloServer } from "apollo-server";
import { createTestClient } from "apollo-server-testing";

import Graph from "./graph/graph";
import KnexDriver from "./knex/knex";
import { mapGraphs } from "./graph/graph-utils";

const knex = Knex({
  client: "sqlite3",
  connection: ":memory:",
  useNullAsDefault: true,
});

const graph = Graph({
  ...KnexDriver({
    knex,
    queryNameRemap: {
      User: "user",
    },
  }),
});

const GraphUser = graph(User);

describe("Graph Model", () => {
  test("has valid typedefs", () => {});
  test("has all the required resolvers", () => {
    const { resolvers } = GraphUser;
    expect(resolvers.Root);
  });
});

const options = mapGraphs([GraphUser]);
// console.log(options);
const server = new ApolloServer(options);

const client = createTestClient(server);
const { query, mutate } = client;

describe("typeDefs", () => {
  const clean = (source: string) => source.replace(/[\s\n]+/g, " ").trim();

  const tdroot = clean(GraphUser.typeDefs.Root);
  console.log(tdroot);

  test("Root", (t) => {
    expect(
      tdroot.match(/type User {[^}]*([^(]id: ID![^)]).*}/),
      "id field correctly defined"
    );

    expect(
      tdroot.match(
        /type User {[^}]*(friend\(id: ID! aux: String\): User[^!]).*}/
      ),
      "friend field correctly defined with args"
    );

    t.end();
  });

  t.end();
});

describe("resolvers", (t) => {
  t.test("One", async (t) => {
    const response = await query({
      query: `
        {
          User(id: "1") {
            id
            name
          }
        }
      `,
    });
    console.log(response);
    t.end();
  });
  t.end();
});
