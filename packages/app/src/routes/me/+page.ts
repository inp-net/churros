import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      me: {
        uid: true,
        firstName: true,
        lastName: true,
        nickname: true,
        pictureFile: true,
        credentials: { id: true, type: true, userAgent: true, createdAt: true, active: true },
      },
    },
    { fetch, parent }
  );
};
