import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        {
          groupUid: params.group,
          uid: params.uid,
        },
        {
          title: true,
          visibility: true,
          id: true,
          uid: true,
          startsAt: true,
          pictureFile: true,
        },
      ],
      group: [
        { uid: params.group },
        {
          pictureFile: true,
          name: true,
          uid: true,
          id: true,
        },
      ],
    },
    { fetch, parent }
  );
