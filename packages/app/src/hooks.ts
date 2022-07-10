import { sessionUserQuery } from '$lib/session'
import { query } from '$lib/zeus'
import type { GetSession, Handle } from '@sveltejs/kit'
import * as cookie from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
  const { token } = cookie.parse(event.request.headers.get('Cookie') ?? '')
  if (token) {
    try {
      const { me } = await query(fetch, { me: sessionUserQuery() }, { token })
      event.locals.token = token
      event.locals.me = me
    } catch {}
  }

  const response = await resolve(event)

  // Delete invalid token
  if (token && !event.locals.me)
    response.headers.append('Set-Cookie', 'token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT')

  return response
}

export const getSession: GetSession = ({ locals }) => {
  if (!locals.token) return {}
  return { token: locals.token, me: locals.me }
}
