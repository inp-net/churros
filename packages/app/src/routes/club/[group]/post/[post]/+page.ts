import { loadQuery } from '$lib/zeus.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, parent }) =>
  loadQuery(
    {
      article: [
        { uid: params.post, groupUid: params.group },
        {
          title: true,
          bodyHtml: true,
          group: {
            uid: true,
            name: true,
          },
          author: {
            firstName: true,
            lastName: true,
            uid: true,
            groups: { group: { name: true, uid: true }, title: true },
          },
          event: {
            uid: true,
            title: true,
          }
        },
      ],
    },
    { fetch, parent }
  );
