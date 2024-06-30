import { builder, prisma } from '#lib';
import { prismaQueryVisibleEvents } from '#permissions';
import { Visibility, type Prisma } from '@churros/db/prisma';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { resolveArrayConnection } from '@pothos/plugin-relay';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import groupBy from 'lodash.groupby';
import { findNextRecurringEvent } from '../index.js';
import {
  dateFromDateCursor,
  ensureCorrectDateCursor,
  EventsByDayType,
  makeEventsByDate,
} from '../types/events-by-day.js';

builder.queryField('eventsByDay', (t) =>
  t.connection({
    type: EventsByDayType,
    description:
      'Tout les évènements, regroupés par date (de début). Les curseurs (before, after) peuvent être des dates au format YYYY-MM-DD',
    args: {
      kiosk: t.arg.boolean({
        required: false,
        description:
          "N'include seulement les évènements qui veulent être inclus dans l'affichage kiosque",
      }),
    },
    async resolve(_, { first, last, before, after, kiosk }, context, info) {
      const { user } = context;

      before = ensureCorrectDateCursor(before);
      after = ensureCorrectDateCursor(after);

      const query = queryFromInfo({
        context,
        info,
        paths: [
          ['edges', 'node', 'events'],
          ['nodes', 'events'],
        ],
      });

      const constraints: Prisma.EventWhereInput = {};
      if (after) constraints.startsAt = { gte: startOfDay(dateFromDateCursor(after)) };
      if (before) constraints.startsAt = { lte: endOfDay(dateFromDateCursor(before)) };
      if (kiosk) constraints.includeInKiosk = true;

      let include: Prisma.EventInclude = {
        managers: true,
        group: true,
        tickets: true,
      };

      if ('include' in query && query.include) {
        include = { ...include, ...query.include };
        if ('managers' in query.include && query.include.managers)
          include.managers = query.include.managers;
        if ('group' in query.include && query.include.group) include.group = query.include.group;
      }

      console.log({ constraints })

      const events = await prisma.event
        .findMany({
          ...query,
          include,
          where: {
            AND: [
              constraints,
              user ? prismaQueryVisibleEvents(user) : { visibility: Visibility.Public },
            ],
          },
          orderBy: { startsAt: 'asc' },
          take: first ?? last ?? 20,
        })
        .then((events) => events.map(findNextRecurringEvent));

      return resolveArrayConnection(
        { args: { first, last } },
        Object.values(
          groupBy(events, (event) => formatISO(event.startsAt, { representation: 'date' })),
        ).map(makeEventsByDate),
      );
    },
  }),
);
