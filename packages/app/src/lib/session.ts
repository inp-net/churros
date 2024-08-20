import { graphql, type SessionToken$data } from '$houdini';
import { redirect, type Cookies } from '@sveltejs/kit';

graphql(`
  fragment SessionToken on Credential {
    token
    expiresAt
  }
`);

/** Saves `token` as a cookie. */
export const saveSessionToken = (cookies: Cookies, { token, expiresAt }: SessionToken$data) => {
  cookies.set('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'lax',
  });
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
