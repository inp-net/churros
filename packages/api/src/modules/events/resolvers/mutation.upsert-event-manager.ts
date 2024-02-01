import { builder, log, prisma } from '#lib';
import { eventManagedByUser } from '#permissions';
import { EventManagerPermissionsInput } from '../index.js';

builder.mutationField('upsertEventManager', (t) =>
  t.prismaField({
    type: 'EventManager',
    description: 'Ajouter un manager à un évènement',
    args: {
      userUid: t.arg.string({ description: 'uid de la personne à nommer manager' }),
      eventId: t.arg.id({ description: "Identifiant de l'évènement" }),
      input: t.arg({ type: EventManagerPermissionsInput, description: 'Permissions du manager' }),
    },
    async authScopes(_, { eventId }, { user }) {
      if (user?.admin) return true;
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: { managers: { include: { user: true } } },
      });
      return eventManagedByUser(event, user, { canEditPermissions: true });
    },
    async resolve(query, _, { userUid, eventId, input }, { user }) {
      await log('event', 'add-manager', { userUid, eventId, input }, eventId, user);
      const { id: userId } = await prisma.user.findUniqueOrThrow({ where: { uid: userUid } });
      return prisma.eventManager.upsert({
        ...query,
        where: {
          eventId_userId: { eventId, userId },
        },
        create: {
          ...input,
          eventId,
          userId,
        },
        update: {
          ...input,
        },
      });
    },
  }),
);
