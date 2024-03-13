import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      group: [
        {
          uid: params.uid,
        },
        {
          shopItems: {
            id: true,
            name: true,
            price: true,
            stock: true,
            stockLeft: true,
            max: true,
            description: true,
            group: { uid: true },
            pictures: {
              path: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
