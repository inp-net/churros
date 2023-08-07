import { canCreateArticle } from '$lib/permissions';
import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const memberWithPermissions = me.groups.filter((m) => canCreateArticle(m, me));

  if (memberWithPermissions.length === 1)
    throw redirect(301, `/club/${memberWithPermissions[0].group.uid}/write`);
};
