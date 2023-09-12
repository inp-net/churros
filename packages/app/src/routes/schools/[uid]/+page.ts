import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const data = await loadQuery(
    {
      school: [
        params,
        {
          uid: true,
          name: true,
          description: true,
          address: true,
          studentAssociations: {
            uid: true,
            name: true,
            description: true,
          },
          services: {
            name: true,
            description: true,
            url: true,
            logo: true,
            logoSourceType: true,
            group: {
              pictureFile: true,
              pictureFileDark: true,
            },
          },
        },
      ],
    },
    { fetch, parent }
  );
  return {
    ...data,
    school: {
      ...data.school,
    },
  };
};
