import { builder, fullTextSearch, prisma } from '#lib';
import {} from '#modules/global';
import { prismaQueryVisibleEvents } from '../../../permissions/events.js';
import { EventSearchResultType } from '../index.js';

builder.queryField('searchEvents', (t) =>
  t.field({
    type: [EventSearchResultType],
    args: { q: t.arg.string(), groupUid: t.arg.string({ required: false }) },
    async resolve(_, { q, groupUid }, { user }) {
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } })
        : undefined;
      return fullTextSearch('Event', q, {
        property: 'event',
        async resolveObjects(ids) {
          return prisma.event.findMany({
            where: {
              AND: [{ id: { in: ids } }, prismaQueryVisibleEvents(user)],
            },
          });
        },
        fuzzy: ['title'],
        highlight: ['title', 'description'],
        htmlHighlights: ['description'],
        additionalClauses: group
          ? {
              groupId: group.id,
            }
          : {},
      });
    },
  }),
);
