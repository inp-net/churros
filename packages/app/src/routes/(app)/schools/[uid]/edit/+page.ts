import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  if (!me?.admin) throw redirect(307, '../');

  return await loadQuery(
    {
      school: [
        params,
        {
          id: true,
          uid: true,
          name: true,
          description: true,
          address: true,
          internalMailDomain: true,
          aliasMailDomains: true,
          pictureFile: true,
        },
      ],
    },
    { fetch, parent },
  );
};
