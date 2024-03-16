import { builder, prisma } from '#lib';

import slug from 'slug';
import { TicketGroupType } from '../index.js';

builder.mutationField('upsertTicketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    args: {
      id: t.arg.id({ required: false }),
      name: t.arg.string(),
      capacity: t.arg.int({ validate: { min: 0 } }),
      eventId: t.arg.id(),
    },
    async authScopes(_, { eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { managers: { include: { user: true } } },
      });

      return event.managers.some((m) => m.user.uid === user?.uid && m.canEdit);
    },
    async resolve(query, _, { id, name, capacity, eventId }) {
      const data = {
        name,
        capacity,
        eventId,
      };
      return prisma.ticketGroup.upsert({
        ...query,
        where: { id: id ?? '', eventId },
        create: {
          ...data,
          uid: slug(name),
        },
        update: {
          ...data,
        },
      });
    },
  }),
);
