import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  const data = await loadQuery(
    {
      group: [
        {
          uid: params.uid,
        },
        {
          uid: true,
          boardMembers: {
            member: {
              uid: true,
            },
          },
          shopItems: {
            uid: true,
            id: true,
            name: true,
            price: true,
            max: true,
            description: true,
            stock: true,
            stockLeft: true,
            group: {
              uid: true,
              name: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  if (!(me.admin || data.group.boardMembers.some((member) => member.member.uid === me.uid)))
    throw redirect(307, '..');
  return data;
};
