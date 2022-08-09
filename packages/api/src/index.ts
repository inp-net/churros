import { createServer, GraphQLYogaError } from '@graphql-yoga/node';
import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import { useNoBatchedQueries } from 'envelop-no-batched-queries';
import express from 'express';
import { GraphQLError } from 'graphql';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import { context } from './context.js';
import { schema, writeSchema } from './schema.js';

process.env.DEBUG = 'true';

const yoga = createServer({
  schema,
  context,
  multipart: { files: 1, fileSize: 10 * 1024 * 1024 },
  maskedErrors: {
    formatError(error, message, isDev) {
      if (isDev) console.error(error);

      const cause = (error as GraphQLError).originalError;

      // If the error has no cause, return it as is
      if (cause === undefined) return error as GraphQLError;

      if (cause instanceof ForbiddenError || cause instanceof GraphQLYogaError)
        return new GraphQLError(cause.message);

      if (cause instanceof ZodError) {
        return new GraphQLError('Validation error.', {
          extensions: { code: 'ZOD_ERROR', errors: cause.format() },
        });
      }

      if (cause instanceof PrismaClientKnownRequestError) {
        return new GraphQLError('Database error.', {
          extensions: {
            code: 'PRISMA_ERROR',
            message: cause.message,
            prismaCode: cause.code,
            meta: cause.meta,
          },
        });
      }

      return new GraphQLError(message);
    },
  },
  plugins: [
    useNoBatchedQueries(),
    {
      onExecute() {
        const start = performance.now();
        return {
          onExecuteDone() {
            console.log(
              '⏱️  Execution took \u001B[36;1m%s ms\u001B[0m',
              Number((performance.now() - start).toPrecision(3))
            );
          },
        };
      },
    },
  ],
});

const api = express();
// api.use(helmet());
api.use('/graphql', yoga);
api.use('/storage', express.static(fileURLToPath(new URL(process.env.STORAGE))));
api.listen(4000);

await writeSchema();
