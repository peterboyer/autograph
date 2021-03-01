# Hooks

| Hooks       | Query One | Query Many | Mutation Create | Mutation Update | Mutation Delete | Field Get | Field Set |
| ----------- | ---- | ---- | ------ | ------ | ------ | ------ | ------ |
| onQuery     | ✅ (if no `onQueryOne`) | ✅ (if no `onQueryMany`) |        |        |        |        |        |
| onQueryOne  | ✅ |      |        |        |        |        |        |
| onQueryMany |      | ✅ |        |        |        |        |        |
|onCreate|      |      | ✅ |        |        |        |        |
|onCreateAfterData|      |      | ✅ |        |        |        |        |
|onUpdate|      |      |        | ✅ |        |        |        |
|onUpdateAfterData|      |      |        | ✅ |        |        |        |
|onDelete|      |      |        |        | ✅ |  |  |
|onDeleteAfterData|      |      |        |        | ✅ |  |  |
|onMutation|      |      | ✅ | ✅ | ✅ |  |  |
|onMutationAfterData|      |      | ✅ | ✅ | ✅ |  |  |
|onGet| ✳️ (per field on root resolver) | ✳️ (per field on root resolver) |  |        |        | ✅ |        |
|onSet|      |      | ✳️ (per field) | ✳️ (per field) |        |        | ✅ |
|onUse| ✳️ (per field on root resolver) | ✳️ (per field on root resolver) | ✳️ (per field) | ✳️ (per field) |        | ✅ | ✅ |

## Execution Order

### Root

- (per field) onModelGet
- (per field) onModelUse
- (per field) onGet
- (per field) onUse

### Query One/Many

- onQueryOne/Many or onQuery or skip

### Mutation Create/Update

- (per field) onModelSet
- (per field) onModelUse
- (per field) onSet
- (per field) onUse
- (per field) setCreate/Update or set (fallback)
- onCreate
- onMutation
- (per field) onModelCreate/Update
- (per field) onModelMutation
- (per field) setCreate/UpdateAfterData or setAfterData or skip (default)
- onCreate/UpdateAfterData
- onMutationAfterData
- (per field) onCreate/UpdateAfterData
- (per field) onMutationAfterData

### Mutation Delete

- onDelete
- onMutation
- (per field) onModelDelete
- (per field) onModelMutation
- onDeleteAfterData
- onMutationAfterData
- (per field) onDeleteAfterData
- (per field) onMutationAfterData