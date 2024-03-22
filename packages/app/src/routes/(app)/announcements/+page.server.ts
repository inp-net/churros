import { getMe } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent } = event;
  const me = await getMe(event);
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
    { fetch, parent },
  );
};
