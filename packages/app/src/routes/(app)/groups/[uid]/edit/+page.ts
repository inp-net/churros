import { isOnClubBoard } from '$lib/permissions';
import { redirectToLogin } from '$lib/session';
import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

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
    id: true,
    school: {
      uid: true,
      color: true,
      name: true,
    },
  },
  parent: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
  selfJoinable: true,
  related: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
});

export const load: PageLoad = async ({ fetch, params, url, parent }) => {
  const { me, token } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

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
    { fetch, token },
  );
};
