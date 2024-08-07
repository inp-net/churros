import { loadQuery } from '$lib/zeus.js';

export async function load({ fetch, parent }) {
  return loadQuery(
    {
      me: {
        boardMemberships: {
          group: {
            uid: true,
            id: true,
            name: true,
            pictureFile: true,
            pictureFileDark: true,
          },
        },
      },
    },
    { fetch, parent },
  );
}
