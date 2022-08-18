import { query } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session }) => {
  if (session.me) throw redirect(307, '/');
  return query(fetch, {
    majors: {
      id: true,
      name: true,
      schools: { id: true, name: true },
    },
  });
};
