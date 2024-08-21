import { loadQuery } from '$lib/zeus';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { shopItem } = await loadQuery(
    {
      shopItem: [
        {
          slug: params.itemUid,
        },
        {
          id: true,
          name: true,
          itemOptions: {
            name: true,
            options: true,
          },
          shopPayments: {
            id: true,
            quantity: true,
            paid: true,
            totalPrice: true,
            paymentMethod: true,
            user: {
              uid: true,
              fullName: true,
              pictureFile: true,
            },
            shopItemAnswer: {
              options: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );

  if (!shopItem) error(404, { message: `Article de boutique ${params.itemUid} introuvable` });
  return { shopItem };
};
