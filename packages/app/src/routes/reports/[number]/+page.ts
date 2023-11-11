import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin('/reports');
  const { issuesByUser } = await loadQuery(
    {
      issuesByUser: {
        number: true,
        body: true,
        title: true,
        state: true,
        importance: true,
        difficulty: true,
        url: true,
        bodyHtml: true,
      },
    },
    { fetch, parent },
  );
  const issue = issuesByUser.find(({ number }) => number === Number.parseInt(params.number, 10));
  if (!issue) throw error(404, 'Rapport non trouvé');
  return { issue };
};
