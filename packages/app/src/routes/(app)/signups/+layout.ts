import { redirectToLogin } from '$lib/session.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent, url }) => {
  const data = await parent();
  if (!data.me) throw redirectToLogin(url.pathname);
  return data;
};
