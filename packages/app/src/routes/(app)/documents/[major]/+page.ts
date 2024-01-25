import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      major: [
        { uid: params.major },
        {
          name: true,
          shortName: true,
          uid: true,
        },
      ],
    },
    { fetch, parent },
  );
