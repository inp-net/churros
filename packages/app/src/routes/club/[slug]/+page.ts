import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  return loadQuery(
    {
      group: [
        params,
        me
          ? {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              members: {
                member: { uid: true, firstName: true, lastName: true },
                title: true,
                president: true,
                treasurer: true,
              },
              school: { name: true, color: true },
            }
          : {
              id: true,
              name: true,
              articles: { title: true, bodyHtml: true },
              school: { name: true, color: true },
            },
      ],
    },
    { fetch, parent }
  );
};
