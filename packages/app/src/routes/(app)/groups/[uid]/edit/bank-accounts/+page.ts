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

  const { user: currentUser } = await loadQuery(
    {
      user: [{ id: me?.id }, { canEditGroup: [{ uid: params.uid }, true] }],
    },
    { fetch, token },
  );

  if (
    !currentUser?.canEditGroup &&
    !me?.groups.some(({ group, ...perms }) => group.uid === params.uid && isOnClubBoard(perms))
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [
        { uid: params.uid },
        {
          ..._clubQuery,
          lydiaAccounts: {
            id: true,
            name: true,
          },
        },
      ],
    },
    { fetch, token },
  );
};
