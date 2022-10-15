import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      groups: [
        {},
        {
          uid: true,
          name: true,
          groupId: true,
          parentId: true,
        },
      ],
    },
    { fetch, parent }
  );
