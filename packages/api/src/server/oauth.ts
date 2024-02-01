import { ensureHasIdPrefix, isLocalNetwork, log, prisma } from '#lib';
import { generateThirdPartyToken } from '#modules/oauth';
import { ThirdPartyCredentialType } from '@prisma/client';
import { verify } from 'argon2';
import bodyParser from 'body-parser';
import { z } from 'zod';
import { api } from './express.js';

console.info(`Serving OAuth code-token exchange endpoint on /token`);
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
