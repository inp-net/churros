import * as cookie from 'cookie'
import { Selector, type PropsType } from './zeus.js'

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Selector('User')({
    id: true,
    name: true,
    admin: true,
    canEditClubs: true,
    canEditUsers: true,
    clubs: { clubId: true, canEditArticles: true, canEditMembers: true },
  })

export type SessionUser = PropsType<typeof sessionUserQuery, 'User'>

export const saveSessionToken = ({
  token,
  expiresAt,
}: {
  token: string
  expiresAt?: Date | null
}) => {
  document.cookie = cookie.serialize('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
  })
}

export const redirectToLogin = (to: string) => ({
  status: 307,
  redirect: `/login?${new URLSearchParams({ to }).toString()}`,
})
