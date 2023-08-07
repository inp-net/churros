import { page } from '$app/stores';
import { redirect } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { derived } from 'svelte/store';
import { Selector, type PropsType } from './zeus';

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Selector('User')({
    id: true,
    uid: true,
    firstName: true,
    pictureFile: true,
    lastName: true,
    fullName: true,
    admin: true,
    canEditGroups: true,
    canEditUsers: true,
    yearTier: true,
    groups: {
      group: { uid: true, id: true, name: true, pictureFile: true, pictureFileDark: true },
      title: true,
      president: true,
      secretary: true,
      vicePresident: true,
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
    },
    managedEvents: {
      event: { uid: true, id: true, group: { uid: true } },
      canEdit: true,
      canEditPermissions: true,
      canVerifyRegistrations: true,
    },
    major: {
      id: true,
      name: true,
      shortName: true,
      schools: { id: true, name: true, uid: true, color: true },
    },
  });

export type SessionUser = PropsType<typeof sessionUserQuery, 'User'>;

/** Saves `token` as a cookie. */
export const saveSessionToken = (
  document: { cookie: string },
  {
    token,
    expiresAt,
  }: {
    token: string;
    expiresAt?: Date | null;
  }
) => {
  document.cookie = cookie.serialize('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'strict',
  });
};

/** Returns a temporary redirect object. */
export const redirectToLogin = (to: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  redirect(307, `/login?${new URLSearchParams({ to }).toString()}`);

export const me = derived(page, ($page) => $page.data.me);
