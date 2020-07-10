# @armix/server-graphql

Functions to help with graphql/knex backend projects.

# Development

1. `yarn` to install depedencies.

2. Refer to [Scripts](#Scripts) below.

# Scripts

## `debug` (`yarn debug`)

1. Requires globally installed [yalc](https://www.npmjs.com/package/yalc).

2. Install into target project/package with `yalc add @armix/server-graphql`.

## `docs` (`yarn docs`)

1. Generates jsdocs into `./docs/`.

# Motivation

I was looking around for a solution that could generate working boilerplate
functionality from a simple source definition of my models and the relationships
that they expressed between each other.

Some solutions offered to generate an CRUD for graphql type definitions, or
others attempted to simply generate actual source files from database
definitions from a target database. But these solutions didn't meet the style
that I wanted to work towards.

I didn't want code to be generated for me, because once that source code is
actually modified to accomodate custom business logic unique to the
implementation of the project that you're creating, it is very difficult to
upgrade resolvers or change the boilerplate to be more abstracted or whatnot.

One solution that I was particularly excited with was KeyStone.JS, which had a
very compatible approach with the ideal environment that I wanted. You were able
to declare all your models as a schema, and then create a GraphQL API and an
accompanying admin UI.

The one main problem that caused me to walk away from KeyStone.JS was the way
it handled relationships between models that you defined in your schema. Later
on I would discover other things that I would require from my database at a
query level that I simply couldn't build with KeyStone.JS's abstraction.

One relationship that I found somewhat impossible to express with KeyStone.JS
was that of unique properties on a joining table. In the example of wanting to
represent a User having Friends, which were other Users. The concept of
a Friend as represented in the database as a Many to Many relationship required
many intrinsic properties such as the needing to have one only row represent a
friendship, which had a state, which determined whether or not the friend was
accepted or pending to show up in join as a condition, created friction between
myself and the framework.

I didn't want the framework to complicate what is ultimately a very simple
database query, particularly when the generated resolver for fetching "friends"
of a User would also be very minimal.

So after much research through various GraphQL schema generators, that was able
address my desire to generate database models from it, as well as a fully
generated set of CRUD resolvers for the entities that I define, I decided to
create this library as not an entire framework, but as a utility that can
generate the required pieces that I can spread into my typedefs and resolver
objects to then eventually include into my GraphQL http server with Apollo
Server.

I've also designed a way to add declaritively:

* custom database types
* custom knex selector args for custom columns (e.g. PostGis Geometry)
* custom graphql type remappings (if required)
* error exception agnostic through provided values via resolver context
