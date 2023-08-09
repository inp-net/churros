import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
  if (!me?.admin) throw redirect(301, '/');
  return loadQuery(
    {
      announcements: [
        {},
        {
          edges: {
            node: {
              id: true,
              title: true,
              bodyHtml: true,
              by: {
                uid: true,
                fullName: true,
                pictureFile: true,
              },
              startsAt: true,
              endsAt: true,
              warning: true,
            },
          },
        },
      ],
    },
    { fetch, parent }
  );
};
