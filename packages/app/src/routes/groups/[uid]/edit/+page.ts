import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { redirectToLogin } from '$lib/session';
import { isOnClubBoard } from '$lib/permissions';

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
  website: true,
  email: true,
  pictureFile: true,
  pictureFileDark: true,
  longDescription: true,
  links: {
    name: true,
    value: true,
  },
  studentAssociation: {
    uid: true,
    name: true,
    school: {
      uid: true,
      color: true,
      name: true,
    },
  },
  parent: {
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
  selfJoinable: true,
  related: {
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
});

export const load: PageLoad = async ({ fetch, params, url, parent }) => {
  const { me, mobile } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, ...perms }) => group.uid === params.uid && isOnClubBoard(perms))
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [params, _clubQuery],
      lydiaAccountsOfGroup: [
        { uid: params.uid },
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
    },
  );
};
