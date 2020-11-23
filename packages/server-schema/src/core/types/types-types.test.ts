// @ts-nocheck
import test from "tape";

import { Types, Scalar, Complex } from "../graph/field-types";

test("types", (t) => {
  t.test("scalar type", (t) => {
    const scalar = Scalar<string>("Test");

    t.assert(scalar.__is === "scalar", "has __is of scalar");
    t.assert(scalar.array === false, "is not marked an array");
    t.assert(scalar.nullable === true, "is nullable by default");
    t.assert(scalar.name === "Test", "has name correctly set");
    t.assert(scalar.type === undefined, "has type value undefined");

    t.end();
  });

  t.test("complex type", (t) => {
    const complex = Complex("Test");

    t.assert(complex.__is === "complex", "has __is of complex");
    t.assert(complex.array === false, "is not marked an array");
    t.assert(complex.nullable === true, "is nullable by default");
    t.assert(complex.name === "Test", "has name correctly set");
    t.assert(complex.type === undefined, "has type value undefined");

    t.end();
  });

  t.test("array type", (t) => {
    const type = Types.AsArray(Types.ID);

    t.assert(type.__is === "scalar", "has __is of scalar");
    t.assert(type.array === true, "is marked an array");
    t.assert(type.nullable === true, "is nullable by default");
    t.assert(type.name === "ID", "has name correctly set");
    t.assert(type.type === undefined, "has type value undefined");

    t.end();
  });

  t.test("non-nullable type", (t) => {
    const type = Types.NoNull(Types.ID);

    t.assert(type.__is === "scalar", "has __is of scalar");
    t.assert(type.array === false, "is not marked an array");
    t.assert(type.nullable === false, "is non-nullable");
    t.assert(type.name === "ID", "has name correctly set");
    t.assert(type.type === undefined, "has type value undefined");

    t.end();
  });

  t.test("non-nullable array type", (t) => {
    const type = Types.AsArray(Types.NoNull(Types.ID));

    t.assert(type.__is === "scalar", "has __is of scalar");
    t.assert(type.array === true, "is not marked an array");
    t.assert(type.nullable === false, "is non-nullable");
    t.assert(type.name === "ID", "has name correctly set");
    t.assert(type.type === undefined, "has type value undefined");

    t.end();
  });

  t.end();
});
