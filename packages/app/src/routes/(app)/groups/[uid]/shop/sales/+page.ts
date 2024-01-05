import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      shopItems: [
        {
          groupUid: params.uid,
        },
        {
          id: true,
          name: true,
          price: true,
          max: true,
          description: true,
          stock: true,
          stockLeft: true,
          group: { uid: true },
        },
      ],
    },
    { fetch, parent },
  );
