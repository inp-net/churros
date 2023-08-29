import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { redirectToLogin } from '$lib/session';

export const load: LayoutLoad = async ({ parent }) => {
  const data = await parent();
  if (!data.me) throw redirectToLogin('/logs');
  if (!data.me.admin) throw redirect(307, '/');

  return data;
};
