import { graphql } from '$houdini';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  const { url, locals } = event;
  const token = url.searchParams.get('token');
  if (token !== locals.token) return new Response('Incorrect token', { status: 401 });

  await graphql(`
    mutation Logout {
      logout
    }
  `).mutate(null, { event });

  return new Response('', {
    status: 307,
    headers: {
      'Location': '/',
      'Set-Cookie': 'token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
    },
  });
};
