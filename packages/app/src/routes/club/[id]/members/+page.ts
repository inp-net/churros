import { redirectToLogin } from '$lib/session';
import { query } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, session, url }) => {
  if (!session.me) redirectToLogin(url.pathname);

  if (
    !session.me?.canEditGroups &&
    !session.me?.groups.some(
      ({ groupId, canEditMembers }) => canEditMembers && groupId === params.id
    )
  )
    throw redirect(307, '.');

  return query(
    fetch,
    {
      group: [
        { id: params.id },
        {
          members: {
            memberId: true,
            member: { firstname: true, lastname: true },
            title: true,
            president: true,
            treasurer: true,
            canEditMembers: true,
          },
        },
      ],
    },
    {
      token: session.token,
    }
  );
};
