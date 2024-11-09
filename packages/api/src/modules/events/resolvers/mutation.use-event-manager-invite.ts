import { builder, log, prisma, publish, purgeSessionsUser, UnauthorizedError } from '#lib';
import { EventManagerType } from '#modules/events/types';
import {
  eventManagerInviteHasNoUsesLeft,
  isEventManagerInviteExpired,
} from '#modules/events/utils';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('useEventManagerInvite', (t) =>
  t.prismaField({
    type: EventManagerType,
    errors: {
      types: [Error, ZodError],
      result: {
        fields: (t) => ({
          alreadyManager: t.string({
            nullable: true,
            description:
              "Message d'explication si jamais l'on est déjà manager de l'évènement. Dans ce cas, l'objet EventManager déjà existant est renvoyé",
            resolve: (_, __, { caveats }) => caveats.at(0) || null,
          }),
        }),
      },
    },
    description: "Utilise une invitation de manager d'évènement. Renvoie l'objet manager créé",
    args: {
      code: t.arg.string({
        description: "Code d'invitation",
      }),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { code }, { user, caveats }) {
      if (!user) throw new UnauthorizedError();

      const invite = await prisma.eventManagerInvite.update({
        where: { code },
        data: {
          usedBy: {
            connect: { id: user.id },
          },
        },
        include: { event: true },
      });

      if (user.managedEvents.some(({ eventId }) => eventId === invite.eventId)) {
        caveats.unshift("Tu es déjà manager de l'évènement");
        return prisma.eventManager.findUniqueOrThrow({
          ...query,
          where: {
            eventId_userId: { eventId: invite.eventId, userId: user.id },
          },
        });
      }

      if (isEventManagerInviteExpired(invite)) throw new GraphQLError('Cette invitation a expiré');

      if (await eventManagerInviteHasNoUsesLeft(invite))
        throw new GraphQLError("Cette invitation n'a plus de place");

      await log('events', 'join-managers-via-invite', invite, invite.eventId, user);

      await purgeSessionsUser(user.uid);

      const manager = await prisma.eventManager.upsert({
        ...query,
        where: {
          eventId_userId: {
            eventId: invite.eventId,
            userId: user.id,
          },
        },
        update: {},
        create: {
          eventId: invite.eventId,
          userId: user.id,
          canEdit: invite.canEdit,
          canEditPermissions: invite.canEditPermissions,
          canVerifyRegistrations: invite.canVerifyRegistrations,
        },
      });

      publish(manager.id, 'created', manager, manager.eventId);

      return manager;
    },
  }),
);
