import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const data = await loadQuery(
    {
      userServices: {
        name: true,
        url: true,
        description: true,
        logo: true,
        logoSourceType: true,
        group: {
          pictureFile: true,
          pictureFileDark: true,
        },
      },
    },
    { fetch, parent }
  );
  return {
    ...data,
    userServices: {
      ...data.userServices,
    },
  };
};
