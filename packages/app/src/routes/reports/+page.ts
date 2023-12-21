import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin('/reports');
  return loadQuery(
    {
      issuesByUser: {
        number: true,
        body: true,
        title: true,
        state: true,
        importance: true,
        difficulty: true,
        url: true,
        duplicatedFrom: true,
        comments: { addedAt: true },
      },
    },
    { fetch, parent },
  );
};
