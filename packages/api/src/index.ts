import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { CredentialType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { createFetch } from '@whatwg-node/fetch';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { z, ZodError } from 'zod';
import { context } from './context.js';
import { customErrorMap } from './errors.js';
import { prisma } from './prisma.js';
import { schema, writeSchema } from './schema.js';

z.setErrorMap(customErrorMap);

const yoga = createYoga({
  schema,
  // CORS are handled below, disable Yoga's default CORS settings
  cors: false,
  context,
  graphiql: {
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
      if (cause instanceof Prisma.NotFoundError)
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

const api = express();
api.use(
  // Allow queries from the frontend only
  // cors({ origin: ['http://192.168.*', process.env.FRONTEND_ORIGIN, 'http://app'] }),
  cors(),
  // Set basic security headers
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
api.use('/graphql', async (req, res) => yoga(req, res));
api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(fileURLToPath(new URL(process.env.STORAGE)))
);

// Poor man's GDPR data download
api.use('/dump', async (req, res) => {
  const token = String(req.query['token']);
  try {
    const credential = await prisma.credential.findFirstOrThrow({
      where: { type: CredentialType.Token, value: token },
      include: {
        user: {
          include: { groups: true, articles: true, links: true },
        },
      },
    });
    res.json({ _: `Downloaded on ${new Date().toISOString()}`, ...credential.user });
  } catch {
    res
      .status(401)
      .send('<h1>401 Unauthorized</h1><p>Usage: <code>/dump?token=[session token]</code></p>');
  }
});
api.get('/log', (req, res) => {
  console.info(req.query['message'] ?? '<empty>');
  res.send('ok');
});

api.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centraverse API</title>
  <style>body { font-family: system-ui, sans serif; } a { color: #1d4ed8; }</style>
</head>
<body>
  <h1>Centraverse API</h1>
  <p><strong><a href="${new URL(process.env.FRONTEND_ORIGIN).toString()}">
    Retourner à l'accueil</a></strong></p>
  <p><a href="/graphql">GraphiQL (pour les développeurs et les curieux)</a></p>
  <p><a href="https://git.inpt.fr/inp-net/centraverse">Code source</a></p>
</body>
</html>`);
});
api.listen(4000, () => {
  console.info('API ready at http://localhost:4000');
});

await writeSchema();

import { lydiaSignature } from './services/lydia.js';

const webhook = express();
const upload: multer.Multer = multer();

// Lydia webhook
webhook.post('/lydia-webhook', upload.none(), async (req: Request, res: Response) => {
  // Retrieve the params from the request
  const {
    request_id,
    amount,
    currency,
    sig,
    signed,
    transaction_identifier,
    vendor_token,
  }: {
    request_id: string;
    amount: string;
    currency: string;
    sig: string;
    signed: string;
    transaction_identifier: string;
    vendor_token: string;
  } = req.body as {
    request_id: string;
    amount: string;
    currency: string;
    sig: string;
    signed: string;
    transaction_identifier: string;
    vendor_token: string;
  };

  try {
    // Get the lydia transaction from it's requestId
    const transaction = await prisma.lydiaTransaction.findFirst({
      where: {
        requestId: request_id,
      },
      include: {
        registration: {
          include: {
            ticket: {
              include: {
                event: {
                  include: {
                    beneficiary: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!transaction) return res.status(400).send('Transaction not found');

    const sigParams = {
      currency,
      request_id,
      amount,
      signed,
      transaction_identifier,
      vendor_token,
    };

    // Check if the beneficiary exists
    if (!transaction.registration.ticket.event.beneficiary)
      return res.status(400).send('Beneficiary not found');

    if (sig === lydiaSignature(transaction.registration.ticket.event.beneficiary, sigParams)) {
      await prisma.registration.update({
        where: {
          id: transaction.registrationId,
        },
        data: {
          paid: true,
        },
      });
      return res.status(200).send('OK');
    }
  } catch {
    return res.status(500).send('Internal server error');
  }

  return res.status(400).send('Bad request');
});

webhook.listen(4001, () => {
  console.info('Webhook ready at http://localhost:4001');
});
