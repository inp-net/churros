import type { UserSession$result } from '$houdini';
import { UserSessionStore, setSession } from '$houdini';
import type { Handle, HandleFetch, HandleServerError, RequestEvent } from '@sveltejs/kit';
import cookie from 'cookie';

type User = UserSession$result & { token: string };

async function autheticateUser(event: RequestEvent): Promise<User | undefined> {
  const { token } = cookie.parse(event.request.headers.get('cookie') ?? '');

  if (!token) return undefined; // no token, no user

  // temporarily set the token will be overwritten by result of query
  setSession(event, { me: undefined, token });

  // fetch the user
  const UserSessionQuery = new UserSessionStore();
  const { data } = await UserSessionQuery.fetch({ event });

  return data?.me ? { ...data, token } : undefined;
}

export const handle: Handle = async ({ event, resolve }) => {
  const user = await autheticateUser(event);

  setSession(event, { me: user?.me, token: user?.token });

  event.locals.me = user?.me;
  event.locals.token = user?.token;

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
