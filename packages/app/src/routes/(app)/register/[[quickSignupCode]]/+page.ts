import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  return loadQuery(
    {
      schools: {
        studentMailDomain: true,
        aliasMailDomains: true,
      },
    },
    { fetch, parent },
  );
};
