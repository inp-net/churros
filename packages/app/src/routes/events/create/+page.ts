import { redirectToLogin } from '$lib/session';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { canCreateEvent } from '$lib/permissions';

export const load: PageLoad = async ({ parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const memberWithPermissions = me.groups.filter((m) => canCreateEvent(m, me));

  if (memberWithPermissions.length === 1)
    throw redirect(301, `/events/${memberWithPermissions[0].group.uid}/create`);
};
