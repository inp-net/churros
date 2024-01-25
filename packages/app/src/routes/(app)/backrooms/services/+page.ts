import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const data = await parent();
  if (!data.me) throw redirectToLogin('/backrooms/services');
  if (!data.me.admin) throw redirect(307, '/');
  return loadQuery(
    {
      services: [
        {},
        {
          id: true,
          name: true,
          url: true,
          description: true,
          logo: true,
          logoSourceType: true,
          group: {
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
};
