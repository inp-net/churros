import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      userServices: {
        name: true,
        url: true,
        description: true,
        logo: true,
        logoSourceType: true,
        id: true,
        group: {
          pictureFile: true,
          pictureFileDark: true,
        },
      },
      codeContributors: {
        '__typename': true,
        '...on Error': { message: true },
        '...on QueryCodeContributorsSuccess': {
          data: {
            id: true,
          },
        },
      },
    },
    { fetch, parent },
  );
