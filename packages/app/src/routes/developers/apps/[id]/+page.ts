import { Selector, loadQuery } from '$lib/zeus.js';

export const _query = Selector('ThirdPartyApp')({
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
  usersCount: true,
  owner: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
  logs: [{}, { nodes: { id: true, happenedAt: true, message: true, action: true } }],
  rateLimitHits: [{}, { nodes: { date: true, count: true, queryName: true } }],
  apiUsage: [{}, { nodes: { date: true, count: true, queryName: true } }],
});
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
