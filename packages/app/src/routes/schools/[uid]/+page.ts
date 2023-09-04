import { byMemberGroupTitleImportance } from '$lib/sorting';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) => {
  const { me } = await parent();
  const data = await loadQuery(
    {
      school: [
        params,
        me
          ? // Authenticated query
            {
              id: true,
              uid: true,
              name: true,
              color: true,
            }
          : // Unauthenticated query
            {
              id: true,
              uid: true,
              name: true,
              color: true,
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
