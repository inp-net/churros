import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      notificationSubscriptions: [
        {},
        {
          endpoint: true,
        },
      ],
    },
    { fetch, parent }
  );
