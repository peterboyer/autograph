/**
 * Point Type
 *  TODO: write documentation
 */

// TODO: solve this now suppressed error
// @ts-ignore: TS2307
// Cannot find module 'graphql' or its corresponding type declarations.
import graphql from "graphql";
const { GraphQLScalarType, Kind } = graphql;

const PointType = new GraphQLScalarType({
  name: "Point",
  serialize(value: string) {
    if (!value) return null;
    const {
      coordinates: [lng, lat],
    } = JSON.parse(value);
    return `${lat.toString()},${lng.toString()}`;
  },
  parseValue(value: any) {
    // TODO: figure this out
    debugger;
    return value;
  },
  // TODO: proper definitions
  parseLiteral(ast: { kind: any; value: any }) {
    // TODO: figure this out
    debugger;
    switch (ast.kind) {
      case Kind.Int:
        return ast.value;
      default:
        return null;
    }
  },
});

export const mapKnexType = {
  Point: (table: any, key: string) =>
    table.specificType(key, "geometry(point, 4326)"),
};

export const mapKnexTypeSelect = {
  geometry: (key: string, { knex }: { knex: any }) => knex.st.asGeoJSON(key),
};

export const typeDefs = "scalar Point";

export const resolvers = {
  Point: PointType,
};

/**
 * toST(point:{ lat:String, lng:String }) => ...
 * toST(lat:String, lng:String) => ...
 */
// TODO: properly type
export const toST = (st: any) => (...args: any[]) => {
  let lat = null;
  let lng = null;
  if (args.length === 0) return null;
  if (args.length === 1) {
    const [point] = args;
    lat = point.lat;
    lng = point.lng;
  } else {
    const [_lat, _lng] = args;
    lat = _lat;
    lng = _lng;
  }
  return (
    (lat !== undefined &&
      lng !== undefined &&
      st.geomFromText(`Point(${lng} ${lat})`, 4326)) ||
    null
  );
};
