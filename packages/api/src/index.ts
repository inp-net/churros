import { createServer, GraphQLYogaError } from "@graphql-yoga/node";
import { ForbiddenError } from "@pothos/plugin-scope-auth";
import { useNoBatchedQueries } from "envelop-no-batched-queries";
import { GraphQLError } from "graphql";
import { ZodError } from "zod";
import { context } from "./context.js";
import { schema, writeSchema } from "./schema.js";

process.env.DEBUG = "true";

const server = createServer({
  schema,
  context,
  maskedErrors: {
    formatError: (error, message, isDev) => {
      if (isDev) console.error(error);

      const cause = (error as GraphQLError).originalError;

      if (cause instanceof ZodError) {
        return new GraphQLError("Validation error.", {
          extensions: { code: "VALIDATION_ERROR", errors: cause.format() },
        });
      }

      if (cause instanceof ForbiddenError || cause instanceof GraphQLYogaError)
        return new GraphQLError(cause.message);

      return new GraphQLError(message);
    },
  },
  plugins: [useNoBatchedQueries()],
});

await server.start();

await writeSchema();
