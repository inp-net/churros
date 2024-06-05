import { redirectToLogin } from '$lib/session.js';
import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent, url }) {
  const { me } = await parent();
  if (!me) redirectToLogin(url.pathname);

  return loadQuery(
    {
      quickSignups: [
        {},
        {
          nodes: {
            code: true,
            validUntil: true,
            expired: true,
            school: { uid: true, name: true, pictureURL: true, color: true },
          },
        },
      ],
    },
    { fetch, parent },
  );
}
