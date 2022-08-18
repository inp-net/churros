import { loadQuery, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const userQuery = Selector('User')({
  id: true,
  firstName: true,
  lastName: true,
  nickname: true,
  biography: true,
  pictureFile: true,
  address: true,
  graduationYear: true,
  majorId: true,
  phone: true,
  birthday: true,
  links: { type: true, value: true },
});

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  if (params.id !== me?.id && !me?.canEditUsers) throw redirect(307, '..');

  return loadQuery(
    {
      user: [{ id: params.id }, userQuery],
      linkTypes: true,
      majors: { id: true, name: true, schools: { id: true, name: true } },
    },
    { fetch, parent }
  );
};
