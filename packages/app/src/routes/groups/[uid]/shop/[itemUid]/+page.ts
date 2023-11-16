import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      shopItem: [
        { itemUid: params.itemUid },
        {
          id: true,
          name: true,
          price: true,
          stock: true,
          max: true,
          description: true,
          paymentMethods: true,
          pictures: {
            path: true,
            position: true,
          },
          group: { uid: true },
        },
      ],
    },
    { fetch, parent },
  );
