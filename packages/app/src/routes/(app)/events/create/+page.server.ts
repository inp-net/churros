import { canCreateEvent } from '$lib/permissions';
import { getMe, redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { parent, url } = event;
  const me = await getMe(event);
  if (!me) throw redirectToLogin(url.pathname);

  const memberWithPermissions = me.groups.filter((m) => canCreateEvent(m, me));

  if (memberWithPermissions.length === 1)
    throw redirect(301, `/events/${memberWithPermissions[0].group.uid}/create`);
};
