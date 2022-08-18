import { query, Selector } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const userQuery = Selector('User')({
  id: true,
  firstname: true,
  lastname: true,
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

export const load: PageLoad = async ({ fetch, params, session }) => {
  if (params.id !== session.me?.id && !session.me?.canEditUsers) throw redirect(307, '..');

  return query(
    fetch,
    {
      user: [{ id: params.id }, userQuery],
      linkTypes: true,
      majors: { id: true, name: true, schools: { id: true, name: true } },
    },
    session
  );
};
