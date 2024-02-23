import { builder, prisma } from '#lib';

import { EventManagerType, ManagerOfEventInput } from '../index.js';
// TODO remove

builder.mutationField('upsertManagersOfEvent', (t) =>
  t.prismaField({
    type: [EventManagerType],
    args: {
      eventId: t.arg.id(),
      managers: t.arg({ type: [ManagerOfEventInput] }),
    },
    async authScopes(_, { eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { managers: true },
      });
      return Boolean(
        event.managers.some(
          ({ userId, canEditPermissions }) => user?.id === userId && canEditPermissions,
        ),
      );
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
