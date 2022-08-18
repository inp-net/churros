import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
  if (!me?.canEditGroups) throw redirect(307, '..');
  return loadQuery({ schools: { id: true, name: true } }, { fetch, parent });
};
