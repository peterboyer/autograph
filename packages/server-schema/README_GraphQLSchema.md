fields attributes:

getter:

setter: (trx: any) => (value: any, data: {}) => MergeObject;
setter: (trx: any, id? number) => (value: any, data: {}) => void;

if top function has only 1 argument, `(trx) => ...` then setter is called before
the main item insertion with the database driver i.e. knex adapter. and the
merge object `{...}` is merged with the data object to be passed to the driver
for insertion.

if top function has only 2 arguments, `(trx, id) => ...` then setter is called
after main item insertion to complete side-effects like added relations etc from
values given for the item. it is all transactional, if anything fails the entire
mutation call will fail. The `id` argument is now know after `pre` has allowed the
row to be created, to relationships and foreign keys to refer to it can use `id`.
