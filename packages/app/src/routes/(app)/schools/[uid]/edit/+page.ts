import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  return await loadQuery(
    {
      school: [
        params,
        {
          uid: true,
          name: true,
          description: true,
          address: true,
          internalMailDomain: true,
          aliasMailDomains: true,
        },
      ],
    },
    { fetch, parent },
  );
};
