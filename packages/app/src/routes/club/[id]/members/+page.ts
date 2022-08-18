import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ groupId, canEditMembers }) => canEditMembers && groupId === params.id)
  )
    throw redirect(307, '.');

  return loadQuery(
    {
      group: [
        { id: params.id },
        {
          members: {
            memberId: true,
            member: { firstName: true, lastName: true },
            title: true,
            president: true,
            treasurer: true,
            canEditMembers: true,
          },
        },
      ],
    },
    { fetch, parent }
  );
};
