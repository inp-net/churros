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
          stock: true,
          max: true,
          description: true,
        },
      ],
    },
    { fetch, parent },
  );