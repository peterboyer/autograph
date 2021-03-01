# ✍️ Autograph

#### Easily generate TypeDefs and Resolvers for your GraphQL API.

**Autograph is a utility to easily generate CRUD (Query and Mutation) functionality for your GraphQL API.** It is not an ORM, but rather a framework for easily abstracting away the boring task of writing one/many/create/update/delete Resolvers and TypeDefs. It has out-of-the-box support for any database supported by Knex (Postgres, MySQL, etc.), and be can be extended with [Custom Adapters](#coming-soon) for any other database of your choosing.

Start by defining your API's Models to represent your data (such as Users or Posts), and define what Fields (and their Types) are to be exposed. You can customise any `get` or`set` for any Field as needed, as they may even represent completely computed from other values and relationships.

Models support a range of hooks allowing for granular query manipulation and reactive updates on creates and updates, validation, and authorisation.

## Get Started!

**Follow along to see how easy Autograph can be used for your next project!**

- Start [here](./docs/get-started.md)!

## Why?

- Read [here](./docs/why.md).

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
