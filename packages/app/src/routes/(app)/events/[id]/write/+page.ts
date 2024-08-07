import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        { id: params.id },
        {
          localID: true,
          pictureURL: [{ dark: false }, true],
          slug: true,
          title: true,
          visibility: true,
          frequency: true,
          id: true,
          uid: true,
          startsAt: true,
          endsAt: true,
          pictureFile: true,
          recurringUntil: true,
          location: true,
          group: {
            pictureFile: true,
            pictureFileDark: true,
            name: true,
            uid: true,
            id: true,
            studentAssociation: { school: { name: true } },
            children: {
              name: true,
              studentAssociation: { school: { name: true } },
            },
          },
        },
      ],
    },
    { fetch, parent },
  );
