import { createServer } from "@graphql-yoga/node";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";
import { context } from "./context.js";
import { schema } from "./schema.js";

process.env.DEBUG = "true";

const server = createServer({ schema, context, maskedErrors: false });

await server.start();

await writeFile(
  new URL("schema.graphql", import.meta.url),
  printSchema(schema)
);
