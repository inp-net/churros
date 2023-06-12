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
      prisma.eventManager.findFirstOrThrow({ ...query, where: { user: {uid: user}, eventId } }),
  })
);

export const ManagerOfEventInput = builder.inputType('ManagerOfEventInput', {
  fields: (t) => ({
    userId: t.field({ type: 'ID' }),
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
              createMany: {
                data: managers,
              },
            },
          },
        })
        .managers();
    },
  })
);

builder.mutationField('updateEventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    args: {
      eventId: t.arg.id(),
      user: t.arg.string(),
      canVerifyRegistrations: t.arg.boolean(),
      canEdit: t.arg.boolean(),
      canEditPermissions: t.arg.boolean(),
    },
    authScopes: (_, { eventId }, { user: currentUser }) =>
      Boolean(
        currentUser?.admin ||
          currentUser?.managedEvents.some(
            ({ canEditPermissions, event }) => event.id === eventId && canEditPermissions
          )
      ),
    async resolve(
      query,
      _,
      { eventId, user, canVerifyRegistrations, canEdit, canEditPermissions }
    ) {
      const eventManager = await prisma.eventManager.findFirst({
        where: { eventId, user: { uid: user } },
      });
      return prisma.eventManager.upsert({
        ...query,
        where: { id: eventManager?.id },
        update: {
          canVerifyRegistrations,
          canEdit,
          canEditPermissions,
        },
        create: {
          canVerifyRegistrations,
          canEdit,
          canEditPermissions,
          event: { connect: { id: eventId } },
          user: { connect: { uid: user } },
        },
      });
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
