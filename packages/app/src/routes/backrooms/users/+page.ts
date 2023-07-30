import { Selector, loadQuery } from '$lib/zeus';

import type { PageLoad } from './$types';
export const _pageQuery = Selector('QueryAllUsersConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    node: {
      uid: true,
      firstName: true,
      lastName: true,
      fullName: true,
      pictureFile: true,
    },
  },
});

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      allUsers: [{}, _pageQuery],
    },
    { fetch, parent }
  );
