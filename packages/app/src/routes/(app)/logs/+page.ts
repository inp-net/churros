import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const _pageQuery = {
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    node: {
      id: true,
      happenedAt: true,
      user: {
        uid: true,
        fullName: true,
      },
      area: true,
      action: true,
      target: true,
      message: true,
    },
  },
};

export const load: PageLoad = async ({ fetch, parent }) => {
  const { logs } = await loadQuery({ logs: [{}, _pageQuery] }, { fetch, parent });
  return { logs };
};
