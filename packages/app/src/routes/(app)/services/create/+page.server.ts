import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
  const { me } = await parent();
  if (!me?.admin) throw redirect(307, '/');
};
