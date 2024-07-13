import { loadQuery } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) =>
  loadQuery(
    {
      event: [
        {
          group: params.group,
          slug: params.uid,
        },
        {
          title: true,
          visibility: true,
          frequency: true,
          id: true,
          slug: true,
          pictureURL: [{ dark: false }, true],
          startsAt: true,
          endsAt: true,
          pictureFile: true,
          recurringUntil: true,
          location: true,
        },
      ],
      group: [
        { uid: params.group },
        {
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
      ],
    },
    { fetch, parent },
  );
