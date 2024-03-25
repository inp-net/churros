import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const data = await loadQuery(
    {
      shopItem: [
        { itemUid: params.itemUid },
        {
          id: true,
          name: true,
          price: true,
          stock: true,
          stockLeft: true,
          max: true,
          descriptionHtml: true,
          paymentMethods: true,
          pictures: {
            path: true,
            position: true,
          },
          group: {
            uid: true,
            boardMembers: {
              member: {
                uid: true,
              },
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  return data;
};
