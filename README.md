# ✍️ Autograph

#### Easily build quality, type-safe GraphQL TypeDefs and Resolvers for your API.

**Autograph is not an ORM**, but rather a utility to uniformly generate "boilerplate" functionality for Query (for fetching one or many items) and Mutation (for creating, updating, and deleting items) operations. Create Models to represent your data (such as Users or Posts), and define what Fields are to be exposed. Flexibly define custom `get` and `set ` Field as needed. Fields can even represent completely computed from other values and relationships. Models support a range of Hooks allowing for granular query manipulation and reactive updates on creates and updates.

Autograph has out-of-the-box support for anything supported by Knex (Postgres, MySQL, etc.), and be can be extended with [Custom Adapters](#coming-soon) for any other database of your choosing.

**Follow along with "Get Started" to see how easy Autograph can be used for your next project!**



## Get Started

### 1. Install Autograph

```shell
$ yarn add @armix/server-schema
```



### 2. Define your Source

Any type (e.g. User) provided to `Sources` is used to provide type-safety and autocomplete when defining your Fields and custom resolvers.

The Sources you define here should match whatever data shape is returned from your database as queried by rows—not the shape of the GraphQL API schema, which is instead constructed by Autograph's Models and Fields.

```typescript
// autograph.ts

declare module "@armix/server-schema/types/sources" {
  interface Sources {
    User: {
      id: number;
      name: string;
      email: string;
      password: string;
      updated_at: Date;
    }
  }
}
```



### 3. Define your Model

Models are the building blocks of your Autograph solution, where each Field manages the `get` and `set` operations that are eventually composed into Query and Mutation resolvers for Create, Read, Update, and Delete actions.

The `name` of the Model, in this case "User", will be used to lookup from the `Sources` definition to provide type-checking and autocomplete, and falls back to `any` if unable to find a mapping.

The example below just scratches the surface of all possible options that can be used to configure a Field and a Model.

Learn more with the [Model API](#coming-soon) and [Field API](#coming-soon) documentation.

```typescript
// user.ts

import { Model, Types } from "@armix/server-schema";

export const User = new Model("User")
  .field("id", Types.ID.NonNull)

  .field("name", Types.String.NonNull)

  .field("email", Types.String.NonNull, ({ get }) => ({
    get: get((source, context) => {
      // you can define custom behaviours for getters and setters
      if (!context.auth.user.isAdmin && source.id !== context.auth.user.id)
        throw new Error("NOT_AUTHORISED");
      
      // and return anything (as long as it respects the field Type specified)
      return source.email;
    }),
    hooks: {
      // add hooks to various lifecycle events
      "on-update": (source, context) => {
        // to enforce various behaviours
        if (!context.auth.user.isAdmin && source.id !== context.auth.user.id)
        	throw new Error("NOT_AUTHORISED");
        
        // and optionally return data to be committed
        return {
          updated_at: new Date(),
        }
      }
    }
  }})

  .field("password", Types.String.NonNull, ({ set }) => ({
    // disable reading of this field
    get: null,
    
    // only allow admins or the owning user to change this field
    set: set((value, source, context) => {
      if (!context.auth.user.isAdmin && source.id !== context.auth.user.id)
      	throw new Error("NOT_AUTHORISED");
      
      // perform manipulations for the given value
      const passwordHash = bcrypt.hashSync(value);
      
      // and return that instead
      return passwordHash;
    })
  }));
```



### 4. Define your Adapter

An Adapter is a middleware between Autograph's internal Query and Mutation resolvers and an external datasource.

Prepackaged with Autograph is the `KnexAdapter` which exports its own `QueryTransport` type that can be manipulated via the `"on-query-*"` Hooks of a Model, where you can add Context aware filters (in the case of authentication) and any other behaviours you require.

If no `AdapterTransport` is mapped via the `Config` interface, then `"on-query-*"` Hooks' "transport" parameters will be `unknown`.

```shell
$ yarn add knex pg
```

```typescript
// autograph.ts

import { QueryTransport } from "@armix/server-schema/adapters/knex";

declare module "@armix/server-schema/types/config" {
  interface Config {
    AdapterTransport: QueryTransport;
  }
}
```



### 5. Autograph your Models

`Autograph` brings together all your Models (as well as other TypeDefs, Resolvers, wrappers, etc.) combined with your Adapter to produce a single source of `typeDefs` and `resolvers` that can be spread (`...`) directly into a GraphQL execution environment of your choice (e.g. ApolloServer). In this example, the `KnexAdapter` requires an instance of `Knex` to use for constructing and executing database queries. This particular Adapter also supports Transactions via your execution environment's request Context, given via `trx`. Read more about [Autograph Transactions](#coming-soon).

You can also write your own Adapters if the included `KnexAdapter` doesn't support the database you want to use.

```typescript
// build-autograph.ts

import Knex from "knex";
import Autograph from "@armix/server-schema";
import { KnexAdapter } from "@armix/server-schema/adapters/knex"
import { User } from "./user.ts";

function buildAutograph() {
  const knex = Knex({
    client: "pg",
    connection: "postgresql://postgres:password@localhost:5432/postgres",
  });
  return new Autograph({
    models: [User],
    adapter: new KnexAdapter(knex),
  });
}
```



### 6. Create your GraphQL Server

Once you have Autographed your Models, you can feed the result into a framework like ApolloServer.

```shell
$ yarn add apollo-server graphql
```

```typescript
// build-server.ts

import { ApolloServer } from "apollo-server";
import { buildAutograph } from "./build-autograph"

function buildServer() {
  const autograph = buildAutograph();
  
  const apollo = new ApolloServer({
    ...autograph,
  });
  
  return async () => {
    const port = process.env.PORT || 5000;
  	const { url } = await apollo.listen({ port: 5000 });
  	console.log(`🚀 Server ready at ${url}`);
  }
}
```

```typescript
// index.ts

import { buildServer } from "./build-server";

const server = buildServer();
server();
```



### 7. Done!

Now that you have a working ApolloServer, using the output of your Autograph, you can inspect the generated TypeDefs schema via a GraphQL client, such as of that bundled with ApolloServer via http://localhost:5000/.

You now have a painlessly assembled set of read and write Queries and Mutations to interact with. The generated TypeDefs and Resolvers are not  tied down to any particular framework per se, and are simply strings and functions that can be modified, removed, or even wrapped with granularly targeted custom logic.

```
User {
  id: ID!
  name: String!
  email: String!
  password: String!
}
Query {
	User(id: ID!) User!
	UserMany(cursor: String order: String filters: UserFilters limit: Int): UserList!
}
Mutation {
	UserCreate(data: [UserCreateInput!]!): [User!]!
	UserUpdate(data: [UserUpdateInput!]!): [User!]!
	UserDelete(ids: [ID!]!): [ID!]!
}
```



## Why?

- Read [here](./README.motivation.md).



## Roadmap

- Check out [issues](https://github.com/armix-io/armix-server/issues?q=is%3Aopen+is%3Aissue+label%3A%40armix%2Fserver-schema).



## Contributing

### 1. Fork

Create a fork of this repo and git clone it locally.



### 2. Dependencies and development

Navigate to `./packages/server-schema`, and `yarn` install required dependencies.

```shell
$ yarn
```

Once in the project root, you can run these scripts with `yarn`:

- `dev` — starts TypeScript `tsc` (watching `./src`) and `nodemon` (watching`./lib`, executing `yalc push`) to automatically publish changes to local subscribed projects, see [development with yalc](#development-with-yalc).
- `build` — builds typescript `./src` into `./lib`.



#### Development with `yalc`

The `dev` script requires [yalc](https://github.com/whitecolor/yalc) to be [installed globally](https://github.com/whitecolor/yalc#installation).

Once installed you need to run `yalc publish` in this package directory, and then run `yalc add @armix/server-graphql` in your target project to subscribe to future local changes. Back in this package directory, you can automatically build and push changes with `yarn develop`, or manually with `yalc push`.



### 3. Pull requests

Once you are ready to contribute to the project (via completing an issue etc.), open a pull request and we'll test it out and merge it in!



## Maintainers

- Peter Boyer • [Armix](https://armix.io) ([@ptboyer](https://github.com/ptboyer))

