import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const pageQuery = Selector('QueryHomepageConnection')({
  pageInfo: { hasNextPage: true, endCursor: true },
  edges: {
    cursor: true,
    node: {
      uid: true,
      title: true,
      bodyHtml: true,
      visibility: true,
      publishedAt: true,
      pictureFile: true,
      group: { uid: true, name: true, pictureFile: true },
      author: { uid: true, firstName: true, lastName: true },
      links: { value: true, name: true },
    },
  },
});

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery({ homepage: [{}, pageQuery] }, { fetch, parent });
