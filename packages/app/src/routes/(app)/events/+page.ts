import { loadQuery } from '$lib/zeus';
import { redirect } from '@sveltejs/kit';
import { isFuture } from 'date-fns';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
  const { eventsInWeek } = await loadQuery(
    {
      eventsInWeek: [
        {
          today: new Date(),
        },
        {
          endsAt: true,
          startsAt: true,
        },
      ],
    },
    { fetch, parent },
  );

  throw redirect(
    302,
    eventsInWeek.some((event) => isFuture(new Date(event.endsAt)))
      ? '/events/week/'
      : '/events/planning',
  );
};
