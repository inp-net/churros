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
              group: { uid: true, pictureFile: true, name: true, pictureFileDark: true },
              title: true,
              location: true,
              pictureFile: true,
              startsAt: true,
              endsAt: true,
              descriptionHtml: true,
              tickets: {
                name: true,
                opensAt: true,
                closesAt: true,
                price: true,
                placesLeft: true,
                capacity: true,
                uid: true,
              },
            },
          },
        },
      ],
    },
    { fetch, parent }
  );
