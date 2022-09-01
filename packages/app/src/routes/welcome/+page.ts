import { redirectToLogin } from '$lib/session.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
};
