import { redirectToLogin } from '$lib/session';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return {};
};
