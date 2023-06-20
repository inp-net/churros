import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      barWeeks: Selector('BarWeek')({
        id: true,
        uid: true,
        startsAt: true,
        endsAt: true,
        descriptionHtml: true,
        description: true,
        groups: {
          uid: true,
          pictureFile: true,
          name: true,
        },
      }),
    },
    { fetch, parent }
  );
