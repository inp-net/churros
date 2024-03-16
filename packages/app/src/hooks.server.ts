import { aled, sessionUserQuery } from '$lib/session';
import { chain } from '$lib/zeus';
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const cookieData = cookie.parse(event.request.headers.get('Cookie') ?? '');
  aled('hooks.server.ts: handle: parsed cookie from tokens', cookieData);
  const { token } = cookieData;
  if (token) {
    try {
      const { me } = await chain(fetch, { token })('query')({
        me: sessionUserQuery(),
      });
      event.locals.token = token;
      event.locals.me = me;
      aled('hooks.server.ts: handle: setting locals on event', event);
    } catch {}
  }

  event.locals.mobile = Boolean(
    event.request.headers.get('User-Agent')?.toLowerCase().includes('mobile'),
  );

  const response = await resolve(event);

  // Delete invalid token
  if (token && !event.locals.me) {
    aled('hooks.server.ts: handle: deleting invalid token');
    response.headers.append(
      'Set-Cookie',
      cookie.serialize('token', '', { expires: new Date(0), path: '/', sameSite: 'strict' }),
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

  return fetch(request).catch(() => {
    throw new TypeError('Impossible de joindre le serveur.');
  });
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
