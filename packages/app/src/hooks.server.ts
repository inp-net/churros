import { env } from '$env/dynamic/private';
import { sessionUserQuery } from '$lib/session';
import { chain } from '$lib/zeus';
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit';
import * as cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
  const { token } = cookie.parse(event.request.headers.get('Cookie') ?? '');
  if (token) {
    try {
      const { me } = await chain(fetch, { token })('query')({
        me: sessionUserQuery(),
      });
      event.locals.token = token;
      event.locals.me = me;
    } catch {}
  }

  event.locals.mobile = Boolean(
    event.request.headers.get('User-Agent')?.toLowerCase().includes('mobile')
  );

  const response = await resolve(event);

  // Delete invalid token
  if (token && !event.locals.me) {
    response.headers.append(
      'Set-Cookie',
      cookie.serialize('token', '', { expires: new Date(0), path: '/', sameSite: 'strict' })
    );
  }

  return response;
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!env.PUBLIC_API_URL) throw new Error('PUBLIC_API_URL is not set.');
  if (!env.PRIVATE_API_URL) throw new Error('PRIVATE_API_URL is not set.');
  // NIKE TA MERE TYPESCRIPT. NIKE TA MERE. SOIT C4EST string|undefined ET DONC as string EST UTILE, SOIT C PAS STRING|UNDEFINED MAIS STRING. FAUT ****SAVOIR***** BORDEL DE MERDE!
   
  const apiUrl = env.PUBLIC_API_URL as string;
  if (request.url.startsWith(apiUrl)) {
    request = new Request(
      // je vais t'exploser la gueule.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      request.url.replace(apiUrl, env.PRIVATE_API_URL as string),
      request
    );
  }

  return fetch(request).catch(() => {
    throw new TypeError('Impossible de joindre le serveur.');
  });
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
