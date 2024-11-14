import { graphql, type SessionToken$data } from '$houdini';
import { Capacitor, CapacitorCookies } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { redirect, type Cookies } from '@sveltejs/kit';

graphql(`
  fragment SessionToken on Credential {
    token
    expiresAt
  }
`);

/** Saves `token` as a cookie. */
export async function saveSessionToken(
  cookies: Cookies | null,
  { token, expiresAt }: SessionToken$data,
) {
  const expiration = expiresAt
    ? new Date(expiresAt)
    : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

  if (cookies) {
    cookies.set('token', token, {
      expires: expiration,
      path: '/',
      sameSite: 'lax',
    });
  } else if (Capacitor.getPlatform() !== 'web') {
    // TODO handle expiration date?
    // the app should handle invalid tokens anyways, so not sure if this is actually needed
    await Preferences.set({
      key: 'token',
      value: token,
    });
    // Sync to cookies so that houdini client can use it immediately
    await CapacitorCookies.setCookie({
      key: 'token',
      value: token,
      expires: expiration.toISOString(),
      path: '/',
    });
  }
}

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
