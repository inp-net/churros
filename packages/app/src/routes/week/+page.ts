import { loadQuery, Selector } from '$lib/zeus';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) =>
  loadQuery(
    {
      eventsInWeek: [
        { today: new Date().toISOString() },
        Selector('Event')({
          startsAt: true,
          endsAt: true,
          title: true,
          pictureFile: true,
          descriptionHtml: true,
          group: {
            uid: true,
          },
          uid: true,
        }),
      ],
      barWeekNow: [
        { now: new Date() },
        {
          descriptionHtml: true,
          groups: {
            uid: true,
            pictureFile: true,
            name: true,
          },
        },
      ],
    },
    { fetch, parent }
  );
