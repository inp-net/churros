import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  const now = new Date();
  throw redirect(307, `${now.getFullYear()}/${`${now.getMonth() + 1}`.padStart(2, '0')}/`);
};
