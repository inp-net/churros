import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventManagerType } from '#modules/events/types';
import { canEditManagers, canEditManagersPrismaIncludes } from '#modules/events/utils';
import { LocalID, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('removeEventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    errors: {
      types: [Error, ZodError],
      result: {
        fields: (t) => ({
          lastManagerPowerlevelChanged: t.string({
            nullable: true,
            description:
              "Contient un message d'explication si jamais le dernier manager a dû changer de permissions afin de conserver au moins un manager avec les permissions de gestion des managers de l'événement",
            resolve: (_, __, { caveats }) => caveats[0],
          }),
        }),
      },
    },
    description: "Enlever un manager d'un événement",
    args: {
      event: t.arg({ type: LocalID }),
      user: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(eventId, 'Event') },
        include: canEditManagersPrismaIncludes,
      });
      return canEditManagers(event, user);
    },
    async resolve(query, _, args, { user, caveats }) {
      const id = ensureGlobalId(args.event, 'Event');
      await log('events', 'remove-event-manager', args, id, user);

      const { id: userId } = await prisma.user.findUniqueOrThrow({
        where: { uid: args.user },
        select: { id: true },
      });

      if ((await prisma.eventManager.count({ where: { eventId: id } })) === 2) {
        const lastManager = await prisma.eventManager.findFirstOrThrow({
          where: { eventId: id, userId: { not: userId } },
          select: { canEditPermissions: true, eventId: true, userId: true },
        });
        if (!lastManager.canEditPermissions) {
          await prisma.eventManager.update({
            where: { eventId_userId: lastManager },
            data: {
              canEdit: true,
              canEditPermissions: true,
            },
          });
          caveats.unshift(
            "Le dernier manager a été promu pour conserver au moins un manager avec les permissions de gestion des managers de l'événement",
          );
        }
      }

      if ((await prisma.eventManager.count({ where: { eventId: id } })) === 1)
        throw new GraphQLError('Un événement doit avoir au moins un manager');

      return prisma.eventManager.delete({
        ...query,
        where: {
          eventId_userId: { eventId: id, userId },
        },
      });
    },
  }),
);
