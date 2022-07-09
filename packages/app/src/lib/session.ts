import Cookies from 'js-cookie'
import { Query, type PropsType } from './zeus.js'

/** What's needed in a user session. */
export const sessionUserQuery = () =>
  Query({
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
  Cookies.set('token', token, {
    expires: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    path: '/',
  })
}

export const redirectToLogin = (to: string) => ({
  status: 307,
  redirect: `/login?${new URLSearchParams({ to }).toString()}`,
})
