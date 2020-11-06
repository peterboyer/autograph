import Parser from "./graph-source-parser";
import { types } from "./schema-graph-types";

const parser = Parser();

const tree = parser({
  fields: {
    id: {
      type: types.ID,
    },
  },
});

console.log(tree);
