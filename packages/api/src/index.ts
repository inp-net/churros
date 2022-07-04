import { createServer } from "@graphql-yoga/node";
import { useNoBatchedQueries } from "envelop-no-batched-queries";
import { context } from "./context.js";
import { schema, writeSchema } from "./schema.js";

process.env.DEBUG = "true";

const server = createServer({
  schema,
  context,
  maskedErrors: false,
  plugins: [useNoBatchedQueries()],
});

await server.start();

await writeSchema();
