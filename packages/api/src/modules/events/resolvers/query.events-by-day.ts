import { builder, latest, prisma } from '#lib';
import { prismaQueryVisibleEvents } from '#permissions';
import { Visibility, type Prisma } from '@churros/db/prisma';
import { queryFromInfo } from '@pothos/plugin-prisma';
import { addDays, endOfDay, formatISO, isAfter, isBefore, startOfDay } from 'date-fns';
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
    async resolve(_, { first, before, after, kiosk }, context, info) {
      const { user } = context;

      before = ensureCorrectDateCursor(before);
      after = ensureCorrectDateCursor(after || new Date());
      const lastDate = addDays(dateFromDateCursor(after), (first ?? 20) - 1);

      const query = queryFromInfo({
        context,
        info,
        paths: [
          ['edges', 'node', 'events'],
          ['nodes', 'events'],
        ],
      });

      // get events that start up to `before` or `first` days from `after`, whichever is sooner
      const finishAt =
        before && isBefore(dateFromDateCursor(before), lastDate)
          ? dateFromDateCursor(before)
          : endOfDay(lastDate);

      const constraints: Prisma.EventWhereInput = {
        startsAt: {
          gte: startOfDay(dateFromDateCursor(after)),
          // get one day later to detect if hasNextPage
          lte: addDays(finishAt, 1),
        },
      };

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

      // const reversed = last && !first;
      const reversed = false; // TODO reverse pagination
      let events = await prisma.event.findMany({
        ...query,
        include,
        where: {
          AND: [
            constraints,
            user ? prismaQueryVisibleEvents(user) : { visibility: Visibility.Public },
          ],
        },
        orderBy: { startsAt: reversed ? 'desc' : 'asc' },
        take: 1e3, // safeguard
      });

      // if (reversed) events.reverse();
      events = events.map(findNextRecurringEvent);

      const edges = Object.values(
        groupBy(events, (event) => formatISO(event.startsAt, { representation: 'date' })),
      )
        .map(makeEventsByDate)
        .map((node) => ({ node, cursor: node.id }));
      return {
        pageInfo: {
          startCursor: edges.at(0)?.cursor ?? null,
          endCursor: edges.at(-1)?.cursor ?? null,
          hasNextPage:
            edges.length > 0 ? isAfter(latest(...edges.map((e) => e.node.date))!, finishAt) : false,
          hasPreviousPage: false, //  TODO (reverse pagination)
        },
        edges: edges.filter(({ node: { date } }) => isBefore(date, finishAt)),
      };
    },
  }),
);
