import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { NotFoundError, PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
import { createFetch } from '@whatwg-node/fetch';
import cors from 'cors';
import { useNoBatchedQueries } from 'envelop-no-batched-queries';
import express from 'express';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { z, ZodError } from 'zod';
import { context } from './context.js';
import { customErrorMap } from './errors.js';
import { schema, writeSchema } from './schema.js';

z.setErrorMap(customErrorMap);

const yoga = createYoga({
  schema,
  context,
  graphiql: {
    defaultQuery:
      'query {\n  homepage {\n    edges {\n      node {\n        title\n        body\n        author {\n          firstName\n          lastName\n        }\n        group {\n          name\n        }\n      }\n    }\n  }\n}',
  },
  fetchAPI: createFetch({
    useNodeFetch: true,
    formDataLimits: { files: 1, fileSize: 10 * 1024 * 1024 },
  }),
  maskedErrors: {
    formatError(error, message, isDev) {
      if (isDev) console.error(error);

      const cause = (error as GraphQLError).originalError;

      // If the error has no cause, return it as is
      if (cause === undefined) return error as GraphQLError;

      if (
        cause instanceof ForbiddenError ||
        cause instanceof NotFoundError ||
        cause instanceof GraphQLError
      )
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
  plugins: [useNoBatchedQueries({ allow: 3 })],
});

const api = express();
api.use(
  // Allow queries from the frontend only
  cors({ origin: process.env.FRONTEND_URL }),
  // Set basic security headers
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
api.use('/graphql', async (req, res) => yoga(req, res));
api.use('/storage', express.static(fileURLToPath(new URL(process.env.STORAGE))));
api.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centraverse API</title>
  <style>body { font-family: system-ui, sans serif; } a { color: #1d4ed8; }</style>
</head>
<body>
  <h1>Centraverse API</h1>
  <p><strong><a href="${new URL(process.env.FRONTEND_URL).toString()}">
    Retourner à l'accueil</a></strong></p>
  <p><a href="/graphql">GraphiQL (pour les développeurs)</a></p>
</body>
</html>`);
});
api.listen(4000);

await writeSchema();
