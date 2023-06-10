import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export const EventManagerType = builder.prismaNode('EventManager', {
  id: { field: 'id' },
  fields: (t) => ({
    eventId: t.exposeID('eventId'),
    userId: t.exposeID('userId'),
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
      id: t.arg.id(),
    },
    resolve: async (query, _, { id }) =>
      prisma.eventManager.findFirstOrThrow({ ...query, where: { id } }),
  })
);

builder.queryField('managersOfEvent', (t) =>
  t.prismaConnection({
    type: EventManagerType,
    cursor: 'id',
    args: {
      slug: t.arg.string(),
    },
    async resolve(query, _, { slug }) {
      return prisma.eventManager.findMany({
        ...query,
        where: { event: { slug } },
      });
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
