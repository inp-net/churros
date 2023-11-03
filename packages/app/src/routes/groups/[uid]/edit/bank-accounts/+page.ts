import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isOnClubBoard } from '$lib/permissions';

export const _clubQuery = Selector('Group')({
  uid: true,
  parentId: true,
  groupId: true,
  type: true,
  name: true,
  color: true,
  address: true,
  description: true,
  email: true,
  pictureFile: true,
  longDescription: true,
  links: {
    name: true,
    value: true,
  },
  selfJoinable: true,
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me, mobile } = await parent();
  if (
    !me?.canEditGroups &&
    !me?.groups.some(({ group, ...perms }) => group.uid === params.uid && isOnClubBoard(perms))
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [{ uid: params.uid }, _clubQuery],
      lydiaAccountsOfGroup: [
        { uid: params.uid },
        Selector('LydiaAccount')({
          id: true,
          name: true,
        }),
      ],
    },
    {
      fetch,
      parent: async () =>
        new Promise((resolve) => {
          resolve({
            mobile,
            me: undefined,
            token: undefined,
          });
        }),
    },
  );
};
