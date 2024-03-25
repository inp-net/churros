import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const group = await loadQuery(
    {
      group: [
        params,
        {
          id: true,
          uid: true,
          name: true,
          boardMembers: {
            member: {
              uid: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  const data = await loadQuery(
    {
      itemsOfGroup: [
        {
          groupId: group.group.id,
        },
        {
          edges: {
            node: {
              uid: true,
              id: true,
              name: true,
              price: true,
              max: true,
              descriptionHtml: true,
              stock: true,
              stockLeft: true,
              pictures: {
                id: true,
                path: true,
                position: true,
              },
              group: {
                uid: true,
              },
              visibility: true,
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
  return {
    ...group,
    ...data,
    me,
  };
};
