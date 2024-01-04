import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent }) {
  const { myApps } = await loadQuery(
    {
      myApps: [
        {},
        {
          name: true,
          faviconUrl: true,
          active: true,
          id: true,
          clientId: true,
        },
      ],
    },
    { fetch, parent },
  );

  return { apps: myApps };
}
