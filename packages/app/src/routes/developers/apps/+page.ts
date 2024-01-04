import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent }) {
  const { myApps } = await loadQuery(
    {
      myApps: {
        name: true,
        faviconUrl: true,
        active: true,
        id: true,
        clientId: true,
      },
    },
    {
      fetch,
      parent: async () => {
        const parentData = await parent();
        return {
          ...parentData,
          // XXX dunno why this is needed
          token: parentData.token!,
        };
      },
    },
  );

  return { apps: myApps };
}
