import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      homepage: [
        {},
        {
          id: true,
          title: true,
          bodyHtml: true,
          publishedAt: true,
          group: { id: true, name: true },
          author: { uid: true, firstName: true, lastName: true },
        },
      ],
    },
    { fetch, parent }
  );
