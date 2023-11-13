import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin('/reports');
  const { issue } = await loadQuery(
    {
      issue: [
        { number: Number.parseInt(params.number, 10) },
        {
          number: true,
          body: true,
          title: true,
          state: true,
          importance: true,
          difficulty: true,
          url: true,
          bodyHtml: true,
        },
      ],
    },
    { fetch, parent },
  );
  return { issue };
};
