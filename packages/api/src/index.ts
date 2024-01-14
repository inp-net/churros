import { ensureHasIdPrefix, prisma } from '#lib';
import { ForbiddenError } from '@pothos/plugin-scope-auth';
import { CredentialType, Prisma, ThirdPartyCredentialType } from '@prisma/client';
import { createFetch } from '@whatwg-node/fetch';
import { verify } from 'argon2';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import helmet from 'helmet';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { ZodError, z } from 'zod';
import { generateThirdPartyToken } from './auth.js';
import { context } from './context.js';
import { customErrorMap } from './errors.js';
import { isLocalNetwork } from './lib/urls.js';
import { log } from './objects/logs.js';
import { schema, writeSchema } from './schema.js';
import { markAsContributor } from './services/ldap.js';
import { lydiaSignature, verifyLydiaTransaction } from './services/lydia.js';
import { generatePDF } from './services/pdf.js';

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
  }),
);

api.use('/graphql', async (req, res) => yoga(req, res));

api.use(
  '/storage',
  // Another layer of protection against malicious uploads
  helmet.contentSecurityPolicy({ directives: { 'script-src': "'none'" } }),
  express.static(fileURLToPath(new URL(process.env.STORAGE))),
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

api.use(bodyParser.urlencoded({ extended: false }));
api.use('/token', async (request, response) => {
  async function error(text: string, code = 401) {
    await log('oauth', 'token/error', { err: text, code });
    return response
      .status(code)
      .send(
        `${text}\n\nSee the documentation of the 'authorize' mutation for more information: <a href="${process.env.FRONTEND_ORIGIN}/graphql">${process.env.FRONTEND_ORIGIN}/graphql</a>`,
      );
  }
  let authorization = request.headers['authorization'];
  let clientId = '',
    clientSecret = '';

  if (authorization) {
    if (typeof authorization !== 'string') authorization = authorization[0];

    [clientId, clientSecret] = Buffer.from(authorization!.replace(/^Basic /, ''), 'base64')
      .toString('utf8')
      .split(':') as [string, string];
  }

  const formData = request.body;

  await log('oauth', 'token', request.body, clientId);

  let authorizationCode, redirectUri: string;
  let client_id, client_secret: string | undefined;

  try {
    ({
      code: authorizationCode,
      redirect_uri: redirectUri,
      client_id,
      client_secret,
    } = await z
      .object({
        code: z.string(),
        grant_type: z.literal('authorization_code'),
        redirect_uri: z.string(),
        client_id: z.string().optional(),
        client_secret: z.string().optional(),
      })
      .parseAsync(formData));
  } catch (error_) {
    return error('Invalid request body: ' + error_?.toString() ?? '');
  }

  if (client_id) clientId = client_id;
  if (client_secret) clientSecret = client_secret;

  if (!clientId || !clientSecret) {
    return error(
      'Missing client_id/client_secret pair. Put in in the Authorization header as "Basic [base64(client_id:client_secret)]" or in the request body as "client_id" and "client_secret"',
    );
  }

  const credential = await prisma.thirdPartyCredential.findFirst({
    where: { value: authorizationCode },
    include: { client: true },
  });
  if (!credential) return error('Invalid access code');
  if (credential.type !== ThirdPartyCredentialType.AuthorizationCode)
    return error('Invalid access code');
  if (credential.expiresAt && credential.expiresAt < new Date())
    return error('Access code expired');
  if (
    credential.client.id !== ensureHasIdPrefix(clientId, 'ThirdPartyApp') ||
    !(await verify(credential.client.secret, clientSecret))
  )
    return error('Invalid client_id/client_secret pair');

  if (!credential.client.active && !isLocalNetwork(redirectUri)) {
    return error(
      `This app is not active yet. Please try again later. Contact ${process.env.PUBLIC_CONTACT_EMAIL} if your app takes more than a week to get activated.`,
    );
  }
  if (!credential.client.allowedRedirectUris.includes(redirectUri))
    return error('Invalid redirect URI');
  await prisma.thirdPartyCredential.deleteMany({ where: { value: authorizationCode } });
  const accessToken = await prisma.thirdPartyCredential.create({
    data: {
      type: ThirdPartyCredentialType.AccessToken,
      value: generateThirdPartyToken(),
      clientId: credential.clientId,
      ownerId: credential.ownerId,
      // Keep the token for 1 year
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    },
  });

  return response.json({
    access_token: accessToken.value,
    token_type: 'bearer',
    // seconds left until token expires
    expires_in: Math.floor(((accessToken.expiresAt ?? new Date()).getTime() - Date.now()) / 1000),
  });
});

api.get('/log', (req, res) => {
  console.info(req.query['message'] ?? '<empty>');
  res.send('ok');
});

api.get('/print-booking/:pseudoID', async (req, res) => {
  const id = `r:${req.params.pseudoID.toLowerCase()}`;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          event: true,
        },
      },
      author: true,
    },
  });

  if (!registration) return res.status(404).send('Not found');

  const pdf = generatePDF(registration);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `filename="${registration.ticket.event.title} - ${registration.ticket.name}.pdf"`,
  );
  pdf.pipe(res);
  pdf.end();

  return res.status(200);
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
  console.info(`Serving static content from ${process.env.STORAGE}`);
  console.info('API ready at http://localhost:4000');
});

await writeSchema();

const webhook = express();
const upload: multer.Multer = multer();

// Lydia webhook
webhook.get('/lydia-webhook/alive', (_, res) => {
  res.sendStatus(200);
});

webhook.post('/lydia-webhook', upload.none(), async (req: Request, res: Response) => {
  // Retrieve the params from the request
  const { request_id, amount, currency, sig, signed, transaction_identifier, vendor_token } =
    req.body as {
      request_id: string;
      amount: string;
      currency: string;
      sig: string;
      signed: string;
      transaction_identifier: string;
      vendor_token: string;
    };

  const signatureParameters = {
    currency,
    request_id,
    amount,
    signed,
    transaction_identifier,
    vendor_token,
  };

  try {
    const { verified, transaction } = await verifyLydiaTransaction(
      request_id,
      signatureParameters,
      sig,
    );

    await prisma.logEntry.create({
      data: {
        action: 'receive',
        area: 'lydia webhook',
        message: JSON.stringify({ verified, transaction }),
        target: transaction_identifier,
      },
    });

    if (!verified) {
      await prisma.logEntry.create({
        data: {
          area: 'lydia webhook',
          action: 'fail',
          message: 'transaction signature invalid',
          target: transaction_identifier,
        },
      });
      return res.status(400).send('Transaction signature is invalid');
    }

    if (!transaction) {
      await prisma.logEntry.create({
        data: {
          area: 'lydia webhook',
          action: 'fail',
          message: 'transaction not found',
          target: transaction_identifier,
        },
      });
      return res.status(400).send('Transaction not found');
    }

    // Check if the beneficiary exists
    if (transaction.registration) {
      if (!transaction.registration.ticket.event.beneficiary) {
        await prisma.logEntry.create({
          data: {
            area: 'lydia webhook',
            action: 'fail',
            message: 'beneficiary not found',
            target: transaction_identifier,
          },
        });
        return res.status(400).send('Beneficiary not found');
      }

      if (
        sig ===
        lydiaSignature(transaction.registration.ticket.event.beneficiary, signatureParameters)
      ) {
        await prisma.logEntry.create({
          data: {
            area: 'lydia webhook',
            action: 'success',
            message: `booking transaction marked as paid`,
            target: transaction_identifier,
          },
        });
        await prisma.lydiaTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            transactionId: transaction_identifier,
            registration: {
              update: {
                paid: true,
              },
            },
          },
        });
        return res.status(200).send('OK');
      }
    } else if (transaction.contribution) {
      const { beneficiary } = transaction.contribution.option;
      if (!beneficiary) {
        await prisma.logEntry.create({
          data: {
            area: 'lydia webhook',
            action: 'fail',
            message: 'no lydia account linked',
          },
        });
        return res.status(400).send('No lydia accounts for this student association');
      }

      if (sig === lydiaSignature(beneficiary, signatureParameters)) {
        await prisma.contribution.update({
          where: {
            id: transaction.contribution.id,
          },
          data: {
            paid: true,
          },
        });

        try {
          await markAsContributor(transaction.contribution.user.uid);
        } catch (error: unknown) {
          await log(
            'ldap-sync',
            'mark as contributor',
            { err: error },
            transaction.contribution.user.uid,
          );
        }

        await prisma.logEntry.create({
          data: {
            area: 'lydia webhook',
            action: 'success',
            message: `contribution transaction marked as paid: ${JSON.stringify(
              { beneficiary },
              undefined,
              2,
            )}`,
            target: transaction_identifier,
          },
        });
        return res.status(200).send('OK');
      }
    }

    return res.status(400).send('Bad request');
  } catch {
    return res.status(400).send('Bad request');
  }
});

webhook.listen(4001, () => {
  console.info('Webhook ready at http://localhost:4001');
});

const maintenance = express();

maintenance.get('/', (_, res) => {
  console.info(`Hit maintenance page`);
  res.send(`<h1>Maintenance en cours</h1><p>On revient dès que possible!</p>`);
});

maintenance.get('/*', (_, res) => {
  res.redirect('/');
});

maintenance.listen(4002, () => {
  console.info('Maintenance page server listening at http://localhost:4002');
});
