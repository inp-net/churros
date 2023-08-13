import { loadQuery, Selector } from '$lib/zeus';
import { parse } from 'date-fns';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent, params }) => {
  const shownWeek = parse(params.monday, 'yyyy-MM-dd', new Date());
  shownWeek.setHours(23);
  shownWeek.setMinutes(59);
  return {
    shownWeek,
    ...(await loadQuery(
      {
        eventsInWeek: [
          { today: shownWeek.toISOString() },
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
          { now: shownWeek },
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
    )),
  };
};
