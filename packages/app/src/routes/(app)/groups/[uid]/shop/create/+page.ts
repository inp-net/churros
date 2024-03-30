import { redirectToLogin } from '$lib/session';
import { Visibility, loadQuery } from '$lib/zeus.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const { group, lydiaAccounts } = await loadQuery(
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

  return {
    shopItem: {
      id: '',
      uid: '',
      name: '',
      price: 0,
      stock: 0,
      max: 0,
      description: '',
      paymentMethods: [],
      lydiaAccount: undefined,
      visibility: Visibility.Private,
      startsAt: undefined,
      endsAt: undefined,
      group,
      groupUid: group.uid,
    },
    lydiaAccounts,
  };
};
