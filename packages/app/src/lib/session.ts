import type { LoadOutput } from '@sveltejs/kit';
import * as cookie from 'cookie';
import { Selector, type PropsType } from './zeus.js';

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Selector('User')({
    id: true,
    name: true,
    admin: true,
    canEditGroups: true,
    canEditUsers: true,
    groups: { groupId: true, canEditArticles: true, canEditMembers: true },
    major: { id: true, name: true, schools: { id: true, name: true } },
  });

export type SessionUser = PropsType<typeof sessionUserQuery, 'User'>;

/** Saves `token` as a cookie. */
export const saveSessionToken = ({
  token,
  expiresAt,
}: {
  token: string;
  expiresAt?: Date | null;
}) => {
  document.cookie = cookie.serialize('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
    sameSite: 'strict',
  });
};

/** Returns a temporary redirect object. */
export const redirectToLogin = (to: string): LoadOutput => ({
  status: 307,
  redirect: `/login?${new URLSearchParams({ to }).toString()}`,
});
