import { redirectToLogin } from '$lib/session.js';
import { loadQuery, Selector } from '$lib/zeus.js';
import uniqBy from 'lodash.uniqby';

export const _formNodeQuery = Selector('Form')({
  localId: true,
  id: true,
  title: true,
  descriptionHtml: true,
  canEdit: true,
  canSeeAnswers: true,
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
  const { allForms, forms } = await loadQuery(
    {
      ...(me?.admin
        ? {
            allForms: [
              {},
              {
                nodes: _formNodeQuery,
              },
            ],
          }
        : {}),
      forms: [
        {},
        {
          nodes: _formNodeQuery,
        },
      ],
    },
    { fetch, parent },
  );

  return {
    forms: uniqBy([...(forms?.nodes ?? []), ...(allForms?.nodes ?? [])], 'id'),
  };
}
