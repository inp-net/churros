import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { me } = await parent();
  if (me) throw redirect(307, '/');
};
