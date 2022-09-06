import { redirectToLogin } from '$lib/session.js';
import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent, url }) => {
  const data = await parent();
  if (!data.me) throw redirectToLogin(url.pathname);
  if (!data.me.admin) throw redirect(307, '/');
  return data;
};
