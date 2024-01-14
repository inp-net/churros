import { isOnClubBoard } from '$lib/permissions';
import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

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
  const { me, token } = await parent();
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
    { fetch, token },
  );
};
