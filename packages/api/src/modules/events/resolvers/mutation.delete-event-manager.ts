import { builder, objectValuesFlat, prisma, purgeSessionsUser } from '#lib';
import { userIsAdminOf } from '#permissions';

builder.mutationField('deleteEventManager', (t) =>
  t.field({
    type: 'Boolean',
    deprecationReason: "Use 'removeEventManager' instead",
    args: { user: t.arg.string(), eventId: t.arg.id() },
    async authScopes(_, { eventId, user }, { user: currentUser }) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { author: true, managers: true, group: true },
      });

      // Admins can delete managers if the upstream event does not exist anymore
      if (!event) return Boolean(currentUser?.admin);

      // The author of the event can delete managers
      if (event.author?.uid === user) return true;

      // Other managers that have the canEditPermissions permission, or admins, can delete managers
      return Boolean(
        userIsAdminOf(currentUser, objectValuesFlat(event.group)) ||
          event.managers.some(
            ({ userId, canEditPermissions }) => currentUser?.id === userId && canEditPermissions,
          ),
      );
    },
    async resolve(_, { eventId, user }) {
      await prisma.eventManager.deleteMany({ where: { eventId, user: { uid: user } } });
      await purgeSessionsUser(user);
      return true;
    },
  }),
);
