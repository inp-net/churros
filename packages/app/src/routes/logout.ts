import { mutate } from '$lib/zeus.js'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals }) => {
  const token = url.searchParams.get('token')
  if (token !== locals.token) return { status: 401, body: 'Incorrect token' }

  try {
    await mutate({ logout: true }, { token })
  } catch {
    // Ignore errors
  }

  return {
    status: 307,
    headers: {
      Location: '/',
      'Set-Cookie': 'token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    },
  }
}
