import { notNull } from '$lib/typing';
import { format } from 'date-fns';
import groupBy from 'lodash.groupby';
import type { AfterLoadEvent } from './$houdini';
export function _houdini_afterLoad({ data }: AfterLoadEvent) {
  const events = data.EventsPlanning.events.nodes.filter(notNull);

  return {
    ...data,
    eventsByDate: Object.fromEntries(
      Object.entries(
        groupBy(events, (e) => (e.startsAt ? format(e.startsAt, 'yyyy-MM-dd') : '')),
      ).map(([date, events]) => [date, events.map((e) => e.id)]),
    ),
    eventsByShotgun: Object.fromEntries(
      Object.entries(
        groupBy(
          events.filter((e) => e.mySoonestShotgunOpensAt),
          (e) => (e.mySoonestShotgunOpensAt ? format(e.mySoonestShotgunOpensAt, 'yyyy-MM-dd') : ''),
        ),
      ).map(([date, events]) => [date, events.map((e) => e.id)]),
    ),
  };
}
