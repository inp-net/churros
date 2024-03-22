import { getMe, redirectToLogin } from '$lib/session';
import { loadQuery } from '$lib/zeus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { fetch, parent, url } = event;
  const me = await getMe(event);
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
    { fetch, parent },
  );
};
