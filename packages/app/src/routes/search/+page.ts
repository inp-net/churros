import { redirectToLogin } from '$lib/session';
import { query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session, url }) => {
  if (!session.me) redirectToLogin(url.pathname + url.search);
  return url.searchParams.has('q')
    ? query(
        fetch,
        {
          searchUsers: [
            { q: url.searchParams.get('q')! },
            { id: true, firstname: true, lastname: true },
          ],
        },
        session
      )
    : { searchUsers: [] };
};
