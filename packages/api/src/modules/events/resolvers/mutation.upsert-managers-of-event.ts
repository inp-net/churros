import { builder, prisma } from '#lib';

import { EventManagerInput, EventManagerType, canEditManagers } from '../index.js';
// TODO remove

builder.mutationField('upsertManagersOfEvent', (t) =>
  t.prismaField({
    type: [EventManagerType],
    args: {
      eventId: t.arg.id(),
      managers: t.arg({ type: [EventManagerInput] }),
    },
    async authScopes(_, { eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { managers: true },
      });
      return canEditManagers(event, user);
    },
    async resolve(query, _, { eventId, managers }) {
      return prisma.event
        .update({
          include: {
            managers: {
              include: query.include,
            },
          },
          where: { id: eventId },
          data: {
            managers: {
              deleteMany: {},
              create: managers.map((m) => ({
                ...m,
                user: { connect: { uid: m.userUid } },
              })),
            },
          },
        })
        .managers();
    },
  }),
);
