import { graphql, type SessionToken$data } from '$houdini';
import { redirect, type Cookies } from '@sveltejs/kit';
import * as cookie from 'cookie';


graphql(`
  fragment SessionToken on Credential {
    token
    expiresAt
  }
`);

/** Saves `token` as a cookie. */
export const saveSessionToken = (
  document: { cookie: string } | { cookies: Cookies },
  { token, expiresAt }: SessionToken$data,
) => {
  const options = {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'lax',
  } as const;
  if ('cookie' in document) document.cookie = cookie.serialize('token', token, options);
  else document.cookies.set('token', token, options);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function aled(...o: unknown[]) {
  // console.log(o);
  // void fetch(`https://churros.inpt.fr/log?message=${encodeURIComponent(JSON.stringify(o))}`);
}

/** Returns a temporary redirect object. */
export const redirectToLogin = (
  to: string,
  searchParams: URLSearchParams | Record<string, string> = {},
) => {
  if (searchParams instanceof URLSearchParams)
    searchParams = Object.fromEntries(searchParams.entries());
  redirect(
    307,
    `/login?${new URLSearchParams({ from: to, why: 'unauthorized', ...searchParams }).toString()}`,
  );
};
