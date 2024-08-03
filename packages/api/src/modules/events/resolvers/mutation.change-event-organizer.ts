import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canCreateEvents, canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID, UIDScalar } from '#modules/global';
import { ZodError } from 'zod';

builder.mutationField('changeEventOrganizer', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description: "Changer le groupe organisateur (principal) de l'événement",
    args: {
      id: t.arg({ type: LocalID }),
      group: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { id, group: groupUid }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      return canEditEvent(event, user) && canCreateEvents(user, group);
    },
    async resolve(query, _, { id, group: groupUid }, { user }) {
      id = ensureGlobalId(id, 'Event');
      await log('events', 'change-organizer', { groupUid, id }, id, user);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          group: {
            connect: { uid: groupUid },
          },
          coOrganizers: {
            disconnect: { uid: groupUid },
          },
        },
      });
    },
  }),
);
