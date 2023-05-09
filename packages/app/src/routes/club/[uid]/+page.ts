import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      group: [
        params,
        me
          ? // Authenticated query
            {
              id: true,
              uid: true,
              type: true,
              name: true,
              address: true,
              color: true,
              description: true,
              longDescriptionHtml: true,
              email: true,
              selfJoinable: true,
              ancestors: { uid: true, name: true },
              articles: { slug: true, title: true, bodyHtml: true },
              school: { name: true, color: true },
              linkCollection: { links: { type: true, value: true } },
              members: {
                member: { uid: true, firstName: true, lastName: true },
                title: true,
                president: true,
                treasurer: true,
                vicePresident: true,
                secretary: true,
              },
            }
          : // Unauthenticated query
            {
              id: true,
              uid: true,
              type: true,
              name: true,
              address: true,
              color: true,
              description: true,
              longDescriptionHtml: true,
              email: true,
              selfJoinable: true,
              articles: { slug: true, title: true, bodyHtml: true },
              school: { name: true, color: true },
              linkCollection: { links: { type: true, value: true } },
            },
      ],
    },
    { fetch, parent }
  );
  return {
    ...data,
    group: {
      ...data.group,
      members: (data.group.members ?? []).sort(byMemberGroupTitleImportance),
    },
  };
};
