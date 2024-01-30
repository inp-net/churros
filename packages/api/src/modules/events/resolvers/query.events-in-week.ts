import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { prismaQueryVisibleEvents } from '#permissions';
import { EventFrequency, Visibility, type Event } from '@prisma/client';
import {
  addDays,
  differenceInDays,
  differenceInWeeks,
  endOfDay,
  endOfWeek,
  getDay,
  getMonth,
  getYear,
  isBefore,
  setDay,
  setMonth,
  setYear,
  startOfDay,
  startOfWeek,
  weeksToDays,
} from 'date-fns';
import { EventType } from '../index.js';
// TODO rework to events-in-range, and merge with events

builder.queryField('eventsInWeek', (t) =>
  t.prismaField({
    type: [EventType],
    args: {
      today: t.arg({ type: DateTimeScalar }),
    },
    async resolve(query, _, { today }, { user }) {
      // dateCondition is used to filter events that start in the week or end in the week
      const dateCondition = {
        OR: [
          {
            startsAt: {
              gte: startOfDay(startOfWeek(today, { weekStartsOn: 1 })),
              lte: endOfDay(endOfWeek(today, { weekStartsOn: 1 })),
            },
          },
          {
            frequency: { not: EventFrequency.Once },
            recurringUntil: {
              gte: startOfDay(startOfWeek(today, { weekStartsOn: 1 })),
            },
          },
        ],
      };

      function isRecurrentEventVisible(event: Event): boolean {
        // if the event's (original) startsAt is after today's week's start, it is not visible
        if (
          startOfWeek(event.startsAt, { weekStartsOn: 1 }) > startOfWeek(today, { weekStartsOn: 1 })
        )
          return false;

        if (event.recurringUntil) return isBefore(today, event.recurringUntil);
        return true;
      }

      function fixRecurrentEventDates(event: Event): Event {
        // eslint-disable-next-line prefer-const
        let { startsAt, endsAt, frequency } = event;
        switch (frequency) {
          case EventFrequency.Weekly: {
            const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
            const dayDelta = differenceInDays(todayWeek, startsAt);
            startsAt = addDays(startsAt, dayDelta);
            endsAt = addDays(endsAt, dayDelta);
            break;
          }

          case EventFrequency.Biweekly: {
            // move event from its original startsAt to today's week.
            const todayWeek = setDay(today, getDay(startsAt), { weekStartsOn: 1 });
            const weekDelta = differenceInWeeks(todayWeek, startsAt);
            if (weekDelta % 2 === 0) {
              startsAt = addDays(startsAt, weeksToDays(weekDelta));
              endsAt = addDays(endsAt, weeksToDays(weekDelta));
            }

            break;
          }

          case EventFrequency.Monthly: {
            const monthCorrect =
              getMonth(today) === getMonth(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;
            const yearCorrect =
              getYear(today) === getYear(endOfWeek(today, { weekStartsOn: 1 })) ? 0 : 1;

            startsAt = setMonth(startsAt, getMonth(today) + monthCorrect);
            endsAt = setMonth(endsAt, getMonth(today) + monthCorrect);
            startsAt = setYear(startsAt, getYear(today) + yearCorrect);
            endsAt = setYear(endsAt, getYear(today) + yearCorrect);
            break;
          }

          default: {
            break;
          }
        }

        return { ...event, startsAt, endsAt };
      }

      if (!user) {
        return prisma.event
          .findMany({
            ...query,
            where: {
              ...dateCondition,
              visibility: Visibility.Public,
            },
            orderBy: { startsAt: 'asc' },
          })
          .then((events) =>
            events
              .filter((element) => isRecurrentEventVisible(element))
              .map((e) => fixRecurrentEventDates(e)),
          );
      }

      return prisma.event
        .findMany({
          ...query,
          where: {
            ...dateCondition,
            ...prismaQueryVisibleEvents(user),
          },
          orderBy: { startsAt: 'asc' },
        })
        .then((events) =>
          events
            .filter((element) => isRecurrentEventVisible(element))
            .map((e) => fixRecurrentEventDates(e)),
        );
    },
  }),
);
