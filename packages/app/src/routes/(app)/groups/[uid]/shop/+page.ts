import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      group: [
        {
          uid: params.uid,
        },
        {
          name: true,
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
            stock: true,
            stockLeft: true,
            max: true,
            description: true,
            group: { uid: true },
            pictures: {
              path: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  return {
    ...data,
    me,
  };
};
