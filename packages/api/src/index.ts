import { createServer } from "@graphql-yoga/node";
import { context } from "./context.js";
import { schema, writeSchema } from "./schema.js";

process.env.DEBUG = "true";

const server = createServer({ schema, context, maskedErrors: false });

await server.start();

await writeSchema();
