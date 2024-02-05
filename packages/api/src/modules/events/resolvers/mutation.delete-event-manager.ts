import { builder, prisma } from '#lib';

builder.mutationField('deleteEventManager', (t) =>
  t.field({
    description: 'Supprimer un manager',
    type: 'Boolean',
    args: {
      user: t.arg.string({ description: 'uid de la personne' }),
      eventId: t.arg.id({ description: "identifiant de l'évènement" }),
    },
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
