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
          pictureFile: true,
          description: true,
          type: true,
        },
      ],
    },
    { fetch, parent }
  );
