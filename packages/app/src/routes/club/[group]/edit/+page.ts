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
  linkCollection: {
    id: true,
    links: {
      name: true,
      value: true,
    },
  },
  school: {
    id: true,
    name: true,
  },
  selfJoinable: true,
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  console.log(me);
  if (
    !me?.canEditGroups &&
    !me?.groups.some(
      ({ group, president, secretary, treasurer, vicePresident }) =>
        group.uid === params.uid && (president || secretary || treasurer || vicePresident)
    )
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [{ uid: params.group }, _clubQuery],
      schoolGroups: { names: true, majors: { id: true, name: true } },
    },
    { fetch, parent }
  );
};
