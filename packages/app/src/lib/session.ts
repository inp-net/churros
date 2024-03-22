import { page } from '$app/stores';
import { load_AppLayout } from '$houdini';
import { redirect, type ServerLoadEvent } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { derived, get } from 'svelte/store';

/** Saves `token` as a cookie. */
export const saveSessionToken = (
  document: { cookie: string },
  {
    token,
    expiresAt,
  }: {
    token: string;
    expiresAt?: Date | null;
  },
) => {
  document.cookie = cookie.serialize('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'strict',
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function aled(...o: unknown[]) {
  // console.log(o);
  // void fetch(`https://churros.inpt.fr/log?message=${encodeURIComponent(JSON.stringify(o))}`);
}

/** Returns a temporary redirect object. */
export const redirectToLogin = (to: string, searchParams: Record<string, string> = {}) =>
  redirect(307, `/login?${new URLSearchParams({ to, ...searchParams }).toString()}`);

export const me = derived(page, ($page) => $page.data.me);

export const getMe = async (event: ServerLoadEvent) => {
  const { AppLayout } = await load_AppLayout({
    event,
    variables: { loggedIn: Boolean(event.cookies.get('token')) },
  });
  return get(AppLayout).data?.me;
};
