import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url, params: { q } }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname + url.search);
  if (!q) return { searchUsers: [], searchGroups: [], searchEvents: [], searchArticles: [] };

  const similarityCutoff = url.searchParams.get('sim')
    ? Number.parseFloat(url.searchParams.get('sim')!)
    : undefined;

  return loadQuery(
    {
      searchUsers: [
        { q, similarityCutoff },
        { uid: true, firstName: true, lastName: true, pictureFile: true, fullName: true },
      ],
      searchGroups: [
        { q, similarityCutoff },
        { uid: true, name: true, pictureFile: true, pictureFileDark: true },
      ],
    },
    { fetch, parent },
  );
};
