export const QUERY_ONE = (name: string) =>
  `# Accepts an \`id\` to return it's corresponding \`${name}\`. Throws if not found.`;
export const QUERY_MANY = (
  name: string,
  limitDefault: number,
  limitMax: number
) =>
  `# Accepts a combination of one or many options to paginate through many \`${name}\` items. - \`cursor\`, used from a previous request to the get page of items. If specified, all other arguments are ignored. - \`order\`, used to order items (e.g. "fieldA:asc", "fieldB:desc") - \`filters\`, a map of filters and their values used to conditionally filter items. See \`${name}ManyFilters\` for available filters and value types. - \`limit\`, specify how many items per page (default: \`${limitDefault}\`, max: \`${limitMax}\`) Returns \`${name}ManyResult\` with a \`cursor\` value (to be used in a subsequent request to fetch the next page of items, \`null\` if no more items), \`total\` (to denote how many items exist), and \`items\` of \`${name}\`.`;
export const MUTATION_CREATE = (name: string) =>
  `# Accepts \`data\` as an array of \`${name}Create\` to persist, and returns those new items.`;
export const MUTATION_UPDATE = (name: string) =>
  `# Accepts \`data\` as an array of \`${name}Update\` to update items by the given \`{ id }\` field, and returns those updated items.`;
export const MUTATION_DELETE = () =>
  `# Accepts \`ids\` as an array of \`ID\`s and returns those \`ID\`s after deletion.`;
