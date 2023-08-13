import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      events: [
        { future: true },
        {
          pageInfo: { hasNextPage: true, startCursor: true },
          edges: {
            node: {
              id: true,
              uid: true,
              group: { uid: true, pictureFile: true, name: true },
              title: true,
              location: true,
              pictureFile: true,
              startsAt: true,
              endsAt: true,
              descriptionHtml: true,
            },
          },
        },
      ],
    },
    { fetch, parent }
  );
