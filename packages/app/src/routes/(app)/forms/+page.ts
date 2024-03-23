import { redirectToLogin } from '$lib/session.js';
import { loadQuery } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export async function load({ fetch, parent, url }) {
  const { me } = await parent();
  if (!me) redirectToLogin(url.pathname, url.searchParams);
  if (!me?.admin) error(403, { message: 'Page réservée aux admins' });
  return loadQuery(
    {
      allForms: [
        {},
        {
          nodes: {
            localId: true,
            id: true,
            title: true,
            descriptionHtml: true,
          },
        },
      ],
    },
    { fetch, parent },
  );
}
