import { getMe, redirectToLogin } from '$lib/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { url, parent } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);
  return {};
};
