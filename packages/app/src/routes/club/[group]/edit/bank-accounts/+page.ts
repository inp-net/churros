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
  school: {
    id: true,
    name: true,
  },
  selfJoinable: true,
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me, mobile } = await parent();
  console.log(me);
  if (
    !me?.canEditGroups &&
    !me?.groups.some(
      ({ group, president, secretary, treasurer, vicePresident }) =>
        group.uid === params.group && (president || secretary || treasurer || vicePresident)
    )
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [{ uid: params.group }, _clubQuery],
      lydiaAccountsOfGroup: [
        { uid: params.group },
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
    }
  );
};
