import { page } from '$app/stores';
import { graphql, type SessionToken$data } from '$houdini';
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
    phone: true,
    lastName: true,
    fullName: true,
    admin: true,
    external: true,
    canEditGroups: true,
    canAccessDocuments: true,
    studentAssociationAdmin: true,
    yearTier: true,
    apprentice: true,
    graduationYear: true,
    latestVersionSeenInChangelog: true,
    groups: {
      group: { uid: true, id: true, name: true, pictureFile: true, pictureFileDark: true },
      title: true,
      president: true,
      secretary: true,
      vicePresident: true,
      treasurer: true,
      canEditArticles: true,
      canEditMembers: true,
      isDeveloper: true,
    },
    managedEvents: {
      event: { uid: true, id: true, group: { uid: true } },
      canEdit: true,
      canEditPermissions: true,
      canVerifyRegistrations: true,
    },
    major: {
      id: true,
      uid: true,
      name: true,
      shortName: true,
      schools: { id: true, name: true, uid: true, color: true },
    },
    minor: {
      uid: true,
      name: true,
    },
    contributesTo: {
      id: true,
      school: {
        uid: true,
      },
    },
  });

export type SessionUser = PropsType<typeof sessionUserQuery, 'User'>;

graphql(`
  fragment SessionToken on Credential {
    token
    expiresAt
  }
`);

/** Saves `token` as a cookie. */
export const saveSessionToken = (
  document: { cookie: string },
  { token, expiresAt }: SessionToken$data,
) => {
  document.cookie = cookie.serialize('token', token, {
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
  redirect(307, `/login?${new URLSearchParams({ to, ...searchParams }).toString()}`);
};

export const me = derived(page, ($page) => $page.data.me);
