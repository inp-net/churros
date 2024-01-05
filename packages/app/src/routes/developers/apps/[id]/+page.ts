import { loadQuery } from '$lib/zeus.js';

export const _query = {
  id: true,
  name: true,
  description: true,
  allowedRedirectUris: true,
  createdAt: true,
  faviconUrl: true,
  clientId: true,
  active: true,
  website: true,
  secretLength: true,
  owner: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
};
export async function load({ parent, fetch, params }) {
  const parentData = await parent();
  return loadQuery(
    {
      thirdPartyApp: [params, _query],
    },
    {
      fetch,
      parent: async () => ({
        ...parentData,
        // XXX dunno why this is needed
        token: parentData.token!,
      }),
    },
  );
}
