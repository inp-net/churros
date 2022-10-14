import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, canEditArticles }) => group.uid === params.uid && canEditArticles)
  )
    throw redirect(307, '.');
};
