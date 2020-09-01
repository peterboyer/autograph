# @armix/server-schema

#### `model` → `adapter` → `schema`

Quickly generate extensible schemas for your backend, with first-class support
for [GraphQL](https://graphql.org/) and [Knex](http://knexjs.org/); generate
reusable TypeDefs and Resolvers to use with packages like [Apollo
Server](https://github.com/apollographql/apollo-server/), and concise
table-building functions for Knex-supported databases!

## Usage

### Define your models

```ts
const User = {
  name: "User",
  fields: {
    name: {
      type: "String",
      nullable: false,
    },
  },
};
```

### Import your adapters

- Use our core adapters like [**SchemaGraphQL**](#schemagraphql) or
  [**SchemaKnex**](#schemaknex),
- Or even [create your own](#adapters)!

```ts
import { SchemaGraphQL } from "@armix/server-schema";

const graphql = SchemaGraphQL({ ... });
```

### Generate your schemas

```ts
import SchemaManager from "@armix/server-schema";

const schemas = SchemaManager([User], { graphql });
```

### Explore your schemas

```ts
const { User } = schemas;

> User.graphql.typeDefs.Root /*
type User { name: String! }
input UserInput { name: String }
input UserInputID { id: ID! name: String } */

> User.graphql.typeDefs.Query /*
User(id: ID!): User!
User_many(query: String): [User!]! */

> User.graphql.typeDefs.Mutation /*
User_create(data: [UserInput!]!): [User!]!
User_update(data: [UserInputID!]!): [User!]!
User_delete(ids: [ID!]!): [ID!]! */

> User.graphql.resolvers /*
{
  Root: {
    User: {
      name: [AsyncFunction: resolver],
    }
  },
  Query: {
    User: [AsyncFunction: resolverQuery],
    User_many: [AsyncFunction: resolverQueryMany]
  },
  Mutation: {
    User_create: [AsyncFunction: resolverMutationCreate],
    User_update: [AsyncFunction: resolverMutationUpdate],
    User_delete: [AsyncFunction: resolverMutationDelete]
  }
} */
```

### Wrangle your schemas

- Use built-in helpers to wrangle all your schemas.

```ts
import { mergeTypeDefs, mergeResolvers } from "@armix/server-schema";

const schemas = [User, Post, Comment];
const allTypeDefs = schemas.map((schema) => schema.graphql.typeDefs);
const allResolvers = schemas.map((schema) => schema.graphql.resolvers);

const typeDefs = gql`
  ${mergeTypeDefs(allTypeDefs)}
  type Query {
    Foo: String!;
    ${mergeTypeDefs(allTypeDefs, "Query")}
  }
  type Mutation {
    Faa: String!;
    ${mergeTypeDefs(allTypeDefs, "Mutation")}
  }
`;

const resolvers = {
  ...mergeResolvers(allResolvers),
  Query: {
    Foo: (...) => "Bar",
    ...mergeResolvers(allResolvers, "Query"),
  },
  Mutation: {
    Faa: (...) => "Bor",
    ...mergeResolvers(allResolvers, "Mutation"),
  },
}
```

### Use your schemas

- Use with other packages like [Apollo
  Server](https://github.com/apollographql/apollo-server/) and enjoy!

```ts
import { ApolloServer } from "apollo-server";

const apollo = new ApolloServer({ typeDefs, resolvers });
apollo.listen();
```

## Motivation?

- Read [here](./README.motivation.md).

## Development

First clone this project to your machine:

```bash
$ git clone git@github.com:armix-io/armix-server.git
```

Once in the project root, you can run these scripts with `yarn`:

- `build` — builds typescript `./src` into `./lib`
- `develop` — starts typescript `tsc` (watching `./src`) and `nodemon` (watching
  `./lib`, executing `yalc push`) to automatically publish changes to local
  subscribed projects, see [development with yalc](#development-with-yalc).

### Development with yalc

The `develop` script requires [yalc](https://github.com/whitecolor/yalc) to be
[installed globally](https://github.com/whitecolor/yalc#installation).

Once installed you need to run `yalc publish` in this package directory, and
then run `yalc add @armix/server-graphql` in your target project to subscribe to
future local changes. Back in this package directory, you can automatically
build and push changes with `yarn develop`, or manually with `yalc push`.

## Maintainers

- Peter Boyer • [Armix](https://armix.io)
  ([@ptboyer](https://github.com/ptboyer))
