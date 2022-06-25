import { DateTimeResolver } from "graphql-scalars";
import { builder } from "../builder.js";

export const DateTimeScalar = builder.addScalarType(
  "DateTime",
  DateTimeResolver,
  {}
);
