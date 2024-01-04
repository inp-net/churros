import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent, url }) => {
  const { me, mobile } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.canEditGroups &&
    !me.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === params.uid)
  )
    throw redirect(307, '.');

  return loadQuery(
    {
      group: [
        { uid: params.uid },
        {
          id: true,
          uid: true,
          studentAssociation: {
            uid: true,
            name: true,
          },
          members: {
            memberId: true,
            createdAt: true,
            member: {
              uid: true,
              firstName: true,
              lastName: true,
              pictureFile: true,
              fullName: true,
              yearTier: true,
              contributesTo: {
                uid: true,
              },
            },
            title: true,
            president: true,
            treasurer: true,
            secretary: true,
            vicePresident: true,
            canEditMembers: true,
            canEditArticles: true,
            canScanEvents: true,
          },
        },
      ],
    },
    {
      fetch,

      parent: async () =>
        new Promise((resolve) => {
          resolve({
            mobile,
            me: undefined,
            token: undefined,
          });
        }),
    },
  );
};
