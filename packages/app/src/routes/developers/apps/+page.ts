import { redirectToLogin } from '$lib/session';
import { hasNoUndefineds } from '$lib/typing';
import { loadQuery } from '$lib/zeus.js';

export const _thirdAppDataQuery = {
  name: true,
  faviconUrl: true,
  active: true,
  id: true,
  clientId: true,
  usersCount: true,
};

export async function load({ fetch, parent, url }) {
  const { me } = await parent();
  if (!me) throw redirectToLogin(url.pathname, Object.fromEntries(url.searchParams.entries()));
  const { myApps, allApps } = await loadQuery(
    {
      myApps: _thirdAppDataQuery,
      ...(me.admin ? { allApps: _thirdAppDataQuery } : {}),
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
  let otherApps: typeof myApps = [];
  // XXX zeus infers allApps as Array<{...} | undefined> when the type is actually Array<{...}> | undefined, as confirmed at runtime...
  // we check both conditions to make TS happy AND runtime happy, but don't remove the first check in that if.
  if (allApps && hasNoUndefineds(allApps))
    otherApps = allApps.filter((app) => !myApps.some((myApp) => myApp.id === app.id));

  return { apps: myApps, otherApps };
}
