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
          group: {
            uid: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
          studentAssociation: {
            uid: true,
            name: true,
          },
          school: {
            uid: true,
            name: true,
            color: true,
          },
        },
      ],
    },
    { fetch, parent }
  );
