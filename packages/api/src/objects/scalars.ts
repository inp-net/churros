import { GraphQLYogaError } from "@graphql-yoga/node";
import { BuiltinScalarRef } from "@pothos/core";
import { GraphQLError, Kind } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { builder } from "../builder.js";

export const DateTimeScalar = builder.addScalarType(
  "DateTime",
  DateTimeResolver,
  {}
);

export const FileScalar = builder.scalarType("File", {
  serialize() {
    throw new GraphQLYogaError("File cannot be serialized");
  },
});

// Parse GraphQL IDs as numbers
const id = (
  builder.configStore.getInputTypeRef("ID") as BuiltinScalarRef<number, string>
).type;

id.parseValue = (value: unknown) => {
  const coerced = Number(value);
  if (isNaN(coerced) || !isFinite(coerced))
    throw new GraphQLError("Expected ID to be a numeric.");
  return coerced;
};

id.parseLiteral = (node) => {
  if (node.kind !== Kind.INT && node.kind !== Kind.STRING)
    throw new GraphQLError("Expected ID to be a numeric.");
  return id.parseValue(node.value);
};
