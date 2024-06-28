import { builder, prisma } from '#lib';

import { prismaQueryVisibleEvents } from '#permissions';
import { Visibility, type Prisma } from '@churros/db/prisma';
import { endOfDay, startOfDay } from 'date-fns';
import { EventType, findNextRecurringEvent } from '../index.js';

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
      kiosk: t.arg.boolean({
        required: false,
        description:
          "N'include seulement les évènements qui veulent être inclus dans l'affichage kiosque",
      }),
    },
    async resolve(
      query,
      _,
      { future, past, upcomingShotguns, noLinkedArticles, pastRecurring, kiosk },
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

      if (kiosk) constraints.includeInKiosk = true;

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
            AND: [constraints, prismaQueryVisibleEvents(user)],
          },
          orderBy: { startsAt: 'asc' },
        })
        .then((events) => events.map((e) => findNextRecurringEvent(e)));
    },
  }),
);
