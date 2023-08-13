import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { redirectToLogin } from '$lib/session';
import { Selector, loadQuery } from '$lib/zeus';

export const load: PageLoad = async ({ fetch, parent, url, params }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);

  if (
    !me.admin &&
    !me.groups.some(
      ({ canEditArticles, president, treasurer, secretary, vicePresident }) =>
        canEditArticles || president || treasurer || secretary || vicePresident
    )
  )
    throw redirect(307, '..');

  return loadQuery(
    {
      group: [
        { uid: params.group },
        Selector('Group')({
          email: true,
          name: true,
          pictureFile: true,
          uid: true,
          id: true,
        }),
      ],
      lydiaAccountsOfGroup: [
        { uid: params.group },
        Selector('LydiaAccount')({
          id: true,
          name: true,
        }),
      ],
    },
    { fetch, parent }
  );
};
