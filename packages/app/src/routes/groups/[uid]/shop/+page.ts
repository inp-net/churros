import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const data = await loadQuery(
    {
      shopItems: [
        {
          groupUid: params.uid,
        },
        {
          id: true,
          name: true,
          description: true,
        },
      ],
    },
    { fetch, parent },
  );
  return {
    ...data,
    shopItems: {
      ...data.shopItems,
    },
  };
};
