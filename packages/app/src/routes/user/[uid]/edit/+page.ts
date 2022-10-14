import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const userQuery = Selector('User')({
  uid: true,
  firstName: true,
  lastName: true,
  nickname: true,
  description: true,
  pictureFile: true,
  address: true,
  graduationYear: true,
  majorId: true,
  phone: true,
  birthday: true,
  linkCollection: { links: { type: true, value: true } },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  if (params.uid !== me?.uid && !me?.canEditUsers) throw redirect(307, '..');

  return loadQuery(
    {
      user: [params, userQuery],
      // If the user is an admin, we also load the permissions
      __alias: {
        userPermissions: me.admin
          ? { user: [params, { admin: true, canEditUsers: true, canEditGroups: true }] }
          : {},
      },
      linkTypes: true,
      schoolGroups: { names: true, majors: { id: true, name: true } },
    },
    { fetch, parent }
  );
};
