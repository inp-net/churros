import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => loadQuery(
    {
      contributors: {
        uid: true,
        id: true,
        fullName: true,
        pictureFile: true,
      },
      group: [
        { uid: 'devs' },
        {
          uid: true,
          name: true,
          pictureFile: true,
          pictureFileDark: true,
        },
      ],
    },
    { fetch, parent },
  );
