import { context, customErrorMap, inDevelopment } from '#lib';
import { Prisma } from '@churros/db/prisma';
import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { createFetch } from '@whatwg-node/fetch';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import { ZodError, z } from 'zod';
import { schema } from '../schema.js';
import { api } from './express.js';

z.setErrorMap(customErrorMap);

// Don't commit with a value other than 0 pls, use it for testing only
const SIMULATED_RESPONSE_DELAY_TIME_MS = 0;

const yoga = createYoga({
  schema,
  // CORS are handled below, disable Yoga's default CORS settings
  cors: false,
  context,
  graphiql: {
    title: 'Churros API',
    subscriptionsProtocol: 'WS',
    defaultQuery: /* GraphQL */ `
      query {
        homepage {
          edges {
            node {
              title
              body
              author {
                firstName
                lastName
              }
              group {
                name
              }
            }
          }
        }
      }
    `,
  },
  fetchAPI: createFetch({
    useNodeFetch: true,
    formDataLimits: { files: 1, fileSize: 10 * 1024 * 1024 },
  }),
  maskedErrors: {
    maskError(error, message) {
      if (process.env['NODE_ENV'] === 'development') console.error(error);

      const cause = (error as GraphQLError).originalError;

      // These are user errors, no need to take special care of them
      if (cause instanceof Prisma.PrismaClientKnownRequestError && cause.code === 'P2025')
        return new GraphQLError(cause.message, { extensions: { http: { status: 404 } } });

      if (cause instanceof ForbiddenError)
        return new GraphQLError(cause.message, { extensions: { http: { status: 401 } } });

      if (cause instanceof ZodError) {
        return new GraphQLError('Validation error.', {
          extensions: { code: 'ZOD_ERROR', errors: cause.format(), http: { status: 400 } },
        });
      }

      // Below this point are server errors
      if (process.env['NODE_ENV'] !== 'development') console.error(error);

      // If the error has no cause, return it as is
      if (cause === undefined) return error as GraphQLError;

      if (cause instanceof Prisma.PrismaClientKnownRequestError) {
        return new GraphQLError('Database error.', {
          extensions: { code: 'PRISMA_ERROR', prismaCode: cause.code, http: { status: 500 } },
        });
      }

      if (cause instanceof GraphQLError) return cause;
      return new GraphQLError(message, { extensions: { http: { status: 500 } } });
    },
  },
});

console.info(`Serving GraphQL API on /graphql`);
api.use('/graphql', async (req, res) => {
  if (inDevelopment() && SIMULATED_RESPONSE_DELAY_TIME_MS > 0)
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_RESPONSE_DELAY_TIME_MS));

  yoga(req, res);
});

api.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Churros API</title>
  <style>body { font-family: system-ui, sans serif; } a { color: #1d4ed8; }</style>
</head>
<body>
  <h1>Churros API</h1>
  <p><strong><a href="${new URL(process.env.FRONTEND_ORIGIN).toString()}">
    Retourner à l'accueil</a></strong></p>
  <p><a href="/graphql">GraphiQL (pour les développeurs et les curieux)</a></p>
  <p><a href="https://git.inpt.fr/inp-net/churros">Code source</a></p>
</body>
</html>`);
});
