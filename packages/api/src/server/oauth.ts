import { ensureGlobalId, generateThirdPartyToken, isLocalNetwork, log, prisma } from '#lib';
import { OAuth2ErrorCode, normalizeUrl } from '#modules/oauth';
import { ThirdPartyCredentialType } from '@churros/db/prisma';
import { verify } from 'argon2';
import bodyParser from 'body-parser';
import { z } from 'zod';
import { api } from './express.js';

console.info(`Serving OAuth code-token exchange endpoint on /token`);
api.use(bodyParser.urlencoded({ extended: false }));
api.use('/token', async (request, response) => {
  async function error(
    text: string,
    {
      clientId,
      authorizationCode,
      ...otherData
    }: {
      clientId: string;
      authorizationCode: string | undefined;
      [otherData: string]: unknown;
    },
  ) {
    await log(
      'oauth',
      'token/error',
      { err: text, authorizationCode: authorizationCode, ...otherData },
      ensureGlobalId(clientId, 'ThirdPartyApp'),
    );
    return response.status(401).send(
      JSON.stringify({
        code: OAuth2ErrorCode.invalid_request,
        message: `${text}\n\nSee the documentation of the 'authorize' mutation for more information: <a href="${process.env.FRONTEND_ORIGIN}/graphql">${process.env.FRONTEND_ORIGIN}/graphql</a>`,
      }),
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
    return error('Invalid request body: ' + error_?.toString() ?? '', {
      clientId: client_id || clientId,
      authorizationCode,
      formData,
    });
  }

  if (client_id) clientId = client_id;
  if (client_secret) clientSecret = client_secret;

  await log('oauth', 'token/request', request.body, ensureGlobalId(clientId, 'ThirdPartyApp'));

  if (!clientId || !clientSecret) {
    return error(
      'Missing client_id/client_secret pair. Put in in the Authorization header as "Basic [base64(client_id:client_secret)]" or in the request body as "client_id" and "client_secret"',
      {
        clientId,
        authorizationCode,
        formData,
      },
    );
  }

  const credential = await prisma.thirdPartyCredential.findFirst({
    where: { value: authorizationCode },
    include: { client: true },
  });
  if (!credential) return error('Invalid access code', { clientId, authorizationCode, formData });
  if (credential.type !== ThirdPartyCredentialType.AuthorizationCode)
    return error('Invalid access code', { clientId, authorizationCode, formData });
  if (credential.expiresAt && credential.expiresAt < new Date())
    return error('Access code expired', { clientId, authorizationCode, formData });
  if (
    credential.client.id !== ensureGlobalId(clientId, 'ThirdPartyApp') ||
    !(await verify(credential.client.secret, clientSecret))
  )
    return error('Invalid client_id/client_secret pair', { clientId, authorizationCode, formData });

  if (!credential.client.active && !isLocalNetwork(redirectUri)) {
    return error(
      `This app is not active yet. Please try again later. Contact ${process.env.PUBLIC_CONTACT_EMAIL} if your app takes more than a week to get activated.`,
      {
        clientId,
        authorizationCode,
        formData,
      },
    );
  }
  if (
    !credential.client.allowedRedirectUris.some(
      (uri) => normalizeUrl(uri) === normalizeUrl(redirectUri),
    )
  )
    return error('Invalid redirect URI', { clientId, authorizationCode, formData });
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

  const token = {
    access_token: accessToken.value,
    token_type: 'bearer',
    // seconds left until token expires
    expires_in: Math.floor(((accessToken.expiresAt ?? new Date()).getTime() - Date.now()) / 1000),
  };

  await log(
    'oauth',
    'token/ok',
    { ...token, code: authorizationCode },
    ensureGlobalId(clientId, 'ThirdPartyApp'),
  );

  return response.json(token);
});
