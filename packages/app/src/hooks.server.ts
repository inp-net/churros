import { setSession } from '$houdini';
import type { Handle, HandleFetch, HandleServerError, RequestEvent } from '@sveltejs/kit';
import cookie from 'cookie';

type Token = { token: string };

async function authenticateUser(event: RequestEvent): Promise<Token | undefined> {
  const { token } = cookie.parse(event.request.headers.get('cookie') ?? '');
  console.log(`authenticaing user with token ${token}`);

  if (!token) return undefined; // no token, no user

  return { token };
}

export const handle: Handle = async ({ event, resolve }) => {
  const user = await authenticateUser(event);

  setSession(event, { token: user?.token });

  event.locals.token = user?.token;

  event.locals.mobile = Boolean(
    event.request.headers.get('User-Agent')?.toLowerCase().includes('mobile'),
  );

  return resolve(event);
};

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
  const apiUrl = process.env.PUBLIC_API_URL as unknown as string;
  if (request.url.startsWith(apiUrl)) {
    request = new Request(
      request.url.replace(apiUrl, process.env.PRIVATE_API_URL as unknown as string),
      request,
    );
  }

  return fetch(request).catch(() => {
    throw new TypeError('Impossible de joindre le serveur.');
  });
};

export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
