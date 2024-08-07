import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const data = await loadQuery(
    {
      group: [
        { uid: params.uid },
        {
          uid: true,
          name: true,
          boardMembers: {
            member: {
              uid: true,
            },
          },
          shopItem: [
            { id: params.id },
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
              itemOptions: {
                id: true,
                name: true,
                options: true,
                required: true,
                otherToggle: true,
              },
            },
          ],
        },
      ],
    },
    { fetch, parent },
  );
  if (!data.group.shopItem) error(404, { message: 'Article de la boutique introuvable' });
  return data;
};
