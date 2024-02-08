import { isOnClubBoard } from '$lib/permissions';
import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.admin &&
    !me.groups.some(({ canEditArticles, ...perms }) => canEditArticles || isOnClubBoard(perms))
  )
    throw redirect(307, '..');

  return {};
};
