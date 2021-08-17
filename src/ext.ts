import { GraphQLOutputType } from "graphql/type";

export const Object = () => {

}

interface Type {

}

interface ModelProps {
  [key: string]:
}

interface ModelType {}



export class Model<NAME extends string, PROPS extends {}> {
  name: NAME;
  props: PROPS;

  constructor (name: NAME, props: PROPS) {
    this.name = name;
    this.props = props;
  }

  toRootSchemas() {
    return {[this.name]: {} } as Record<NAME, Record<keyof PROPS & string, GraphQLOutputType>>;
  }
  toQuerySchemas() { return {[`get${this.name}`]} }
  toMutationSchemas() { return {} }

  toRootResolvers() {
    return {[this.name]: undefined } as Record<NAME, any>;
  }
  toQueryResolvers() { return {} }
  toMutationResolvers() { return {} }
}

const User = new Model("User", {
  friends: () => User
});

const schema = {
  ...User.toRootSchemas(),
  Query: {
    ...User.toQuerySchemas(),
  },
  Mutation: {
    ...User.toMutationSchemas(),
  }
}

const rootResolver = {
  ...User.toRootResolvers(),
  Query: {
    ...User.toQueryResolvers(),
  },
  Mutation: {
    ...User.toMutationResolvers(),
  }
}
