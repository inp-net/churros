import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      shopItem: [
        {
          itemUid: params.itemUid,
        },
        {
          id: true,
          name: true,
          shopPayments: {
            id: true,
            quantity: true,
            paid: true,
            totalPrice: true,
            paymentMethod: true,
            user: {
              uid: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
