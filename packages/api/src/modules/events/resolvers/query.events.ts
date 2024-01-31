import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { Visibility, type Prisma } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { EventType, findNextRecurringEvent } from '../index.js';
import { visibleEventsPrismaQuery } from '#permissions';

builder.queryField('events', (t) =>
  t.prismaConnection({
    type: EventType,
    cursor: 'id',
    args: {
      future: t.arg.boolean({ required: false }),
      past: t.arg.boolean({ required: false }),
      upcomingShotguns: t.arg.boolean({ required: false }),
      noLinkedArticles: t.arg.boolean({ required: false }),
      pastRecurring: t.arg.boolean({ required: false }),
    },
    async resolve(
      query,
      _,
      { future, past, upcomingShotguns, noLinkedArticles, pastRecurring },
      { user },
    ) {
      future = future ?? false;
      past = past ?? false;
      upcomingShotguns = upcomingShotguns ?? false;
      pastRecurring = pastRecurring ?? false;
      let constraints: Prisma.EventWhereInput = {};
      if (future || upcomingShotguns || pastRecurring) {
        constraints = {
          OR: [
            { startsAt: { gte: startOfDay(new Date()) } },
            // eslint-disable-next-line unicorn/no-null
            { recurringUntil: { not: null, gte: startOfDay(new Date()) } },
          ],
        };
      } else if (past) {
        constraints = {
          endsAt: { lte: endOfDay(new Date()) },
        };
      }

      if (noLinkedArticles) {
        constraints.articles = {
          none: {},
        };
      }

      if (!user) {
        return prisma.event
          .findMany({
            ...query,
            where: {
              visibility: Visibility.Public,
              ...constraints,
            },
            orderBy: { startsAt: 'asc' },
          })
          .then((events) => events.map((e) => findNextRecurringEvent(e)));
      }

      return prisma.event
        .findMany({
          ...query,
          where: {
            AND: [constraints, visibleEventsPrismaQuery(user)],
          },
          orderBy: { startsAt: 'asc' },
        })
        .then((events) => events.map((e) => findNextRecurringEvent(e)));
    },
  }),
);
