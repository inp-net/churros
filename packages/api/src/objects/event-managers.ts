import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const EventManagerType = builder.prismaObject('EventManager', {
  fields: (t) => ({
    canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
    canEdit: t.exposeBoolean('canEdit'),
    canEditPermissions: t.exposeBoolean('canEditPermissions'),
    event: t.relation('event'),
    user: t.relation('user'),
  }),
});

builder.queryField('eventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    args: {
      user: t.arg.string(),
      eventId: t.arg.id(),
    },
    resolve: async (query, _, { user, eventId }) =>
      prisma.eventManager.findFirstOrThrow({ ...query, where: { user: { uid: user }, eventId } }),
  })
);

export const ManagerOfEventInput = builder.inputType('ManagerOfEventInput', {
  fields: (t) => ({
    userUid: t.field({ type: 'String' }),
    canEdit: t.field({ type: 'Boolean' }),
    canEditPermissions: t.field({ type: 'Boolean' }),
    canVerifyRegistrations: t.field({ type: 'Boolean' }),
  }),
});

builder.mutationField('upsertManagersOfEvent', (t) =>
  t.prismaField({
    type: [EventManagerType],
    args: {
      eventId: t.arg.id(),
      managers: t.arg({ type: [ManagerOfEventInput] }),
    },
    authScopes(_, { eventId }, { user }) {
      return Boolean(
        user?.managedEvents.some(
          ({ event, canEditPermissions }) => event.id === eventId && canEditPermissions
        )
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
  })
);

builder.mutationField('deleteEventManager', (t) =>
  t.field({
    type: 'Boolean',
    args: { user: t.arg.string(), eventId: t.arg.id() },
    async authScopes(_, { eventId, user }, { user: currentUser }) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { author: true },
      });

      // Admins can delete managers if the upstream event does not exist anymore
      if (!event) return Boolean(currentUser?.admin);

      // The author of the event can delete managers
      if (event.author?.uid === user) return true;

      // Other managers that have the canEditPermissions permission, or admins, can delete managers
      return Boolean(
        currentUser?.admin ||
          currentUser?.managedEvents.some(
            ({ event, canEditPermissions }) => event.id === eventId && canEditPermissions
          )
      );
    },
    async resolve(_, { eventId, user }) {
      await prisma.eventManager.deleteMany({ where: { eventId, user: { uid: user } } });
      return true;
    },
  })
);
