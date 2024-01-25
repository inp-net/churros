import { loadQuery } from '$lib/zeus';
import { fail } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { codeContributors } = await loadQuery(
    {
      codeContributors: {
        '__typename': true,
        '...on Error': { message: true },
        '...on QueryCodeContributorsSuccess': {
          data: {
            uid: true,
            id: true,
            fullName: true,
            pictureFile: true,
          },
        },
      },
    },
    { fetch, parent },
  );

  if (codeContributors.__typename === 'Error') throw fail(500);

  return { codeContributors: codeContributors.data };
};
