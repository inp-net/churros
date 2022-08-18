import { redirectToLogin } from '$lib/session';
import { query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session, url }) => {
  if (!session.me) redirectToLogin(url.pathname);
  return query(
    fetch,
    {
      me: {
        id: true,
        firstname: true,
        lastname: true,
        nickname: true,
        credentials: {
          id: true,
          type: true,
          userAgent: true,
          createdAt: true,
          active: true,
        },
      },
    },
    session
  );
};
