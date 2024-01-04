import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ parent }) => {
  const { me } = await parent();
  if (!me?.admin) throw redirect(307, '/');
};
