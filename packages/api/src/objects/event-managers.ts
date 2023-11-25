import { builder } from '../builder.js';
import { prisma } from '../prisma.js';

export enum EventManagerPowerLevel {
  ReadOnly,
  ScanTickets,
  Edit,
  EditPermissions,
}

export const EventManagerPowerLevelType = builder.enumType(EventManagerPowerLevel, {
  name: 'EventManagerPowerLevel',
});

export const EventManagerType = builder.prismaObject('EventManager', {
  fields: (t) => ({
    canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
    canEdit: t.exposeBoolean('canEdit'),
    canEditPermissions: t.exposeBoolean('canEditPermissions'),
    event: t.relation('event'),
    user: t.relation('user'),
    power: t.field({
      type: EventManagerPowerLevelType,
      resolve({ canVerifyRegistrations, canEdit, canEditPermissions }) {
        if (canVerifyRegistrations && canEdit && canEditPermissions)
          return EventManagerPowerLevel.EditPermissions;
        if (canVerifyRegistrations && canEdit) return EventManagerPowerLevel.Edit;
        if (canVerifyRegistrations) return EventManagerPowerLevel.ScanTickets;
        return EventManagerPowerLevel.ReadOnly;
      },
    }),
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
  }),
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

builder.mutationField('deleteEventManager', (t) =>
  t.field({
    type: 'Boolean',
    args: { user: t.arg.string(), eventId: t.arg.id() },
    async authScopes(_, { eventId, user }, { user: currentUser }) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { author: true, managers: true },
      });

      // Admins can delete managers if the upstream event does not exist anymore
      if (!event) return Boolean(currentUser?.admin);

      // The author of the event can delete managers
      if (event.author?.uid === user) return true;

      // Other managers that have the canEditPermissions permission, or admins, can delete managers
      return Boolean(
        currentUser?.admin ||
          event.managers.some(
            ({ userId, canEditPermissions }) => currentUser?.id === userId && canEditPermissions,
          ),
      );
    },
    async resolve(_, { eventId, user }) {
      await prisma.eventManager.deleteMany({ where: { eventId, user: { uid: user } } });
      return true;
    },
  }),
);
