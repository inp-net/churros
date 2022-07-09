import { sessionUserQuery } from '$lib/session'
import { query } from '$lib/zeus'
import type { ExternalFetch, GetSession, Handle } from '@sveltejs/kit'
import Cookies from 'js-cookie'

export const handle: Handle = async ({ event, resolve }) => {
  const token = Cookies.get('token')
  if (token) {
    try {
      const { me } = await query(fetch, { me: sessionUserQuery() }, { token })
      event.locals.token = token
      event.locals.me = me
    } catch {
      // Ignore invalid sessions
    }
  }

  return resolve(event)
}

export const getSession: GetSession = ({ locals }) => {
  if (!locals.token) return {}
  return { token: locals.token, me: locals.me }
}

export const externalFetch: ExternalFetch = fetch
