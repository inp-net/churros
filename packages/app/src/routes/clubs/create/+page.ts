import { query } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session }) => {
  if (!session.me?.canEditGroups) throw redirect(307, '..');
  return query(fetch, { schools: { id: true, name: true } }, session);
};
