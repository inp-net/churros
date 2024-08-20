import { setSession } from '$houdini';
import { inferIsMobile } from '$lib/mobile';
import { aled } from '$lib/session';
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const tokenFromAuthorizationHeader = (event.request.headers.get('Authorization') ?? '').replace(
    /^Bearer /,
    '',
  );
  const cookieData = cookie.parse(event.request.headers.get('Cookie') ?? '');
  aled('hooks.server.ts: handle: parsed cookie from tokens', cookieData);
  const { token: tokenFromCookies } = cookieData;

  const token = tokenFromAuthorizationHeader || tokenFromCookies;

  event.locals.mobile = Boolean(inferIsMobile(event.request.headers.get('User-Agent') ?? ''));

  setSession(event, {
    token: event.locals.token,
  });

  const response = await resolve(event);

  // Delete invalid token
  if (token && !event.locals.me) {
    aled('hooks.server.ts: handle: deleting invalid token');
    response.headers.append(
      'Set-Cookie',
      cookie.serialize('token', '', { expires: new Date(0), path: '/', sameSite: 'lax' }),
    );
  }

  return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  const apiUrl = process.env.PUBLIC_API_URL as unknown as string;
  if (request.url.startsWith(apiUrl)) {
    request = new Request(
      request.url.replace(apiUrl, process.env.PRIVATE_API_URL as unknown as string),
      request,
    );
  }

  aled('hooks.server.ts: handleFetch', request);

  return fetch(request)
    .catch((error) => {
      console.error(error);
      throw new TypeError('Impossible de joindre le serveur.');
    })
    .then((response) => {
      return response;
    });
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
