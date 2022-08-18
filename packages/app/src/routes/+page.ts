import { query } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, session }) =>
  query(
    fetch,
    {
      homepage: [
        {},
        {
          id: true,
          title: true,
          bodyHtml: true,
          publishedAt: true,
          group: { id: true, name: true },
          author: { id: true, firstname: true, lastname: true },
        },
      ],
    },
    session
  );
