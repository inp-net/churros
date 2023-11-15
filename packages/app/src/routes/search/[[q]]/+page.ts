import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url, params: { q } }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname + url.search);
  if (!q) return { searchUsers: [], searchGroups: [], searchEvents: [], searchArticles: [] };

  return loadQuery(
    {
      searchUsers: [
        { q, similarityCutoff: Number.parseFloat(url.searchParams.get('sim') ?? '0.05') },
        { uid: true, firstName: true, lastName: true, pictureFile: true, fullName: true },
      ],
      searchGroups: [
        {
          q,
          similarityCutoff: Number.parseFloat(url.searchParams.get('sim') ?? '0.05'),
        },
        { uid: true, name: true, pictureFile: true, pictureFileDark: true },
      ],
    },
    { fetch, parent },
  );
};
