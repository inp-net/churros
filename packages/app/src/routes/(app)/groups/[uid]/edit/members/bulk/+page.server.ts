import { getMe, redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { params, parent, url } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === params.uid)
  )
    throw redirect(307, '.');
};
