import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      orders: [
        {
          groupUid: params.uid,
        },
        {
          id: true,
          quantity: true,
          paid: true,
          totalPrice: true,
          paymentMethod: true,
          shopItem: {
            uid: true,
            id: true,
            name: true,
            price: true,
            description: true,
            paymentMethods: true,
            visibility: true,
            group: { uid: true },
            pictures: {
              path: true,
            },
          },
        },
      ],
      group: [
        {
          uid: params.uid,
        },
        {
          boardMembers: {
            member: {
              uid: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  return { me, ...data };
};
