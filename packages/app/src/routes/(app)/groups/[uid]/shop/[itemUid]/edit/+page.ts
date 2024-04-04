import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  /*   const { group } = await loadQuery(
    {
      group: [
        { uid: params.uid },
        {
          pictureFile: true,
          pictureFileDark: true,
          uid: true,
          name: true,
          members: {
            member: { uid: true },
          },
        },
      ],
    },
    { fetch, parent },
  ); */

  const data = await loadQuery(
    {
      shopItem: [
        { itemUid: params.itemUid },
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
    { fetch, parent },
  );
  if (
    !(me.admin || data.shopItem.group.boardMembers.some((member) => member.member.uid === me.uid))
  )
    throw redirect(307, '..');
  return data;
};
