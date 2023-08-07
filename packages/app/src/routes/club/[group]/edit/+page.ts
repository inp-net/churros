import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { redirectToLogin } from '$lib/session';

export const _clubQuery = Selector('Group')({
  id: true,
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
  pictureFileDark: true,
  longDescription: true,
  links: {
    name: true,
    value: true,
  },
  school: {
    uid: true,
    color: true,
    name: true,
  },
  parent: {
    uid: true,
    name: true,
    pictureFile: true,
  },
  selfJoinable: true,
  related: {
    uid: true,
    name: true,
    pictureFile: true,
  },
});

export const load: PageLoad = async ({ fetch, params, url, parent }) => {
  const { me, mobile } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  if (
    !me.canEditGroups &&
    !me.groups.some(
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
      schoolGroups: { names: true, majors: { id: true, name: true } },
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
