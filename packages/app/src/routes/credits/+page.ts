import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      codeContributors: {
        uid: true,
        id: true,
        fullName: true,
        pictureFile: true,
      },
    },
    { fetch, parent },
  );
