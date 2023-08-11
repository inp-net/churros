import { redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname);
  return loadQuery(
    {
      birthdays: [
        {
          width: 4,
        },
        {
          birthday: true,
          fullName: true,
          uid: true,
          pictureFile: true,
          major: { shortName: true },
        },
      ],
    },
    { fetch, parent }
  );
};
