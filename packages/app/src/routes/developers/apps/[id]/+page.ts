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
  owner: {
    id: true,
    uid: true,
    name: true,
    pictureFile: true,
    pictureFileDark: true,
  },
};
export async function load({ parent, fetch, params }) {
  return loadQuery(
    {
      thirdPartyApp: [params, _query],
    },
    { fetch, parent },
  );
}
