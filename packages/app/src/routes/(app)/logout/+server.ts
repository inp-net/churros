import { chain } from '$lib/zeus';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
  const token = url.searchParams.get('token');
  if (token !== locals.token) return new Response('Incorrect token', { status: 401 });

  try {
    await chain(fetch, { token })('mutation')({ logout: true });
  } catch {
    // Ignore errors
  }

  return new Response('', {
    status: 307,
    headers: {
      'Location': '/',
      'Set-Cookie': 'token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    },
  });
};
