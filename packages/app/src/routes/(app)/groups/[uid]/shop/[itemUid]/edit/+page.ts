import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus.js';
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
          name: true,
          uid: true,
          shopItem: [
            { slug: params.itemUid },
            {
              id: true,
              uid: true,
              name: true,
              price: true,
              stock: true,
              max: true,
              description: true,
              startsAt: true,
              endsAt: true,
              visibility: true,
              paymentMethods: true,
              lydiaAccount: {
                id: true,
                name: true,
              },
              group: {
                uid: true,
                name: true,
                pictureFile: true,
                pictureFileDark: true,
                boardMembers: {
                  member: {
                    uid: true,
                  },
                },
              },
              pictures: {
                id: true,
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
          lydiaAccounts: {
            id: true,
            name: true,
            group: {
              uid: true,
              name: true,
              pictureFile: true,
              pictureFileDark: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  if (!data.group?.shopItem) error(404, { message: 'Article inexistant' });
  return data;
};
