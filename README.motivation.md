# @armix/server-schema

## Motivation

I wanted a solution for generating functional boilerplate from plain models
definitions and their relationships. Some solutions generated CRUD resolvers
based on a GraphQL types schema, while others generated actual stub source code
using database definitions from a target database, but these solutions didn't
fit with the approach that I was aiming for.

I didn't want any code to be generated for me, because once you modify the
generated source code to accomodate custom business logic unique to your
project, it is very difficult to upgrade to new boilerplate source code for new
framework-based updates/improvements/etc.

One solution that I was particularly excited about was
[KeystoneJS](https://www.keystonejs.com/quick-start/) which had a very similar
approach with what I was aiming for. You are able to declare all your models as
plain objects, transform those objects into "List" entities, and Keystone
generates a complete and ready GraphQL API **and** generated a frontend admin
UI.

The one main problems that caused me to look elsewhere was the way Keystone
handled relationships between models as you define in your schema. I eventually
required relationships between my data there were difficult to express using
Keystone's abstraction, particularly when one must add additional column
properties to a joining table to augment the conditions of a join query.

One example of such a relationship that I found somewhat impossible to easily
express was representing a `User` having `friends` with other `Users`. A joining
table `UserAssocs` (User Associations) expressed this relationship using one row
to express the Many to Many join between two `Users` as foreign key properties,
and where the state of the friendship (`pending`|`accepted`|`blocked`) existed
as another column property. Being stuck with expressing a conditional Many to
Many or One to Many relationship with Keystone's automatically generated joining
tables created great friction between myself and the framework.

**I didn't want the framework to complicate what is ultimately a very simple
database query**, particularly when the generated resolver for fetching
`friends` of a `User` would ultimately be very minimal.

So after much research through existing GraphQL schema generator solutions
capable of dealing with my core use-case, I decided to create this package as
not an entire framework, but as a generic utility that can generate any required
schemas for spreading into my root TypeDefs and Resolvers objects for eventual
inclusion into a framework such as [Apollo
Server](https://github.com/apollographql/apollo-server/).

Additionally, I wanted to be able to use the same plain object model to generate
database models for use with packages like [Knex](http://knexjs.org/), among
various others small tweaks and extensions possible with this package.
