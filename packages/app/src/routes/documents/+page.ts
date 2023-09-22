import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      majors: {
        id: true,
        name: true,
        shortName: true,
        uid: true,
      },
    },
    { fetch, parent },
  );
