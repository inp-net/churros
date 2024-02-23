import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      service: [
        params,
        {
          id: true,
          name: true,
          url: true,
          description: true,
          logo: true,
          logoSourceType: true,
          importance: true,
          group: {
            id: true,
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
          studentAssociation: {
            id: true,
            uid: true,
            name: true,
          },
          school: {
            id: true,
            uid: true,
            name: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
