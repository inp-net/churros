import { redirectToLogin } from '$lib/session.js';
import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, url }) {
  const { me } = await parent();
  if (!me) redirectToLogin(url.pathname);

  return loadQuery(
    {
      me: { major: { schools: { id: true, uid: true, name: true, pictureFile: true } } },
    },
    { fetch, parent },
  );
}
