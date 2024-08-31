import { builder, soonest } from '#lib';
import { EventType } from '#modules/events';
import { DateTimeScalar } from '#modules/global';
import { formatISO, isSameDay, isValid, parseISO } from 'date-fns';

function notNull<T>(v: T | null): v is T {
  return v !== null;
}

export type EventsByDay<TEvent extends typeof EventType.$inferType = typeof EventType.$inferType> =
  {
    events: Array<TEvent>;
    date: Date;
    id: string;
  };

export function makeEventsByDate<TEvent extends typeof EventType.$inferType>(
  events: EventsByDay<TEvent>['events'],
): EventsByDay {
  // TODO remove explicit type predicate after upgrading to typescript version idk
  const date = events.find((e): e is typeof e & { startsAt: Date } =>
    Boolean(e.startsAt),
  )!.startsAt;
  return { events, date, id: formatISO(date, { representation: 'date' }) };
}

export function dateFromDateCursor(cursor: string) {
  if (/\d{4}-\d{2}-\d{2}/.test(cursor)) return parseISO(cursor);
  return parseISO(Buffer.from(cursor, 'base64').toString().replace('OffsetConnection:', ''));
}

export function ensureCorrectDateCursor(dateOrCursor: Date | string): string;
export function ensureCorrectDateCursor(
  dateOrCursor: Date | string | null | undefined,
): string | null | undefined;
export function ensureCorrectDateCursor(dateOrCursor: unknown) {
  if (!dateOrCursor) return dateOrCursor;
  if (typeof dateOrCursor === 'string' && !/\d{4}-\d{2}-\d{2}/.test(dateOrCursor))
    return dateOrCursor;
  return Buffer.from(
    `OffsetConnection:${
      typeof dateOrCursor === 'string'
        ? dateOrCursor
        : isValid(dateOrCursor)
          ? formatISO(dateOrCursor as Date, { representation: 'date' })
          : ''
    }`,
  ).toString('base64');
}

export const EventsByDayType = builder.objectRef<EventsByDay>('EventsByDay').implement({
  fields: (t) => ({
    happening: t.field({
      type: [EventType],
      description: 'Évènements qui ont lieu (commencent) à ce jour',
      resolve: ({ date, events }) =>
        events.filter(({ startsAt }) => startsAt && isSameDay(startsAt, date)),
    }),
    shotgunning: t.field({
      type: [EventType],
      description: 'Évènements qui ont leur premier shotgun à ce jour',
      resolve: ({ date, events }) =>
        events.filter(({ tickets }) => {
          const earliestOpenTime = soonest(...tickets.map((t) => t.opensAt).filter(notNull));
          if (!earliestOpenTime) return false;
          return isSameDay(earliestOpenTime, date);
        }),
    }),
    date: t.expose('date', { type: DateTimeScalar }),
  }),
});
