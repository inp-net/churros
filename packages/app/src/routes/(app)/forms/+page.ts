import { redirectToLogin } from '$lib/session.js';
import { loadQuery, Selector } from '$lib/zeus.js';
import { error } from '@sveltejs/kit';

export const _formNodeQuery = Selector('Form')({
  localId: true,
  id: true,
  title: true,
  descriptionHtml: true,
  group: {
    pictureFile: true,
    pictureFileDark: true,
    name: true,
    uid: true,
  },
});

export async function load({ fetch, parent, url }) {
  const { me } = await parent();
  if (!me) redirectToLogin(url.pathname, url.searchParams);
  if (!me?.admin) error(403, { message: 'Page réservée aux admins' });
  return loadQuery(
    {
      allForms: [
        {},
        {
          nodes: _formNodeQuery,
        },
      ],
    },
    { fetch, parent },
  );
}
